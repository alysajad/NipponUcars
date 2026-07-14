import requests

url = "https://res.cloudinary.com/demo/image/upload/e_background_removal,b_white/sample.jpg"
print(requests.head(url).status_code)
