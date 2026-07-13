from PIL import Image
import numpy as np

img = Image.open('public/cars/corolla/frame_00.jpg').convert('RGBA')
data = np.array(img)

# Background color in these images is roughly [220, 220, 220] to [240, 240, 240] 
# Let's check the top-left pixel color
print("Top-left pixel:", data[0,0])

