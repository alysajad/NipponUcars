import os
import cloudinary
import cloudinary.uploader
from dotenv import load_dotenv

load_dotenv()

cloudinary.config(
    cloud_name=os.environ.get("CLOUDINARY_CLOUD_NAME", ""),
    api_key=os.environ.get("CLOUDINARY_API_KEY", ""),
    api_secret=os.environ.get("CLOUDINARY_API_SECRET", "")
)

print("Uploading hero image...")
res = cloudinary.uploader.upload(
    "/home/sajad-hussain/.gemini/antigravity-ide/brain/f6ddecd9-2404-46c1-9bff-b3d71a379903/hero_utrust_1784193280681.png",
    folder="utrust_assets/hero",
    public_id="hero_main_new"
)

# Fetch optimized auto-format, auto-quality image URL from Cloudinary
secure_url = res["secure_url"]
optimized_url = secure_url.replace("/upload/", "/upload/f_auto,q_auto/")

print(f"Hero Image Uploaded: {optimized_url}")
