import os
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()
supabase = create_client(os.environ.get("SUPABASE_URL"), os.environ.get("SUPABASE_KEY"))

res = supabase.table("listing_frames").select("*").order("created_at", desc=True).limit(5).execute()
for f in res.data:
    print(f"Frame ID: {f['id']} - Status: {f['status']} - Error: {f.get('error_message')}")
