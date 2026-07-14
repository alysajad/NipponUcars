import os
from dotenv import load_dotenv
import cloudinary
import cloudinary.uploader
from PIL import Image
from supabase import create_client, Client
from rembg import new_session, remove
import io

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
session = new_session("u2netp")

car_id = "car_1420fd3f"

print("Removing background for Innova...")
raw_image = Image.open("innova.jpg").convert("RGBA")
removed = remove(raw_image, session=session)

white_canvas = Image.new("RGBA", removed.size, (255, 255, 255, 255))
white_canvas.paste(removed, mask=removed.split()[3])
final = white_canvas.convert("RGB")

buffer = io.BytesIO()
final.save(buffer, format="JPEG", quality=88, optimize=True)
buffer.seek(0)

print("Uploading to Cloudinary...")
upload_result = cloudinary.uploader.upload(
    buffer,
    folder=f"inventory/{car_id}",
    public_id="frame_00",
    resource_type="image",
    overwrite=True,
    transformation=[{"width": 1920, "crop": "limit"}]
)

processed_url = upload_result["secure_url"]

print("Updating Supabase...")
supabase.table("inventory").update({"frames": [processed_url]}).eq("id", car_id).execute()
print("Done!")
