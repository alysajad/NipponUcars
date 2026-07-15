import os
import json
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.environ.get("SUPABASE_URL", "")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY", "")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def seed_data():
    print("Fetching inventory...")
    res = supabase.table("inventory").select("*").execute()
    cars = res.data
    
    if not cars:
        print("No cars found.")
        return

    dummy_reviews = [
        {"user": "Hanumant Gadade", "time": "5 months ago", "rating": 5, "title": "Must buy", "text": "Looks great, mileage too good, driving experience is very nice."},
        {"user": "Athul Saji", "time": "1 month ago", "rating": 4, "title": "Value for money..", "text": "I purchased this car 1 year ago. I drove it 6800 kms. It is very smooth."}
    ]
    
    dummy_faqs = [
        {"q": "What is the top model price in Mumbai?", "a": "The top model price starts from Rs. 16.24 Lakh."},
        {"q": "What offers are available?", "a": "Currently, there is an offer running for this model."}
    ]
    
    dummy_competitors = [
        {"name": "Mahindra XUV 3XO", "price": "Rs. 9.15 Lakh onwards", "image": "https://imgd.aeplcdn.com/227x128/n/cw/ec/170173/xuv-3xo-exterior-right-front-three-quarter-3.jpeg"},
        {"name": "Tata Punch", "price": "Rs. 6.75 Lakh onwards", "image": "https://imgd.aeplcdn.com/227x128/n/cw/ec/39276/punch-exterior-right-front-three-quarter-3.jpeg"}
    ]

    for car in cars:
        specs_str = car.get("specs", "{}")
        try:
            specs = json.loads(specs_str)
        except:
            specs = {}
            
        # Add the dummy fields
        specs["reviews"] = dummy_reviews
        specs["faqs"] = dummy_faqs
        specs["competitors"] = dummy_competitors
        
        # Update the db
        print(f"Updating {car['name']}...")
        supabase.table("inventory").update({
            "specs": json.dumps(specs)
        }).eq("id", car["id"]).execute()
        
    print("Successfully seeded all cars with dummy data!")

if __name__ == "__main__":
    seed_data()
