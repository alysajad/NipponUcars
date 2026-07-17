import os
import uuid
import base64
from fastapi import FastAPI, HTTPException, Body, UploadFile, File, BackgroundTasks
import io
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from supabase import create_client, Client
import cloudinary
import cloudinary.uploader
from dotenv import load_dotenv
import json
import asyncio
from bg_tasks import remove_background_task
from cache import cache_get, cache_set, cache_delete, redis_client

load_dotenv()

app = FastAPI()

# Configure CORS for local development and production
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://nipponucars.pages.dev",
        "*" # Ponytail: lazy fallback for local dev networking quirks
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    if not supabase:
        return
    try:
        # Resume any stuck tasks on startup
        # Mark them as failed so the queue is clean for new uploads.
        res = supabase.table("listing_frames").select("*").in_("status", ["queued", "processing"]).execute()
        if res.data:
            print(f"[startup] Marking {len(res.data)} stuck background tasks as failed...")
            for frame in res.data:
                supabase.table("listing_frames").update({
                    "status": "failed", 
                    "error_message": "Server restarted before completion"
                }).eq("id", frame["id"]).execute()
    except Exception as e:
        print(f"[startup] Failed to clear stuck tasks: {e}")

@app.get("/health")
async def health_check():
    """Uptime monitor endpoint to keep Redis and DB connections warm."""
    status = {"status": "ok", "redis": "disconnected", "database": "disconnected"}
    
    # Check Redis
    if redis_client:
        try:
            if redis_client.ping():
                status["redis"] = "connected"
        except Exception:
            pass
            
    # Check DB
    if supabase:
        try:
            # Simple fast query to verify connection
            supabase.table("car_models").select("id").limit(1).execute()
            status["database"] = "connected"
        except Exception:
            pass
            
    return status

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
    attributes: dict = {}

@app.get("/api/models")
async def get_car_models():
    """
    Returns a list of car models available in the database.
    Used to populate the dropdown in the Sales CMS.
    """
    cached = cache_get("models:all")
    if cached:
        return cached

    if not supabase:
        # Fallback mock data if Supabase isn't configured yet
        mock_data = {
            "models": [
                {"id": "hilux", "name": "Toyota Hilux Revo", "specs": json.dumps({"variant": "2.8L Prerunner", "year": "2021", "fuel": "Diesel", "transmission": "Automatic", "km": "32,000", "engineCC": "2755", "features": ["4x4", "JBL Audio", "Ventilated Seats"]})},
                {"id": "fortuner", "name": "Toyota Fortuner", "specs": json.dumps({"variant": "2.8L Diesel", "year": "2021", "fuel": "Diesel", "transmission": "Automatic", "km": "45,000", "engineCC": "2755", "features": ["Ventilated Seats", "4x4", "Power Tailgate"]})},
                {"id": "corolla", "name": "Toyota Corolla e170", "specs": json.dumps({"variant": "1.8L Hybrid", "year": "2017", "fuel": "Hybrid", "transmission": "CVT", "km": "78,000", "engineCC": "1798", "features": ["EV Mode", "Sunroof"]})},
                {"id": "safari", "name": "Tata Safari", "specs": json.dumps({"variant": "2.0L Kryotec", "year": "2021", "fuel": "Diesel", "transmission": "Automatic", "km": "22,000", "engineCC": "1956", "features": ["Panoramic Sunroof", "JBL Audio"]})},
                {"id": "supra", "name": "Toyota GR Supra", "specs": json.dumps({"variant": "3.0L Turbo", "year": "2022", "fuel": "Petrol", "transmission": "Automatic", "km": "12,000", "engineCC": "2998", "features": ["Sport Mode", "Carbon Fiber Trim"]})}
            ]
        }
        return mock_data
    
    try:
        response = supabase.table("car_models").select("*").execute()
        result = {"models": response.data}
        cache_set("models:all", result, 300)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/inventory")
async def get_inventory():
    """
    Returns a list of cars available in the inventory.
    """
    cached = cache_get("inventory:all")
    if cached:
        return cached

    if not supabase:
        raise HTTPException(status_code=500, detail="Supabase not configured")
    
    try:
        response = supabase.table("inventory").select("*").execute()
        result = [car for car in response.data if car.get("frames")]
        cache_set("inventory:all", result, 60)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/models/bulk")
