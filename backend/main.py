import os
import uuid
import base64
from fastapi import FastAPI, HTTPException, Body, UploadFile, File, BackgroundTasks
import pandas as pd
import io
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from supabase import create_client, Client
import cloudinary
import cloudinary.uploader
from dotenv import load_dotenv
from sse_starlette.sse import EventSourceResponse
import redis
import json
import asyncio
from bg_tasks import remove_background_task

load_dotenv()

app = FastAPI()

# Configure CORS for local development and production
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://nipponucars.pages.dev",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load environment variables
SUPABASE_URL = os.environ.get("SUPABASE_URL", "")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY", "")

# Initialize Supabase client
supabase: Client = None
if SUPABASE_URL and SUPABASE_KEY:
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

REDIS_URL = os.environ.get("REDIS_URL", "redis://localhost:6379/0")
redis_client = redis.from_url(REDIS_URL)

# Configure Cloudinary
cloudinary.config(
    cloud_name=os.environ.get("CLOUDINARY_CLOUD_NAME", ""),
    api_key=os.environ.get("CLOUDINARY_API_KEY", ""),
    api_secret=os.environ.get("CLOUDINARY_API_SECRET", "")
)

class CarPayload(BaseModel):
    name: str
    desc: str
    specs: str
    price: str
    attributes: dict = {}

