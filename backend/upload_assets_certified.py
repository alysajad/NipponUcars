import os
import re
import urllib.request
import cloudinary
import cloudinary.uploader
from dotenv import load_dotenv
import glob

# Load Cloudinary creds from .env
load_dotenv()

cloudinary.config(
    cloud_name=os.environ.get("CLOUDINARY_CLOUD_NAME", ""),
    api_key=os.environ.get("CLOUDINARY_API_KEY", ""),
    api_secret=os.environ.get("CLOUDINARY_API_SECRET", "")
)

FRONTEND_DIR = "../frontend/src/app"

def process_files():
    # Find all JSX files in the frontend
    jsx_files = glob.glob(f"{FRONTEND_DIR}/**/*.jsx", recursive=True)
    
    # Pattern to match lh3.googleusercontent.com urls
    pattern = r'(https://lh3\.googleusercontent\.com/[a-zA-Z0-9_\-\/]+)'
    
    total_replaced = 0

    for file_path in jsx_files:
        with open(file_path, "r") as f:
            content = f.read()

        urls = list(set(re.findall(pattern, content)))
        if not urls:
            continue
            
        print(f"Found {len(urls)} URLs in {file_path}")
        
        new_content = content
        
        # Determine a UNIQUE prefix for this file to avoid overwriting on Cloudinary
        # e.g. "certified_page" or "sell_page" or "page"
        rel_path = os.path.relpath(file_path, FRONTEND_DIR)
        safe_name = rel_path.replace("/", "_").replace(".jsx", "")
        
        for i, url in enumerate(urls):
            print(f"Processing: {url}")
            try:
                temp_file = f"temp_upload_{safe_name}_{i}.jpg"
                urllib.request.urlretrieve(url, temp_file)
                
                public_id = f"utrust_asset_{safe_name}_{i}"
                res = cloudinary.uploader.upload(
                    temp_file,
                    folder="utrust_assets",
                    public_id=public_id,
                    resource_type="image",
                    overwrite=True
                )
                
                # Fetch optimized auto-format, auto-quality image URL from Cloudinary
                secure_url = res["secure_url"]
                optimized_url = secure_url.replace("/upload/", "/upload/f_auto,q_auto/")
                
                print(f" -> Uploaded: {optimized_url}")
                
                new_content = new_content.replace(url, optimized_url)
                
                os.remove(temp_file)
                total_replaced += 1
            except Exception as e:
                print(f"Failed to process {url}: {e}")
                
        if new_content != content:
            with open(file_path, "w") as f:
                f.write(new_content)
            print(f"Updated {file_path} successfully.")

    print(f"Process complete. Total URLs replaced: {total_replaced}")

if __name__ == "__main__":
    process_files()
