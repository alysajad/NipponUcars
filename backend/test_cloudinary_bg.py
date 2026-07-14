import requests

url = "https://res.cloudinary.com/demo/image/upload/e_background_removal,b_white/sample.jpg"
print(f"Fetching {url}")
resp = requests.get(url)
print(resp.status_code)
if resp.status_code != 200:
    print(resp.text)
