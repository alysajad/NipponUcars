import os
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()
supabase = create_client(os.environ.get("SUPABASE_URL"), os.environ.get("SUPABASE_KEY"))
res = supabase.table("listing_frames").select("*").in_("status", ["queued", "processing"]).execute()
print(f"Found {len(res.data)} stuck tasks.")
for frame in res.data:
    print(f"Frame {frame['id']} status {frame['status']}")
