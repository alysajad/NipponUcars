import sys
from rembg import new_session, remove
from PIL import Image

def main():
    if len(sys.argv) != 3:
        sys.exit(1)
    in_path, out_path = sys.argv[1], sys.argv[2]
    img = Image.open(in_path).convert("RGBA")
    import onnxruntime as ort
    opts = ort.SessionOptions()
    opts.enable_cpu_mem_arena = False
    opts.enable_mem_pattern = False
    opts.intra_op_num_threads = 1
    opts.inter_op_num_threads = 1
    
    session = new_session("u2netp", providers=['CPUExecutionProvider'], sess_options=opts)
    removed = remove(img, session=session)
    
    white_canvas = Image.new("RGBA", removed.size, (255, 255, 255, 255))
    white_canvas.paste(removed, mask=removed.split()[3])
    final = white_canvas.convert("RGB")
    final.save(out_path, format="JPEG", quality=88, optimize=True)

if __name__ == "__main__":
    main()
