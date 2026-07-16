import requests
import io

url = "http://localhost:8000/api/cars"
car = {"name": "Test Car", "desc": "test", "specs": "{}", "price": "100"}
resp = requests.post(url, json=car)
car_id = resp.json()["id"]

print(f"Created {car_id}")

files = {"files": ("test.jpg", io.BytesIO(b"dummy image data" * 1024), "image/jpeg")}
resp = requests.post(f"{url}/{car_id}/frames", files=files)
print(resp.json())
