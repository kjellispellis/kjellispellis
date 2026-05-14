# Stacc Email Signature Creator

A small internal tool to generate consistent email signatures across Stacc.

## Run locally

It's a static site — no build step. Open `index.html` in a browser, or serve it:

```sh
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Deploy

Connect this repo to Vercel and deploy. The included `vercel.json` is enough — no build command, no framework preset needed.

## Files

- `index.html` — form, preview, copy button
- `styles.css` — UI styling (not the signature itself)
- `script.js` — live preview and clipboard copy. The exported signature uses inline styles via a `<table>` so it survives most email clients.
- `vercel.json` — static hosting config

## TODO

- Replace placeholder layout with the real sketch when available
- Confirm Stacc brand colors and typography (currently using a placeholder accent)