async def bulk_upload_models(file: UploadFile = File(...)):
    """
    Accepts a CSV file containing car models and bulk upserts them to the database.
    Required columns: id, name, specs.
    """
    if not supabase:
        raise HTTPException(status_code=500, detail="Database not configured")
        
    contents = await file.read()
    try:
        if not file.filename.endswith('.csv'):
            raise HTTPException(status_code=400, detail="Only CSV files are allowed")
            
        import csv
        content_str = contents.decode('utf-8')
        reader = csv.DictReader(io.StringIO(content_str))
        
        required_cols = {'id', 'name', 'specs'}
        if not reader.fieldnames or not required_cols.issubset(set(reader.fieldnames)):
            raise HTTPException(status_code=400, detail=f"File must contain columns: {', '.join(required_cols)}")
            
        records = []
        for row in reader:
            records.append({
                'id': row.get('id', ''),
                'name': row.get('name', ''),
                'specs': row.get('specs', '')
            })
            
        if not records:
            return {"status": "success", "inserted": 0, "data": []}
        
        # Upsert into supabase
        response = supabase.table("car_models").upsert(records).execute()
        cache_delete("models:all")
        return {"status": "success", "inserted": len(records), "data": response.data}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process file: {str(e)}")

class ModelPayload(BaseModel):
    name: str
    specs: str

