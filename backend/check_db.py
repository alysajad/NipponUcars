import os
import json
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()
supabase = create_client(os.environ.get("SUPABASE_URL"), os.environ.get("SUPABASE_KEY"))
res = supabase.table("inventory").select("*").execute()
for car in res.data:
    print(car["name"], type(car["frames"]), car["frames"])
