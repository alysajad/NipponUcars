import urllib.request
import json
import math
import io
import base64
from PIL import Image, ImageOps
import requests

def create_fake_360_spin(image_url):
    print(f"Downloading base image from {image_url}...")
    req = urllib.request.Request(image_url, headers={'User-Agent': 'Mozilla/5.0'})
    img_data = urllib.request.urlopen(req).read()
    base_img = Image.open(io.BytesIO(img_data)).convert("RGBA")
    
    # Resize base image to fit in 800x600
    base_img.thumbnail((700, 500), Image.Resampling.LANCZOS)
    
    frames_b64 = []
    
    print("Generating 36 frames...")
    for i in range(36):
        angle = i * (2 * math.pi / 36)
        scale = math.cos(angle)
        
        # Canvas
        canvas = Image.new("RGB", (800, 600), (255, 255, 255))
        
        # Prepare the car image for this frame
        car = base_img.copy()
        if scale < 0:
            car = ImageOps.mirror(car)
            
        new_width = max(1, int(car.width * abs(scale)))
        car = car.resize((new_width, car.height), Image.Resampling.LANCZOS)
        
        # Paste car onto canvas centered
        paste_x = (800 - car.width) // 2
        paste_y = (600 - car.height) // 2
        
        # Create a mask from the alpha channel to avoid black backgrounds
        if car.mode == "RGBA":
            canvas.paste(car, (paste_x, paste_y), car)
        else:
            canvas.paste(car, (paste_x, paste_y))
            
        # Convert to base64
        buffer = io.BytesIO()
        canvas.save(buffer, format="JPEG", quality=85)
        img_str = base64.b64encode(buffer.getvalue()).decode("utf-8")
        frames_b64.append(f"data:image/jpeg;base64,{img_str}")
        
    return frames_b64

def upload_dummy_car(frames):
    print("Uploading to local API...")
    payload = {
        "name": "TOYOTA HILUX (DUMMY 360)",
        "desc": "Dummy data for 360 testing",
        "specs": "2.4L Diesel 4WD",
        "price": "₹ 30,00,000",
        "frames": frames
    }
    
    try:
        res = requests.post("http://localhost:8000/api/cars", json=payload)
        res.raise_for_status()
        print("Success!", res.json())
    except Exception as e:
        print("Failed to upload:", e)
        if hasattr(e, 'response') and e.response is not None:
            print(e.response.text)

if __name__ == "__main__":
    url = "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/2016_Toyota_HiLux_Invincible_D-4D_4WD_2.4_Front.jpg/960px-2016_Toyota_HiLux_Invincible_D-4D_4WD_2.4_Front.jpg"
    frames = create_fake_360_spin(url)
    upload_dummy_car(frames)
