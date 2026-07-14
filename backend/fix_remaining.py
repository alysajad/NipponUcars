import os
import io
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
session = new_session("u2netp")

def process_image(url, inventory_id):
    headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0)'}
    response = requests.get(url, headers=headers, timeout=30)
    response.raise_for_status()
    raw_image = Image.open(io.BytesIO(response.content)).convert("RGBA")
    removed = remove(raw_image, session=session)
    
    white_canvas = Image.new("RGBA", removed.size, (255, 255, 255, 255))
    white_canvas.paste(removed, mask=removed.split()[3])
    final = white_canvas.convert("RGB")
    
    buffer = io.BytesIO()
    final.save(buffer, format="JPEG", quality=88, optimize=True)
    buffer.seek(0)
    
    upload_result = cloudinary.uploader.upload(
        buffer,
        folder=f"inventory/{inventory_id}",
        public_id="frame_00",
        resource_type="image",
        overwrite=True,
        transformation=[{"width": 1920, "crop": "limit"}]
    )
    return upload_result["secure_url"]

cars = {
    "car_1420fd3f": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/Toyota_Innova_Zenix_2.0_V_%28III%29_%E2%80%93_f_22032025.jpg/1280px-Toyota_Innova_Zenix_2.0_V_%28III%29_%E2%80%93_f_22032025.jpg",
    "car_941bb970": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/92/2021_%C5%A0koda_Slavia_1.5_TSI_Style_%28India%29_front_view.png/1280px-2021_%C5%A0koda_Slavia_1.5_TSI_Style_%28India%29_front_view.png"
}

for car_id, url in cars.items():
    try:
        processed_url = process_image(url, car_id)
        supabase.table("inventory").update({"frames": [processed_url]}).eq("id", car_id).execute()
        print(f"Successfully processed {car_id}")
    except Exception as e:
        print(f"Failed for {car_id}: {e}")
