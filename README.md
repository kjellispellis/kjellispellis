# Stacc Background Generator

A single-file web app for generating Stacc-branded backgrounds — patterns of horizontal bars in varying widths, rendered as crisp SVG and exportable as PNG.

Inspired by the bar/track motif (cf. Core42 brand work), reinterpreted with Stacc colors. Tweak the controls to find a look, then export.

## Usage

Open `index.html` in any modern browser. No build step, no dependencies.

```sh
open index.html        # macOS
xdg-open index.html    # Linux
```

Or serve it:

```sh
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Controls

- **Canvas** — pick a preset (desktop, 4K, square, story, OG image, banners) or set custom width/height.
- **Palette** — background, primary accent, secondary accent. Use the quick palettes as starting points and dial in your exact Stacc brand hex codes.
- **Bars** — height, row gap, density, empty-row chance, min/max bar width (% of canvas), rounded ends, sprinkle of secondary-color bars.
- **Text overlay** — optional headline, color, position, size, weight. Multi-line supported.
- **Seed** — same seed + same settings → same output. Press `R` to reroll.

## Export

- **Download SVG** — vector, scales infinitely, tiny file.
- **Download PNG** — rasterized at the exact canvas dimensions.
- **Copy SVG** — markup to clipboard.
