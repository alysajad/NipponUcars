import os
import io
import time
import json
import urllib.request
import urllib.error
import urllib.parse
import cloudinary
import cloudinary.uploader
import asyncio
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.environ.get("SUPABASE_URL", "")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY", "")
cloudinary.config(
    cloud_name=os.environ.get("CLOUDINARY_CLOUD_NAME", ""),
    api_key=os.environ.get("CLOUDINARY_API_KEY", ""),
    api_secret=os.environ.get("CLOUDINARY_API_SECRET", ""),
    secure=True
)

# Load model lazily to prevent OOM
REMBG_SESSION = None

# Global lock to ensure only 1 image is processed at a time (saves memory on Render Free Tier)
bg_process_lock = asyncio.Lock()

def sync_remove_background(frame_id: str, raw_url: str, inventory_id: str, frame_index: int):
    start = time.monotonic()
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
    
    try:
        # Step 1: Update DB status to 'processing'
        supabase.table("listing_frames").update({"status": "processing"}).eq("id", frame_id).execute()
        
        # Step 2: Use api4ai Native Background Removal
        api_key = 'a4a-hRWdOaPfCPZy6bLdDjXJapsJ2nzgH3jo'
        api_url = 'https://api4ai.cloud/img-bg-removal/v1/results'
        
        safe_url = raw_url.replace("/upload/", "/upload/w_1024,c_limit/")
        req_data = urllib.parse.urlencode({'url': safe_url}).encode('utf-8')
        req = urllib.request.Request(api_url, data=req_data, headers={'X-API-KEY': api_key})
        with urllib.request.urlopen(req, timeout=60) as resp:
            data = json.loads(resp.read().decode('utf-8'))
        b64_image = data['results'][0]['entities'][0]['image']
        
        import base64
        image_bytes = base64.b64decode(b64_image)
        
        # Upload processed image to Cloudinary
        upload_result = cloudinary.uploader.upload(
            image_bytes,
            folder=f"inventory/{inventory_id}",
            public_id=f"frame_{frame_index:02d}",
            resource_type="image",
            overwrite=True,
            transformation=[{"width": 1920, "crop": "limit", "background": "white", "format": "jpg"}]
        )
        processed_url = upload_result["secure_url"]
        
        # Thumb URL
        thumb_url = processed_url.replace("/upload/", "/upload/c_thumb,w_200,h_140,g_auto/")
        
        # Step 7: Update DB
        elapsed_ms = int((time.monotonic() - start) * 1000)
        supabase.table("listing_frames").update({
            "processed_url": processed_url,
            "thumb_url": thumb_url,
            "status": "done",
            "processing_ms": elapsed_ms
        }).eq("id", frame_id).execute()
        
        # Step 7b: Append to inventory table immediately
        inv_res = supabase.table("inventory").select("frames").eq("id", inventory_id).execute()
        if inv_res.data:
            current_frames = inv_res.data[0].get("frames") or []
            current_frames.append(processed_url)
            supabase.table("inventory").update({"frames": current_frames}).eq("id", inventory_id).execute()
        
    except Exception as exc:
        print(f"Error processing frame {frame_id}: {exc}")
        supabase.table("listing_frames").update({
            "status": "failed",
            "error_message": str(exc)
        }).eq("id", frame_id).execute()

async def remove_background_task(frame_id: str, raw_url: str, inventory_id: str, frame_index: int):
    # Ensure only 1 background removal process runs at a time globally
    async with bg_process_lock:
        await asyncio.to_thread(sync_remove_background, frame_id, raw_url, inventory_id, frame_index)