@app.post("/api/models")
async def add_model(payload: ModelPayload):
    if not supabase:
        raise HTTPException(status_code=500, detail="Database not configured")
    try:
        import re
        model_id = re.sub(r'[^a-z0-9]', '_', payload.name.lower())
        record = {
            "id": model_id,
            "name": payload.name,
            "specs": payload.specs
        }
        response = supabase.table("car_models").upsert(record).execute()
        cache_delete("models:all")
        return {"status": "success", "data": response.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/form-schema")
async def get_form_schema():
    try:
        with open("data/form_schema.json", "r") as f:
            return json.load(f)
    except FileNotFoundError:
        return {"customFields": [], "competitors": [], "features": []}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/form-schema")
async def update_form_schema(payload: dict = Body(...)):
    try:
        # Ensure data dir exists
        import os
        os.makedirs("data", exist_ok=True)
        with open("data/form_schema.json", "w") as f:
            json.dump(payload, f, indent=2)
        return {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

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
    cache_delete("inventory:all")
    cache_delete("cms:inventory")
    cache_delete("cms:dashboard")
    return {"status": "published"}

@app.get("/api/cms/dashboard")
async def get_cms_dashboard():
    """
    Returns dashboard metrics and recent activity for the CMS.
    """
    cached = cache_get("cms:dashboard")
    if cached:
        return cached

    if not supabase:
        raise HTTPException(status_code=500, detail="Supabase not configured")
    
    try:
        # Get all inventory
        response = supabase.table("inventory").select("*").execute()
        all_cars = response.data
        
        total_inventory = len(all_cars)
        
        # Count pending certifications
        pending_certs = 0
        for car in all_cars:
            specs = {}
            try:
                specs = json.loads(car.get("specs", "{}")) if isinstance(car.get("specs"), str) else (car.get("specs") or {})
            except:
                pass
            if specs.get("status") in ["Pending Inspection", "In Prep", None, ""]:
                pending_certs += 1
        
        # Count enquiries from DB
        new_enquiries = 0
        try:
            enq_res = supabase.table("enquiries").select("id", count="exact").execute()
            new_enquiries = enq_res.count or 0
        except:
            pass

        # Count monthly sales (inventory with status=Sold)
        monthly_sales = 0
        for car in all_cars:
            specs = {}
            try:
                specs = json.loads(car.get("specs", "{}")) if isinstance(car.get("specs"), str) else (car.get("specs") or {})
            except:
                pass
            if specs.get("status") == "Sold":
                monthly_sales += 1
        
        # Recent activity (last 5 cars)
        recent_activity = []
        for car in all_cars[:5]:
            specs = {}
            try:
                specs = json.loads(car.get("specs", "{}")) if isinstance(car.get("specs"), str) else (car.get("specs") or {})
            except:
                pass
            recent_activity.append({
                "id": car.get("id"),
                "name": car.get("name"),
                "price": car.get("price"),
                "status": specs.get("status", "Available"),
                "image": car.get("frames", [None])[0] if car.get("frames") else None,
                "dateAdded": car.get("created_at", "N/A")
            })
        
        # Tasks (mock for now)
        tasks = [
            {"title": "Inspection: Vehicle Review", "subtitle": "Schedule inspection for new arrivals", "icon": "car_repair"},
            {"title": "Inventory Audit", "subtitle": "Weekly stock verification", "icon": "assignment_late"}
        ]
        
        result = {
            "stats": {
                "totalInventory": total_inventory,
                "pendingCerts": pending_certs,
                "newEnquiries": new_enquiries,
                "monthlySales": monthly_sales
            },
            "recentActivity": recent_activity,
            "tasks": tasks
        }
        cache_set("cms:dashboard", result, 30)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/cms/inventory")
async def get_cms_inventory():
    """
    Returns inventory for CMS management with all details.
    """
    cached = cache_get("cms:inventory")
    if cached:
        return cached

    if not supabase:
        raise HTTPException(status_code=500, detail="Supabase not configured")
    
    try:
        response = supabase.table("inventory").select("*").execute()
        cache_set("cms:inventory", response.data, 60)
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/cms/enquiries")
async def get_cms_enquiries(lead_type: str = None):
    """
    Returns enquiries/leads for CMS management.
    Optional filter by lead_type: 'sales' or 'valuation'.
    """
    if not supabase:
        raise HTTPException(status_code=500, detail="Supabase not configured")
    
    try:
        query = supabase.table("enquiries").select("*").order("contact_date", desc=True)
        if lead_type:
            query = query.eq("lead_type", lead_type)
        response = query.execute()
        return response.data
    except Exception as e:
        # If table doesn't exist yet (PGRST205) or other error, return empty list to not break frontend
        print(f"Error fetching enquiries: {e}")
        return []


class EnquiryPayload(BaseModel):
    customer_name: str
    customer_email: str = ""
    customer_phone: str = ""
    vehicle_interest: str = ""
    vehicle_specs: dict = {}
    priority: str = "routine"
    lead_type: str = "sales"
    notes: str = ""


@app.post("/api/cms/enquiries")
async def create_enquiry(payload: EnquiryPayload):
    """
    Creates a new enquiry / sales lead.
    """
    if not supabase:
        raise HTTPException(status_code=500, detail="Supabase not configured")
    
    try:
        record = {
            "customer_name": payload.customer_name,
            "customer_email": payload.customer_email,
            "customer_phone": payload.customer_phone,
            "vehicle_interest": payload.vehicle_interest,
            "vehicle_specs": payload.vehicle_specs,
            "priority": payload.priority,
            "lead_type": payload.lead_type,
            "notes": payload.notes,
            "status": "new"
        }
        response = supabase.table("enquiries").insert(record).execute()
        cache_delete("cms:dashboard")
        return {"status": "success", "data": response.data[0] if response.data else {}}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/cms/certifications")
async def get_cms_certifications():
    """
    Returns certification pipeline records.
    """
    cached = cache_get("cms:certifications")
    if cached:
        return cached

    if not supabase:
        raise HTTPException(status_code=500, detail="Supabase not configured")
    
    try:
        response = supabase.table("certifications").select("*").order("started_at", desc=True).execute()
        cache_set("cms:certifications", response.data, 60)
        return response.data
    except Exception as e:
        print(f"Error fetching certifications: {e}")
        return []


class CertificationPayload(BaseModel):
    inventory_id: str = ""
    vehicle_name: str
    vin: str = ""
    technician: str
    points_checked: int = 0
    total_points: int = 203
    stage: str = "inspection"


@app.post("/api/cms/certifications")
async def create_certification(payload: CertificationPayload):
    """
    Creates a new certification pipeline entry.
    """
    if not supabase:
        raise HTTPException(status_code=500, detail="Supabase not configured")
    
    try:
        record = {
            "vehicle_name": payload.vehicle_name,
            "vin": payload.vin,
            "technician": payload.technician,
            "points_checked": payload.points_checked,
            "total_points": payload.total_points,
            "stage": payload.stage,
            "status": "in-progress"
        }
        if payload.inventory_id:
            record["inventory_id"] = payload.inventory_id
        response = supabase.table("certifications").insert(record).execute()
        cache_delete("cms:certifications")
        cache_delete("cms:dashboard")
        return {"status": "success", "data": response.data[0] if response.data else {}}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

