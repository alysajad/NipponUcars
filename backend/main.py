import os
import uuid
import base64
from fastapi import FastAPI, HTTPException, Body, UploadFile, File
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
from celery import Celery as _Celery

# Lazy reference to the Celery app — we use send_task() so we don't import
# workers.bg_removal (which loads the heavy rembg model) into the FastAPI process.
_celery_app = _Celery(
    "bg_removal",
    broker=os.environ.get("REDIS_URL", "redis://localhost:6379/0"),
)

load_dotenv()

app = FastAPI()

# Configure CORS to allow frontend connections
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
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
                {"id": "hilux", "name": "Toyota Hilux Revo", "specs": "2.8L Prerunner"},
                {"id": "fortuner", "name": "Toyota Fortuner", "specs": "2.8L Diesel | 201 BHP"},
                {"id": "corolla", "name": "Toyota Corolla e170", "specs": "1.8L Hybrid | 121 BHP"},
                {"id": "land-cruiser", "name": "Toyota Land Cruiser", "specs": "3.3L Twin-Turbo V6"},
                {"id": "supra", "name": "Toyota GR Supra", "specs": "3.0L Turbo Inline-6"}
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
        return response.data
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
        "specs": car.specs,
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
async def upload_frames(car_id: str, files: list[UploadFile] = File(...)):
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

        # 3. Enqueue Celery task
        task = _celery_app.send_task(
            "workers.bg_removal.remove_background_task",
            kwargs={
                "frame_id": frame_id,
                "raw_url": raw_url,
                "inventory_id": car_id,
                "frame_index": frame_idx
            }
        )
        
        # Update job_id in DB
        supabase.table("listing_frames").update({"job_id": task.id}).eq("id", frame_id).execute()
        
        results.append({"frame_id": frame_id, "job_id": task.id})

    return {"car_id": car_id, "queued": len(results), "frames": results}

@app.get("/api/cars/{car_id}/progress")
async def job_progress(car_id: str):
    async def event_stream():
        pubsub = redis_client.pubsub()
        pubsub.subscribe(f"inventory:{car_id}:progress")
        try:
            while True:
                message = pubsub.get_message(ignore_subscribe_messages=True, timeout=1.0)
                if message is not None:
                    yield {"data": message["data"].decode("utf-8")}
                await asyncio.sleep(0.1)
        finally:
            pubsub.unsubscribe(f"inventory:{car_id}:progress")

    return EventSourceResponse(event_stream())

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
