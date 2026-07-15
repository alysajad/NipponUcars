import os
import re
import urllib.request
import cloudinary
import cloudinary.uploader
from dotenv import load_dotenv

# Load Cloudinary creds from .env
load_dotenv()

cloudinary.config(
    cloud_name=os.environ.get("CLOUDINARY_CLOUD_NAME", ""),
    api_key=os.environ.get("CLOUDINARY_API_KEY", ""),
    api_secret=os.environ.get("CLOUDINARY_API_SECRET", "")
)

PAGE_JSX = "../frontend/src/app/inventory/[id]/page.jsx"

def process_file():
    if not os.path.exists(PAGE_JSX):
        print(f"File not found: {PAGE_JSX}")
        return

    with open(PAGE_JSX, "r") as f:
        content = f.read()

    # Find all unsplash urls
    pattern = r'(https://images\.unsplash\.com/photo-[a-zA-Z0-9\-]+\?[a-zA-Z0-9=&]+)'
    urls = list(set(re.findall(pattern, content)))
    
    if not urls:
        print("No Unsplash URLs found.")
        return

    print(f"Found {len(urls)} unique Unsplash URLs. Uploading to Cloudinary...")

    new_content = content
    for i, url in enumerate(urls):
        print(f"Processing [{i+1}/{len(urls)}]: {url}")
        try:
            # Download temporarily
            temp_file = f"temp_upload_{i}.jpg"
            urllib.request.urlretrieve(url, temp_file)
            
            # Upload to cloudinary
            public_id = f"competitor_asset_{i}"
            res = cloudinary.uploader.upload(
                temp_file,
                folder="inventory/competitors",
                public_id=public_id,
                resource_type="image",
                overwrite=True
            )
            secure_url = res["secure_url"]
            print(f" -> Uploaded: {secure_url}")
            
            # Replace in content
            new_content = new_content.replace(url, secure_url)
            
            # Cleanup temp file
            os.remove(temp_file)
        except Exception as e:
            print(f"Failed to process {url}: {e}")

    # Write back
    if new_content != content:
        with open(PAGE_JSX, "w") as f:
            f.write(new_content)
        print("Updated page.jsx successfully.")
    else:
        print("No changes made.")

if __name__ == "__main__":
    process_file()
