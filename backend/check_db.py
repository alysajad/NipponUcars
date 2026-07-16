import os
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()
supabase = create_client(os.environ.get("SUPABASE_URL"), os.environ.get("SUPABASE_KEY"))

# Find inventory items with empty frames
res = supabase.table("inventory").select("id, name, frames").execute()
empty_frame_cars = [c for c in res.data if not c.get("frames")]

for car in empty_frame_cars:
    frames_res = supabase.table("listing_frames").select("processed_url, status").eq("inventory_id", car['id']).eq("status", "done").order("frame_index").execute()
    if frames_res.data:
        urls = [f["processed_url"] for f in frames_res.data]
        print(f"Publishing {car['name']} (ID: {car['id']}) with {len(urls)} frames")
        supabase.table("inventory").update({"frames": urls}).eq("id", car['id']).execute()
    else:
        print(f"Car {car['name']} (ID: {car['id']}) has no done frames.")
print("Done.")
