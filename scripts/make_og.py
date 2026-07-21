"""Generate the 1200x630 Open Graph share card for 다듬 (Dadeum).

Deterministic, no network. Uses the macOS Korean system font (AppleSDGothicNeo).
Run: uv run --with pillow python scripts/make_og.py
Output: site/og.png
"""
from PIL import Image, ImageDraw, ImageFont
import os

W, H = 1200, 630
BG = (246, 247, 249)        # ink-50
CARD = (255, 255, 255)
INK = (17, 24, 37)          # ink-900
INK600 = (75, 85, 99)       # ink-600
INK400 = (138, 148, 166)    # ink-400
BRAND = (59, 108, 246)      # brand-500
ROSE = (244, 63, 94)        # AI-tell red
FONT_PATH = "/System/Library/Fonts/AppleSDGothicNeo.ttc"


def font(size, index=None):
    # AppleSDGothicNeo.ttc: 0=Regular .. higher indices are heavier weights.
    for idx in ([index] if index is not None else [8, 6, 3, 0]):
        try:
            return ImageFont.truetype(FONT_PATH, size, index=idx)
        except Exception:
            continue
    return ImageFont.truetype(FONT_PATH, size)


img = Image.new("RGB", (W, H), BG)
d = ImageDraw.Draw(img)

# rounded white card with soft border
m = 48
d.rounded_rectangle([m, m, W - m, H - m], radius=32, fill=CARD, outline=(230, 233, 238), width=2)

pad = 96
f_brand = font(52, 8)
f_title = font(92, 8)
f_slogan = font(40, 6)
f_sub = font(30, 3)
f_chip = font(26, 6)

# top: brand dot + wordmark
cx = pad
cy = 132
d.ellipse([cx, cy, cx + 18, cy + 18], fill=BRAND)
d.text((cx + 32, cy - 18), "다듬 · Dadeum", font=f_brand, fill=INK)

# headline
d.text((pad, 214), "AI 티 없이,", font=f_title, fill=INK)
d.text((pad, 316), "사람이 쓴 것처럼.", font=f_title, fill=BRAND)

# supporting line
d.text((pad, 442), "번역투·어색한 문체만 자연스럽게. 내용·사실·수치는 그대로.", font=f_slogan, fill=INK600)

# before -> after chips (bottom)
chip_y = 512
def chip(x, text, color, bg):
    tb = d.textbbox((0, 0), text, font=f_chip)
    tw = tb[2] - tb[0]
    d.rounded_rectangle([x, chip_y, x + tw + 44, chip_y + 52], radius=26, fill=bg)
    d.text((x + 22, chip_y + 9), text, font=f_chip, fill=color)
    return x + tw + 44

x = chip(pad, "AI 티 나는 원문", ROSE, (254, 242, 243))
d.text((x + 18, chip_y + 8), "→", font=font(34, 6), fill=INK400)
chip(x + 58, "사람이 쓴 것처럼", BRAND, (238, 244, 255))

os.makedirs("site", exist_ok=True)
img.save("site/og.png", "PNG")
print("wrote site/og.png", os.path.getsize("site/og.png"), "bytes")
