import os
import requests
from supabase import create_client
from dotenv import load_dotenv
load_dotenv()

SUPABASE_URL = os.environ.get("SUPABASE_URL", "")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY", "")

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# Fetch inventory
response = supabase.table("inventory").select("*").execute()
inventory = response.data

cars_to_update = [car for car in inventory if not car.get("frames")]

# Hardcoded reliable Wikimedia images for the requested cars
image_map = {
    "Hyundai Creta": [
        "https://upload.wikimedia.org/wikipedia/commons/e/ec/2020_Hyundai_Creta_1.5_GLS_%28SU2%2C_front_view%2C_Indonesia%29.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/4/47/2020_Hyundai_Creta_1.5_GLS_%28SU2%2C_rear_view%2C_Indonesia%29.jpg"
    ],
    "Toyota Innova Crysta": [
        "https://upload.wikimedia.org/wikipedia/commons/b/b3/2016_Toyota_Innova_Crysta_2.4_ZX_wagon_%282017-09-02%29_01.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/7/75/2016_Toyota_Innova_Crysta_2.4_ZX_wagon_%282017-09-02%29_02.jpg"
    ],
    "Honda City": [
        "https://upload.wikimedia.org/wikipedia/commons/0/05/2020_Honda_City_1.5_RS_sedan_%28GN5%2C_front_view%2C_Indonesia%29.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/6/6f/2020_Honda_City_1.5_RS_sedan_%28GN5%2C_rear_view%2C_Indonesia%29.jpg"
    ],
    "Tata Nexon": [
        "https://upload.wikimedia.org/wikipedia/commons/7/74/Tata_Nexon_in_August_2022.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/8/87/Tata_Nexon_rear_view_in_August_2022.jpg"
    ],
    "Mahindra Thar": [
        "https://upload.wikimedia.org/wikipedia/commons/1/1a/Mahindra_Thar_AX_Opt_Petrol_AT_%28front-left%29.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/e/e0/Mahindra_Thar_AX_Opt_Petrol_AT_%28rear-right%29.jpg"
    ],
    "Kia Seltos": [
        "https://upload.wikimedia.org/wikipedia/commons/6/69/2021_Kia_Seltos_EX_%28United_States%29_front_view.png",
        "https://upload.wikimedia.org/wikipedia/commons/e/ea/2021_Kia_Seltos_EX_%28United_States%29_rear_view.png"
    ],
    "Skoda Slavia": [
        "https://upload.wikimedia.org/wikipedia/commons/d/dd/Skoda_Slavia_front.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/7/73/Skoda_Slavia_rear.jpg"
    ]
}

fallback_images = [
    "https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/2021_Toyota_Camry.jpg/800px-2021_Toyota_Camry.jpg"
]

for car in cars_to_update:
    car_name = car["name"]
    frames = image_map.get(car_name, fallback_images)
    print(f"Updating {car_name} ({car['id']}) with {len(frames)} images...")
    
    supabase.table("inventory").update({"frames": frames}).eq("id", car["id"]).execute()

print("Done updating images.")
