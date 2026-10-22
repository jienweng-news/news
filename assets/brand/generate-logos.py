"""Rebuild outlined SVG logos: uv run --with fonttools assets/brand/generate-logos.py.
Uses the repository's OFL-licensed Barlow Condensed Bold; no runtime font requests.
"""
from pathlib import Path
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.boundsPen import BoundsPen
ROOT = Path(__file__).resolve().parents[2]
font = TTFont(ROOT / 'frontend/public/fonts/barlow-condensed-bold.ttf')
glyphs = font.getGlyphSet()
cmap = font.getBestCmap()
RED, INK, PAPER = '#c92032', '#171717', '#f7f3e9'

def lettering(text, x, y, width, height, color):
    paths, advance, ymin, ymax = [], 0, 0, 0
    for char in text:
        name = cmap[ord(char)]
        pen, bounds = SVGPathPen(glyphs), BoundsPen(glyphs)
        glyphs[name].draw(pen)
        glyphs[name].draw(bounds)
        if bounds.bounds:
            ymin = min(ymin, bounds.bounds[1]); ymax = max(ymax, bounds.bounds[3])
        paths.append(f'<path transform="translate({advance} 0)" d="{pen.getCommands()}"/>')
        advance += font['hmtx'][name][0]
    return f'<g fill="{color}" transform="translate({x} {y}) scale({width/advance:.7f} {-height/(ymax-ymin):.7f})">{"".join(paths)}</g>'

def svg(name, width, height, content):
    return f'<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" viewBox="0 0 {width} {height}" role="img" aria-labelledby="title"><title id="title">{name}</title>{content}</svg>\n'

wordmark = f'<path fill="{RED}" d="M22 18 545 0 530 139 0 156Z"/>'
wordmark += lettering('TOKEN', 35, 132, 490, 111, INK)
wordmark += f'<path fill="{INK}" d="M10 169 549 145 560 300 24 279Z"/>'
wordmark += lettering('ON', 38, 264, 183, 91, PAPER)
wordmark += lettering('AIR', 242, 278, 295, 115, RED)
compact = f'<path fill="{RED}" d="M9 22 151 6 151 144 3 155Z"/>'
compact += f'<path fill="{INK}" d="M18 32 141 18 141 132 13 143Z"/>'
compact += lettering('TO', 24, 124, 75, 82, PAPER)
compact += lettering('A', 101, 124, 35, 82, RED)
favicon = f'<path fill="{RED}" d="M3 7 61 1 60 58 1 63Z"/><path fill="{INK}" d="M9 13 55 8 54 53 7 57Z"/>'
favicon += lettering('T', 16, 48, 33, 31, PAPER)
output = ROOT / 'frontend/public'
(output/'brand/token-on-air-cutout.svg').write_text(svg('Token on Air', 560, 300, wordmark))
(output/'brand/token-on-air-compact.svg').write_text(svg('Token on Air compact mark', 160, 160, compact))
(output/'favicon.svg').write_text(svg('Token on Air', 64, 64, favicon))
print('Generated outlined wordmark, compact mark and favicon.')
