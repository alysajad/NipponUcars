import os
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()
supabase = create_client(os.environ.get("SUPABASE_URL"), os.environ.get("SUPABASE_KEY"))

# Delete cars where frames is empty list
res = supabase.table("inventory").select("id, frames").execute()
for car in res.data:
    if not car.get("frames"):
        print(f"Deleting empty car {car['id']}")
        supabase.table("inventory").delete().eq("id", car['id']).execute()

