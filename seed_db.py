import sys
import requests
import time
import os
import random

API_URL = "http://localhost:8000/api"
IMAGE_PATH = "B26019044639.avif"

if not os.path.exists(IMAGE_PATH):
    print(f"Error: Dummy image '{IMAGE_PATH}' not found.")
    sys.exit(1)

brands = ["Toyota", "Honda", "Suzuki", "Nissan", "Mazda"]
locations = ["Tokyo", "Osaka", "Yokohama", "Kyoto", "Nagoya"]
fuels = ["Petrol", "Diesel", "Hybrid", "EV"]
transmissions = ["Automatic", "Manual"]
models = {
    "Toyota": ["Hilux", "Corolla", "Camry", "Prius", "Land Cruiser"],
    "Honda": ["Civic", "Accord", "CR-V", "Fit"],
    "Suzuki": ["Swift", "Jimny", "Vitara"],
    "Nissan": ["Skyline", "Leaf", "X-Trail"],
    "Mazda": ["CX-5", "Mazda3", "MX-5"]
}

print("Starting Database Seeder...")

for i in range(12):
    brand = random.choice(brands)
    model = random.choice(models[brand])
    location = random.choice(locations)
    fuel = random.choice(fuels)
    transmission = random.choice(transmissions)
    year = random.randint(2015, 2024)
    km = random.randint(5000, 120000)
    price = f"¥ {random.randint(800, 4500)},000"
    
    car_data = {
        "name": f"{brand} {model}",
        "desc": f"Excellent condition, well maintained in {location}.",
        "price": price,
        "specs": "", 
        "attributes": {
            "brand": brand,
            "location": location,
            "year": str(year),
            "fuel": fuel,
            "transmission": transmission,
            "km": str(km)
        }
    }
    
    print(f"\n--- Seeding [{i+1}/12]: {car_data['name']} ---")
    res = requests.post(f"{API_URL}/cars", json=car_data)
    if not res.ok:
        print("Error creating car:", res.text)
        continue
        
    car_id = res.json()["id"]
    print(f"Created ID: {car_id}")
    
    print(f"Uploading image frame...")
    with open(IMAGE_PATH, "rb") as f:
        res = requests.post(f"{API_URL}/cars/{car_id}/frames", files={"files": f})
        if not res.ok:
            print("Error uploading frame:", res.text)
            continue
            
    # Wait for Celery/FastAPI to process the image
    from dotenv import load_dotenv
    load_dotenv('backend/.env')
    url = os.environ.get('SUPABASE_URL')
    key = os.environ.get('SUPABASE_KEY')
    headers = {'apikey': key, 'Authorization': f'Bearer {key}'}
    
    done = False
    retries = 0
    while not done and retries < 20:
        time.sleep(3)
        retries += 1
        r = requests.get(f"{url}/rest/v1/listing_frames?inventory_id=eq.{car_id}", headers=headers)
        if r.ok:
            data = r.json()
            if len(data) > 0:
                status = data[0]['status']
                if status == 'done':
                    print("Processing Complete!")
                    done = True
                elif status == 'failed':
                    print("Processing Failed!")
                    break
    
    if done:
        # Publish
        res = requests.post(f"{API_URL}/cars/{car_id}/publish")
        if res.ok:
            print(f"Published successfully!")
        else:
            print("Error publishing:", res.text)

print("\nSeeding Finished!")
