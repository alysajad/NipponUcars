import os
import io
import time
from dotenv import load_dotenv
import urllib.request
import urllib.parse
import json
import cloudinary
import cloudinary.uploader
from supabase import create_client, Client

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


def process_image(url, inventory_id, index):
    safe_url = url.replace("/upload/", "/upload/w_1024,c_limit/")
    print(f"  Sending request to api4ai for {safe_url}...")
    
    API_KEY = 'a4a-hRWdOaPfCPZy6bLdDjXJapsJ2nzgH3jo'
    API_URL = 'https://api4ai.cloud/img-bg-removal/v1/results'
    
    req_data = urllib.parse.urlencode({'url': safe_url}).encode('utf-8')
    req = urllib.request.Request(API_URL, data=req_data, headers={'X-API-KEY': API_KEY})
    with urllib.request.urlopen(req, timeout=60) as resp:
        data = json.loads(resp.read().decode('utf-8'))
    b64_image = data['results'][0]['entities'][0]['image']
    
    import base64
    image_bytes = base64.b64decode(b64_image)
    
    print(f"  Uploading to Cloudinary...")
    upload_result = cloudinary.uploader.upload(
        image_bytes,
        folder=f"inventory/{inventory_id}",
        public_id=f"frame_{index:02d}",
        resource_type="image",
        overwrite=True,
        transformation=[{"width": 1920, "crop": "limit", "background": "white", "format": "jpg"}]
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
