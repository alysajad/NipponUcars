import os
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()
supabase = create_client(os.environ.get("SUPABASE_URL"), os.environ.get("SUPABASE_KEY"))
res = supabase.table("listing_frames").select("*").order("created_at", desc=True).limit(5).execute()
for r in res.data:
    print(r['id'], r['status'], r.get('error_message'))
