from PIL import Image, ImageOps
import os

# Paths
ROOT = os.path.dirname(os.path.dirname(__file__))
IN_PATH = os.path.join(ROOT, 'website', 'images', 'icc-logo.png')
OUT_PATH = os.path.join(ROOT, 'website', 'images', 'icc-logo-pinkviolet.png')
OUT_TRANSPARENT = os.path.join(ROOT, 'website', 'images', 'icc-logo-pinkviolet-transparent.png')
OUT_REACT = os.path.join(ROOT, 'react-dashboard', 'public', 'icc-logo-pinkviolet.png')

print('Input:', IN_PATH)
if not os.path.exists(IN_PATH):
    raise SystemExit('Source logo not found: ' + IN_PATH)

img = Image.open(IN_PATH).convert('RGBA')
width, height = img.size

# Make background transparent by treating the top-left pixel as background sample
bg_r, bg_g, bg_b, bg_a = img.getpixel((0,0))
threshold = 40

pixels = img.getdata()
new_pixels = []
for px in pixels:
    r,g,b,a = px
    if a == 0:
        new_pixels.append((r,g,b,0))
        continue
    dist = ((r-bg_r)**2 + (g-bg_g)**2 + (b-bg_b)**2) ** 0.5
    if dist < threshold:
        new_pixels.append((255,255,255,0))
    else:
        new_pixels.append((r,g,b,a))

img_trans = Image.new('RGBA', img.size)
img_trans.putdata(new_pixels)
img_trans.save(OUT_TRANSPARENT)
print('Saved transparent base:', OUT_TRANSPARENT)

# Colorize using a pink-violet gradient mapping (dark->violet, light->pink)
rgb = img_trans.convert('RGB')
gray = ImageOps.grayscale(rgb)
# Colors chosen for violet -> pink
violet = '#6f1ab5'
pink = '#ff2fa7'
colored = ImageOps.colorize(gray, violet, pink)
# Apply original alpha mask from transparent image
alpha = img_trans.split()[3]
colored.putalpha(alpha)
colored.save(OUT_PATH)
print('Saved colorized logo:', OUT_PATH)

# Also copy into react-dashboard public for convenience
os.makedirs(os.path.dirname(OUT_REACT), exist_ok=True)
colored.save(OUT_REACT)
print('Copied to React public folder:', OUT_REACT)

# Create a small favicon variant
favicon = colored.resize((128,128), Image.LANCZOS)
favicon.save(os.path.join(ROOT, 'website', 'images', 'icc-logo-pinkviolet-128.png'))
print('Saved favicon variant')

print('Done')
