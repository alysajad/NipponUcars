import sys
import requests
import time
import os

API_URL = "http://localhost:8000/api"

if len(sys.argv) < 2:
    print("Usage: python test_single_image.py <path_to_image>")
    sys.exit(1)

image_path = sys.argv[1]
if not os.path.exists(image_path):
    print(f"Error: File '{image_path}' not found.")
    sys.exit(1)

print("1. Creating a temporary test car listing...")
car_data = {
    "name": "Single Image Test",
    "desc": "Testing BG Removal Pipeline",
    "specs": "Test",
    "price": "0"
}
res = requests.post(f"{API_URL}/cars", json=car_data)
if not res.ok:
    print("Error creating car:", res.text)
    sys.exit(1)
    
car_id = res.json()["id"]
print(f"Created car ID: {car_id}")

print(f"2. Uploading {image_path}...")
with open(image_path, "rb") as f:
    res = requests.post(f"{API_URL}/cars/{car_id}/frames", files={"files": f})
    if not res.ok:
        print("Error uploading frame:", res.text)
        sys.exit(1)

print("3. Waiting for Celery/FastAPI Background Tasks to process the image...")

# Import here so we don't crash if it's missing globally
from dotenv import load_dotenv
load_dotenv('backend/.env')
url = os.environ.get('SUPABASE_URL')
key = os.environ.get('SUPABASE_KEY')

headers = {'apikey': key, 'Authorization': f'Bearer {key}'}

done = False
max_retries = 15
retries = 0

while not done and retries < max_retries:
    time.sleep(4)
    retries += 1
    r = requests.get(f"{url}/rest/v1/listing_frames?inventory_id=eq.{car_id}", headers=headers)
    if r.ok:
        data = r.json()
        if len(data) > 0:
            frame = data[0]
            status = frame['status']
            print(f"[{retries}/{max_retries}] Status: {status}")
            if status == 'done':
                print("\n✅ SUCCESS!")
                print("Cloudinary Processed URL:", frame['processed_url'])
                done = True
            elif status == 'error':
                print("\n❌ Error found in processing!")
                break
    else:
        print("Error fetching status from database.")

if not done:
    print("Timed out waiting for processing.")
