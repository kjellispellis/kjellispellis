# 🐦 Seagull Simulator

You are a seagull at the beach. Steal chips, fries, ice cream and more from
unsuspecting beachgoers — and don't get swatted.

A single-file HTML5 canvas game. No build step, no dependencies.

**▶ Play it:** _<add Vercel URL after deploy>_

## How to play

Swoop down close to a beachgoer holding food to snatch it, then fly up high to
eat it and score. **Squawk** to scare nearby people into dropping their food.
Keep your **stamina** and **hunger** meters above zero — flapping burns stamina,
and hunger drains over time (faster the longer you survive). Angry tourists will
swat you if you linger too close, knocking you back and costing hunger.

The longer you last, the more crowded, faster and angrier the beach gets.

### Controls

| Action | Keyboard | Touch |
|--------|----------|-------|
| Steer  | Arrow keys / WASD | Left joystick |
| Flap (boost up) | Space | FLAP button |
| Squawk | Q | SQUAWK button |
| Pause  | P | ⏸ button |
| Mute   | M | 🔊 button |

## Scoring

| Food | Points |
|------|-------:|
| Donut | 20 |
| Sandwich | 18 |
| Ice cream | 15 |
| Fries | 12 |
| Chips | 10 |

High score is saved locally in your browser.

## Tech

Vanilla JavaScript + Canvas 2D in a single `index.html`. All sound is
synthesized at runtime with the Web Audio API (squawk, grabs, eating, swats, and
an ambient beach-wave loop) — no audio files. Audio unlocks on the START tap to
satisfy browser autoplay rules.

## Run locally

It's just a static file — open `index.html` in any browser, or serve the folder:

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

## Deploy

Zero-config static deploy on [Vercel](https://vercel.com):

```bash
npx vercel        # preview
npx vercel --prod # production
```
