import os
import io
import time
import json
import requests
import cloudinary
import cloudinary.uploader
import asyncio
from PIL import Image
import pillow_avif
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
    # Lazy import to prevent memory spike on Uvicorn startup
    from rembg import new_session, remove
    
    global REMBG_SESSION
    if REMBG_SESSION is None:
        print("[bg_task] Loading u2netp model...")
        REMBG_SESSION = new_session("u2netp")
        print("[bg_task] Model ready.")

    start = time.monotonic()
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
    
    try:
        # Step 1: Update DB status to 'processing'
        supabase.table("listing_frames").update({"status": "processing"}).eq("id", frame_id).execute()
        
        # Step 2: Download raw image from Cloudinary
        # ponytail: downsize via Cloudinary URL to prevent Render Free Tier OOM from massive smartphone JPEGs
        safe_url = raw_url.replace("/upload/", "/upload/w_1024,c_limit/")
        response = requests.get(safe_url, timeout=30)
        response.raise_for_status()
        raw_image = Image.open(io.BytesIO(response.content)).convert("RGBA")
        
        # Step 3: Remove background
        removed = remove(raw_image, session=REMBG_SESSION)
        
        # Step 4: Composite onto white canvas
        white_canvas = Image.new("RGBA", removed.size, (255, 255, 255, 255))
        white_canvas.paste(removed, mask=removed.split()[3])
        final = white_canvas.convert("RGB")
        
        # Step 5: Convert to bytes
        buffer = io.BytesIO()
        final.save(buffer, format="JPEG", quality=88, optimize=True)
        buffer.seek(0)
        
        # Step 6: Upload processed image to Cloudinary
        upload_result = cloudinary.uploader.upload(
            buffer,
            folder=f"inventory/{inventory_id}",
            public_id=f"frame_{frame_index:02d}",
            resource_type="image",
            overwrite=True,
            transformation=[{"width": 1920, "crop": "limit"}]
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
