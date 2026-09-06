from pathlib import Path
from PIL import Image

SOURCE = Path("/home/ubuntu/upload")
OUTPUT = Path("/home/ubuntu/webdev-static-assets/fazaa-showcase/studio")
OUTPUT.mkdir(parents=True, exist_ok=True)

sources = ["1.jpeg", "2.jpeg", "3.jpeg", "4.jpeg", "5.jpeg", "7.png", "8.jpeg", "9.jpeg", "10.jpg", "11.jpeg", "12.jpeg", "13.jpeg", "14.jpeg"]

for index, filename in enumerate(sources, start=1):
    with Image.open(SOURCE / filename) as image:
        frame = image.convert("RGB")
        if frame.size != (1920, 480):
            raise ValueError(f"Unexpected size for {filename}: {frame.size}")
        destination = OUTPUT / f"studio-slide-{index:02d}.webp"
        frame.save(destination, "WEBP", quality=86, method=6)
        print(f"{filename} -> {destination} ({destination.stat().st_size} bytes)")
