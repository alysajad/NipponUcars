import requests
import glob
import time
import os

API_URL = "https://ucars-fastapi.onrender.com/api"

# 1. Create a car
print("Creating car...")
car_data = {
    "model_id": "hilux",
    "name": "Toyota Hilux Revo",
    "desc": "Perfectly Refined 360° Experience",
    "specs": "2.8L Prerunner",
    "price": "₹ 20,50,000"
}
res = requests.post(f"{API_URL}/cars", json=car_data)
if not res.ok:
    print("Error creating car:", res.text)
    exit(1)
    
car_id = res.json()["id"]
print(f"Created car {car_id}")

# 2. Upload frames
frames = sorted(glob.glob("legacy_vite/public/cars/hilux/frame_*.jpg"))
if not frames:
    print("No frames found!")
    exit(1)

for frame_path in frames:
    print(f"Uploading {frame_path}...")
    with open(frame_path, "rb") as f:
        res = requests.post(f"{API_URL}/cars/{car_id}/frames", files={"files": f})
        if not res.ok:
            print("Error uploading frame:", res.text)
            exit(1)
            
# 3. Wait for processing by polling the Supabase backend statuses
print("Waiting for Celery to process backgrounds...")

# Import here so we don't crash if it's missing globally
from dotenv import load_dotenv
load_dotenv('backend/.env')
url = os.environ.get('SUPABASE_URL')
key = os.environ.get('SUPABASE_KEY')

headers = {'apikey': key, 'Authorization': f'Bearer {key}'}

done = False
while not done:
    time.sleep(5)
    r = requests.get(f"{url}/rest/v1/listing_frames?inventory_id=eq.{car_id}", headers=headers)
    if r.ok:
        data = r.json()
        statuses = [f['status'] for f in data]
        print(f"Statuses: {set(statuses)} ({len(statuses)}/36)")
        if len(statuses) == 36 and all(s == 'done' for s in statuses):
            done = True
        elif 'error' in statuses:
            print("Error found in processing!")
            break
    else:
        print("Error fetching statuses")

# 4. Publish car
if done:
    print(f"Publishing car {car_id}...")
    res = requests.post(f"{API_URL}/cars/{car_id}/publish")
    if not res.ok:
        print("Error publishing car:", res.text)
    else:
        print("Car successfully published to inventory!")
