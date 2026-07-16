import os
import json
import uuid
import cloudinary
import cloudinary.uploader
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.environ.get("SUPABASE_URL", "")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY", "")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

cloudinary.config(
    cloud_name=os.environ.get("CLOUDINARY_CLOUD_NAME", ""),
    api_key=os.environ.get("CLOUDINARY_API_KEY", ""),
    api_secret=os.environ.get("CLOUDINARY_API_SECRET", "")
)

def add_corolla():
    print("Uploading Corolla image...")
    res = cloudinary.uploader.upload(
        "/home/sajad-hussain/.gemini/antigravity-ide/brain/f6ddecd9-2404-46c1-9bff-b3d71a379903/toyota_corolla_1784192602397.png",
        folder="inventory/corolla",
        public_id="corolla_main"
    )
    img_url = res["secure_url"]
    
    car_id = f"car_{uuid.uuid4().hex[:8]}"
    
    specs = {
        "brand": "Toyota",
        "location": "Mumbai",
        "year": "2022",
        "fuel": "Hybrid",
        "transmission": "Automatic",
        "km": "15000",
        "owner": "1st Owner",
        "insurance": "Comprehensive",
        "rto": "MH-01",
        "engineCC": "1798",
        "groundClearance": "150",
        "bootSpace": "470",
        "mileage": "23.0",
        "features": ["Airbags", "ABS", "Touchscreen", "Sunroof", "Hybrid Tech"],
        "variant": "1.8L Hybrid Premium"
    }
    
    supabase.table("inventory").insert({
        "id": car_id,
        "name": "Toyota Corolla",
        "price": "₹ 18,50,000",
        "desc": "Pristine Toyota Corolla Hybrid. Exceptional fuel economy and luxury.",
        "frames": [img_url],
        "specs": json.dumps(specs)
    }).execute()
    print(f"Added Corolla: {car_id}, Image: {img_url}")
    return car_id, img_url

def add_camry():
    img_url = "https://lh3.googleusercontent.com/aida-public/AB6AXuCGFxoh2mneaobBv6WPVob_UJbAC59RJ3Yla86l1M6s63t0atLMVb_Sxy4HV9ADWgq24_IJcnlAdSDzG55nBTsHTqacfOjv6rnZ-XQ6N1y3xaWwZwpQh7oLv5V42oYfK--1Q6VvY7zYRy_DK3Mrb364kgBw5m8qRVX7MZxlmjucByYyC1TgtFQk24CmxLNtL4ukg_3cd5ZQfnlP6JqXur4nwqFl_JGbC1TtmF-xDQ5X3dSZzQWkqh1-4Q"
    
    car_id = f"car_{uuid.uuid4().hex[:8]}"
    
    specs = {
        "brand": "Toyota",
        "location": "Delhi",
        "year": "2020",
        "fuel": "Hybrid",
        "transmission": "Automatic",
        "km": "28000",
        "owner": "1st Owner",
        "insurance": "Comprehensive",
        "rto": "DL-04",
        "engineCC": "2487",
        "groundClearance": "160",
        "bootSpace": "524",
        "mileage": "23.27",
        "features": ["9 Airbags", "Ventilated Seats", "Touchscreen", "HUD", "Hybrid Tech"],
        "variant": "2.5L Luxury Sedan"
    }
    
    supabase.table("inventory").insert({
        "id": car_id,
        "name": "Toyota Camry",
        "price": "₹ 25,00,000",
        "desc": "Luxurious Toyota Camry Hybrid. Ultimate comfort and style.",
        "frames": [img_url],
        "specs": json.dumps(specs)
    }).execute()
    print(f"Added Camry: {car_id}")
    return car_id

if __name__ == "__main__":
    corolla_id, corolla_img = add_corolla()
    camry_id = add_camry()
    
    # Get Fortuner ID
    res = supabase.table("inventory").select("id").ilike("name", "%Fortuner%").execute()
    fortuner_id = res.data[0]["id"]
    
    print(f"\n--- IDS FOR FRONTEND ---")
    print(f"Fortuner ID: {fortuner_id}")
    print(f"Corolla ID: {corolla_id}")
    print(f"Camry ID: {camry_id}")
    print(f"Corolla Img: {corolla_img}")