@app.get("/api/models")
async def get_car_models():
    """
    Returns a list of car models available in the database.
    Used to populate the dropdown in the Sales CMS.
    """
    if not supabase:
        # Fallback mock data if Supabase isn't configured yet
        return {
            "models": [
                {"id": "hilux", "name": "Toyota Hilux Revo", "specs": json.dumps({"variant": "2.8L Prerunner", "year": "2021", "fuel": "Diesel", "transmission": "Automatic", "km": "32,000", "engineCC": "2755", "features": ["4x4", "JBL Audio", "Ventilated Seats"]})},
                {"id": "fortuner", "name": "Toyota Fortuner", "specs": json.dumps({"variant": "2.8L Diesel", "year": "2021", "fuel": "Diesel", "transmission": "Automatic", "km": "45,000", "engineCC": "2755", "features": ["Ventilated Seats", "4x4", "Power Tailgate"]})},
                {"id": "corolla", "name": "Toyota Corolla e170", "specs": json.dumps({"variant": "1.8L Hybrid", "year": "2017", "fuel": "Hybrid", "transmission": "CVT", "km": "78,000", "engineCC": "1798", "features": ["EV Mode", "Sunroof"]})},
                {"id": "safari", "name": "Tata Safari", "specs": json.dumps({"variant": "2.0L Kryotec", "year": "2021", "fuel": "Diesel", "transmission": "Automatic", "km": "22,000", "engineCC": "1956", "features": ["Panoramic Sunroof", "JBL Audio"]})},
                {"id": "supra", "name": "Toyota GR Supra", "specs": json.dumps({"variant": "3.0L Turbo", "year": "2022", "fuel": "Petrol", "transmission": "Automatic", "km": "12,000", "engineCC": "2998", "features": ["Sport Mode", "Carbon Fiber Trim"]})}
            ]
        }
    
    try:
        response = supabase.table("car_models").select("*").execute()
        return {"models": response.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/inventory")
async def get_inventory():
    """
    Returns a list of cars available in the inventory.
    """
    if not supabase:
        raise HTTPException(status_code=500, detail="Supabase not configured")
    
    try:
        response = supabase.table("inventory").select("*").execute()
        return [car for car in response.data if car.get("frames")]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/models/bulk")
async def bulk_upload_models(file: UploadFile = File(...)):
    """
    Accepts a CSV or Excel file containing car models and bulk upserts them to the database.
    Required columns: id, name, specs.
    """
    if not supabase:
        raise HTTPException(status_code=500, detail="Database not configured")
        
    contents = await file.read()
    try:
        if file.filename.endswith('.csv'):
            df = pd.read_csv(io.BytesIO(contents))
        elif file.filename.endswith(('.xlsx', '.xls')):
            df = pd.read_excel(io.BytesIO(contents))
        else:
            raise HTTPException(status_code=400, detail="Only CSV or Excel files are allowed")
            
        # Ensure correct columns exist
        required_cols = {'id', 'name', 'specs'}
        if not required_cols.issubset(set(df.columns)):
            raise HTTPException(status_code=400, detail=f"File must contain columns: {', '.join(required_cols)}")
            
        # Replace NaN with empty strings and convert to dict
        df = df.fillna('')
        records = df[['id', 'name', 'specs']].to_dict(orient='records')
        
        # Upsert into supabase
        response = supabase.table("car_models").upsert(records).execute()
        return {"status": "success", "inserted": len(records), "data": response.data}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process file: {str(e)}")

@app.post("/api/cars")
async def init_car(car: CarPayload):
    """
    Initializes a new car entry in the database.
    Frames will be uploaded separately to /api/cars/{id}/frames.
    """
    car_id = f"car_{uuid.uuid4().hex[:8]}"

    record = {
        "id": car_id,
        "name": car.name,
        "desc": car.desc,
        "specs": json.dumps(car.attributes) if car.attributes else car.specs,
        "price": car.price,
        "frames": [] # Start empty
    }

    if supabase:
        try:
            supabase.table("inventory").insert(record).execute()
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    else:
        raise HTTPException(status_code=500, detail="Supabase not configured")

    return {"status": "success", "id": car_id}

@app.post("/api/cars/{car_id}/frames")
async def upload_frames(car_id: str, background_tasks: BackgroundTasks, files: list[UploadFile] = File(...)):
    if not supabase:
        raise HTTPException(status_code=500, detail="Supabase not configured")
        
    results = []
    # In a real app we'd map these sequentially, but for now we'll just queue them all
    # We will get the current count of frames to determine the frame index
    res = supabase.table("listing_frames").select("id", count="exact").eq("inventory_id", car_id).execute()
    start_index = res.count if res.count else 0

    for i, file in enumerate(files):
        frame_idx = start_index + i
        
        # 1. Upload raw to Cloudinary immediately
        contents = await file.read()
        raw_res = cloudinary.uploader.upload(
            contents,
            folder=f"inventory/{car_id}/raw",
            public_id=f"frame_{frame_idx:02d}",
            resource_type="image",
            overwrite=True
        )
        raw_url = raw_res["secure_url"]

        # 2. Insert frame record in DB
        frame_res = supabase.table("listing_frames").insert({
            "inventory_id": car_id,
            "frame_index": frame_idx,
            "raw_url": raw_url,
            "status": "queued"
        }).execute()
        frame_id = frame_res.data[0]["id"]

        # 3. Enqueue FastAPI background task
        background_tasks.add_task(
            remove_background_task,
            frame_id=frame_id,
            raw_url=raw_url,
            inventory_id=car_id,
            frame_index=frame_idx
        )
        
        results.append({"frame_id": frame_id})

    return {"car_id": car_id, "queued": len(results), "frames": results}

@app.get("/api/cars/{car_id}/status")
async def car_status(car_id: str):
    if not supabase:
        raise HTTPException(status_code=500, detail="Supabase not configured")
    
    res = supabase.table("listing_frames").select("status").eq("inventory_id", car_id).execute()
    frames = res.data
    total = len(frames)
    done = sum(1 for f in frames if f["status"] == "done")
    
    return {"status": "done" if total > 0 and done == total else "processing", "total_done": done, "total_frames": total}

@app.post("/api/cars/{car_id}/publish")
async def publish_listing(car_id: str):
    if not supabase:
        raise HTTPException(status_code=500, detail="Supabase not configured")
        
    # Gather all finished frames and update the main inventory record
    frames_res = supabase.table("listing_frames").select("processed_url").eq("inventory_id", car_id).eq("status", "done").order("frame_index").execute()
    urls = [f["processed_url"] for f in frames_res.data]
    
    if not urls:
        raise HTTPException(status_code=400, detail="No processed frames available")
        
    supabase.table("inventory").update({"frames": urls}).eq("id", car_id).execute()
    return {"status": "published"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
