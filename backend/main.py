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

load_dotenv()

app = FastAPI()

# Configure CORS for local development with Next.js
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
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
    frames: list[str]  # List of base64 encoded strings

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
async def publish_car(car: CarPayload):
    """
    Receives a new car entry with 36 base64 images.
    Uploads images to Cloudinary, then stores the car metadata and image URLs in Supabase.
    """
    if len(car.frames) != 36:
        raise HTTPException(status_code=400, detail="Exactly 36 frames are required.")

    car_id = f"car_{uuid.uuid4().hex[:8]}"
    uploaded_urls = []

    # 1. Upload images to Cloudinary
    try:
        for idx, frame_b64 in enumerate(car.frames):
            # Cloudinary accepts base64 directly
            res = cloudinary.uploader.upload(
                frame_b64,
                folder=f"inventory/{car_id}",
                public_id=f"frame_{idx:02d}"
            )
            uploaded_urls.append(res.get("secure_url"))
    except Exception as e:
        print(f"Cloudinary upload failed: {e}")
        # For local testing without Cloudinary keys, we mock the URLs
        if not os.environ.get("CLOUDINARY_API_KEY"):
            uploaded_urls = car.frames
        else:
            raise HTTPException(status_code=500, detail="Failed to upload images to Cloudinary")

    # 2. Save metadata to Supabase
    record = {
        "id": car_id,
        "name": car.name,
        "desc": car.desc,
        "specs": car.specs,
        "price": car.price,
        "frames": uploaded_urls
    }

    if supabase:
        try:
            supabase.table("inventory").insert(record).execute()
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    else:
        raise HTTPException(status_code=500, detail="Supabase not configured")

    return {"status": "success", "car": record}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
