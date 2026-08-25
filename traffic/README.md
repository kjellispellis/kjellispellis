# Commute watcher — Strandkaien → Godvik

Tells you the E39 west is jammed *before* you walk out of the office, instead of
after you're sitting in it.

Every 10 minutes during the afternoon window a GitHub Actions job asks a traffic
provider how long `Strandkaien → Ellingshaugen 13, Godvik` takes right now,
compares that against how long it *usually* takes at that exact time of day, and
pushes a notification when the gap is big enough to matter — or when there's an
accident or closure on the corridor.

Comparing against the historic time for that minute is the whole trick: 24
minutes at 16:00 is just Bergen, and you don't want a phone buzz for that. 46
minutes at 16:00 is news.

## Setup (about 5 minutes)

### 1. Traffic data key

**TomTom (default, recommended)** — free tier, no credit card, 2500 requests/day.
Sign up at <https://developer.tomtom.com>, create an app, copy the key. Its
routing response includes live, free-flow *and* historic travel times plus jam
sections, and the same key reads the incident feed.

Add it as a repository secret: **Settings → Secrets and variables → Actions →
New repository secret**, name `TOMTOM_API_KEY`.

**Google Routes API (alternative)** — set secret `GOOGLE_MAPS_API_KEY` and repo
variable `TRAFFIC_PROVIDER=google`. Needs a billing account (traffic-aware calls
bill against the Advanced SKU, ~$10/1000 with a monthly free allowance — this
job makes roughly 600 calls a month, so it stays free, but the card is still
required). It reports live vs. free-flow only, so "typical" is estimated from
`typical_factor` in `config.json`. Incident detail still needs a TomTom key.

### 2. Where the alert goes

Set either or both. If neither is set the job just logs to the run summary.

**Phone push via ntfy (simplest)** — install the ntfy app (iOS/Android),
subscribe to an unguessable topic name like `bergen-e39-kjell-7f3a91`, then add
that topic as secret `NTFY_TOPIC`. No account, no password. Anyone who guesses
the topic can read it, so make it random. Self-hosted server: set repo variable
`NTFY_SERVER`, and secret `NTFY_TOKEN` if it needs auth.

**Email** — secrets `ALERT_EMAIL_TO`, `SMTP_HOST`, `SMTP_PORT` (465 for SSL, 587
for STARTTLS), `SMTP_USER`, `SMTP_PASS`, optional `ALERT_EMAIL_FROM`. For Gmail
use an App Password, not the account password.

### 3. Check it works

Actions → **Traffic monitor** → Run workflow, with *Check now* on and *Actually
send the alert* on for a real end-to-end test. The run summary prints the live,
typical and free-flow times.

Scheduled runs need the repository to be active — GitHub disables cron workflows
after 60 days without commits, and scheduled jobs can be delayed by several
minutes under load. On a private repo the ~30 runs/weekday bill against your
Actions minutes; public repos are free.

## Tuning

Everything lives in `traffic/config.json`:

| Key | Meaning |
| --- | --- |
| `route.waypoints` | Origin, via points, destination. The via point keeps it on the route you actually drive rather than whatever the router prefers today. |
| `window` | Local weekdays and clock range to check. Cron in the workflow is UTC and deliberately wider; the script does the real gating in `Europe/Oslo`, so DST handles itself. |
| `warn_delay_vs_typical_s` | Nudge threshold: 300 s = 5 min worse than usual. |
| `alert_delay_vs_typical_s` | High-priority threshold: 600 s = 10 min worse than usual. |
| `warn_delay_vs_freeflow_s` | Backstop for when historic data is missing. |
| `incident_categories` | TomTom icon categories to care about: 1 accident, 6 jam, 7 lane closed, 8 road closed, 14 broken-down vehicle. |
| `min_incident_magnitude` | 1 minor, 2 moderate, 3 major. |
| `cooldown_minutes` / `max_alerts_per_day` | Stops a two-hour jam becoming twelve notifications. An escalation from *Slow* to *Bad* still gets through immediately. |
| `corridor_meters` | How close an incident must be to your route to count. |

## Running it locally

```sh
export TOMTOM_API_KEY=...
python3 traffic/monitor.py --once              # check now, ignore the time window
python3 traffic/monitor.py --once --no-notify  # evaluate quietly
python3 traffic/monitor.py --raw               # dump the parsed provider response
```

Standard library only — no pip install, no dependencies.

If a provider ever renames a response field, `--raw` shows exactly what came
back; the script fails loudly rather than reporting a fake travel time.

## Files

- `monitor.py` — probe, evaluate, notify. Providers are two small functions.
- `config.json` — route, window, thresholds.
- `status.json` — last result, written on every run.
- `.state.json` — cooldown bookkeeping, carried between runs by the Actions cache.
