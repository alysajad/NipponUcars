import os
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()
supabase = create_client(os.environ.get("SUPABASE_URL"), os.environ.get("SUPABASE_KEY"))

# Get the last 4 cars from inventory (assuming sorted by a created_at or id, but inventory might not have created_at. Let's try to get them by sorting.)
# Let's check the schema first by getting 4 rows ordered by descending order. Wait, if it doesn't have created_at, we can try to order by id or just see what's there.
try:
    res = supabase.table("inventory").select("*").order("created_at", desc=True).limit(4).execute()
except Exception as e:
    # Fallback if no created_at
    print("Fallback to no order")
    res = supabase.table("inventory").select("*").execute()
    res.data = res.data[-4:]

cars_to_delete = res.data

if not cars_to_delete:
    print("No cars found.")
    exit(0)

print(f"Found {len(cars_to_delete)} cars to delete.")
for car in cars_to_delete:
    car_id = car["id"]
    print(f"Deleting frames for {car_id}...")
    supabase.table("listing_frames").delete().eq("inventory_id", car_id).execute()
    print(f"Deleting car {car_id}...")
    supabase.table("inventory").delete().eq("id", car_id).execute()

print("Done.")
