import os
import json
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.environ.get("SUPABASE_URL", "")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY", "")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

res = supabase.table("inventory").select("*").execute()
cars = res.data

for car in cars:
    print(f"ID: {car['id']} | Name: {car['name']} | Price: {car.get('price', '')}")
    if "corolla" in car['name'].lower() or "fortuner" in car['name'].lower() or "camry" in car['name'].lower():
        print(f"MATCH FOUND: {json.dumps(car, indent=2)}")
