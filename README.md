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

## Password protection

The deployment is gated by HTTP Basic Auth via `middleware.js` (Vercel Edge Middleware). Before the first deploy — or before it will let anyone in — set env vars in the Vercel project (Settings → Environment Variables):

- `BASIC_AUTH_PASSWORD` — the shared password. **Required.** Without it the site returns 500.
- `BASIC_AUTH_USER` — optional. Defaults to `stacc`.

Generate a decent password locally:

```sh
openssl rand -base64 24
```

Set it for all three environments (Production, Preview, Development) so preview URLs are also protected. Redeploy after changing env vars — they aren't picked up mid-deployment.

## Files

- `index.html` — form, preview, copy button
- `styles.css` — UI styling (not the signature itself)
- `script.js` — live preview and clipboard copy. The exported signature uses inline styles via a `<table>` so it survives most email clients.
- `vercel.json` — static hosting config

## TODO

- Verify the site nav URLs (`stacc.com/products`, `/solutions`, etc.) in `script.js` — they were guessed from the sketch and may need adjusting
- Confirm the layout matches the sketch's spacing
- Row icons are inline SVG. They render in the preview and in Gmail's / Apple Mail's / Outlook web's signature editors, but Outlook desktop strips inline SVG — rows fall back to indented text, which still reads correctly. If we want bulletproof rendering everywhere, we'd need to host the icons as PNGs somewhere.
