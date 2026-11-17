# Throwaway: WCAG contrast of text against what sits behind it, from a screenshot.
# Usage: python3 -I prototype/contrast.py <png> <text hex> <name> <l,t,r,b> [<name> <l,t,r,b> ...]
# For each box: samples the background in a 10px ring around it. Reports the lowest ratio and the median.
import sys
from PIL import Image

def lum(rgb):
    def ch(c):
        c = c / 255
        return c / 12.92 if c <= 0.03928 else ((c + 0.055) / 1.055) ** 2.4
    r, g, b = rgb[:3]
    return 0.2126 * ch(r) + 0.7152 * ch(g) + 0.0722 * ch(b)

def ratio(a, b):
    hi, lo = max(a, b), min(a, b)
    return (hi + 0.05) / (lo + 0.05)

img = Image.open(sys.argv[1]).convert('RGB')
text = tuple(int(sys.argv[2][i:i + 2], 16) for i in (0, 2, 4))
tl = lum(text)
args = sys.argv[3:]
for name, box in zip(args[0::2], args[1::2]):
    l, t, r, b = [int(v) for v in box.split(',')]
    # Background = a ring just outside the text box (no glyph pixels there), plus the gaps between lines
    # are ignored on purpose. The text box itself is the element's box from the page.
    bg = []
    for y in range(max(t - 12, 0), min(b + 12, img.height), 2):
        for x in range(max(l - 12, 0), min(r + 12, img.width), 2):
            inside = l - 2 <= x <= r + 2 and t - 2 <= y <= b + 2
            if not inside:
                bg.append(lum(img.getpixel((x, y))))
    bg.sort()
    lowest = min(ratio(tl, v) for v in bg)
    med = ratio(tl, bg[len(bg) // 2])
    print(f'{name}: lowest {lowest:.1f}:1, median {med:.1f}:1')
