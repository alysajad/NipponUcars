import io
import time
import requests
import tracemalloc
from rembg import new_session, remove
from PIL import Image

tracemalloc.start()
url = "https://res.cloudinary.com/demo/image/upload/w_1024,c_limit/sample.jpg"
print("Downloading...")
resp = requests.get(url)
img = Image.open(io.BytesIO(resp.content)).convert("RGBA")

print("Loading model...")
import onnxruntime as ort
opts = ort.SessionOptions()
opts.enable_cpu_mem_arena = False
opts.enable_mem_pattern = False
opts.intra_op_num_threads = 1
opts.inter_op_num_threads = 1
session = new_session("u2netp", providers=['CPUExecutionProvider'], sess_options=opts)

print("Removing BG...")
remove(img, session=session)
current, peak = tracemalloc.get_traced_memory()
print(f"Peak memory: {peak / 10**6} MB")
