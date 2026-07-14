import os
import io
import time
from dotenv import load_dotenv
import requests
import cloudinary
import cloudinary.uploader
from PIL import Image
from supabase import create_client, Client
from rembg import new_session, remove

load_dotenv()

SUPABASE_URL = os.environ.get("SUPABASE_URL", "")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY", "")

cloudinary.config(
    cloud_name=os.environ.get("CLOUDINARY_CLOUD_NAME", ""),
    api_key=os.environ.get("CLOUDINARY_API_KEY", ""),
    api_secret=os.environ.get("CLOUDINARY_API_SECRET", ""),
    secure=True
)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

print("Loading rembg model...")
session = new_session("u2netp")
print("Model ready.")

def process_image(url, inventory_id, index):
    print(f"  Downloading {url}...")
    headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'}
    response = requests.get(url, headers=headers, timeout=30)
    response.raise_for_status()
    raw_image = Image.open(io.BytesIO(response.content)).convert("RGBA")
    
    print(f"  Removing background...")
    removed = remove(raw_image, session=session)
    
    white_canvas = Image.new("RGBA", removed.size, (255, 255, 255, 255))
    white_canvas.paste(removed, mask=removed.split()[3])
    final = white_canvas.convert("RGB")
    
    buffer = io.BytesIO()
    final.save(buffer, format="JPEG", quality=88, optimize=True)
    buffer.seek(0)
    
    print(f"  Uploading to Cloudinary...")
    upload_result = cloudinary.uploader.upload(
        buffer,
        folder=f"inventory/{inventory_id}",
        public_id=f"frame_{index:02d}",
        resource_type="image",
        overwrite=True,
        transformation=[{"width": 1920, "crop": "limit"}]
    )
    return upload_result["secure_url"]

# Fetch inventory
response = supabase.table("inventory").select("*").execute()
inventory = response.data

for car in inventory:
    # Only process cars whose frames are wikimedia images (unprocessed)
    frames = car.get("frames") or []
    if any("wikimedia.org" in f for f in frames):
        print(f"\nProcessing {car['name']} ({car['id']})...")
        new_frames = []
        for i, f_url in enumerate(frames):
            try:
                processed_url = process_image(f_url, car["id"], i)
                new_frames.append(processed_url)
            except Exception as e:
                print(f"  Failed on frame {i}: {e}")
                new_frames.append(f_url) # fallback
        
        # Update DB
        supabase.table("inventory").update({"frames": new_frames}).eq("id", car["id"]).execute()
        print(f"Successfully updated {car['name']}!")

print("\nAll done!")
