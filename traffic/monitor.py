#!/usr/bin/env python3
"""Watch a driving route for queues and incidents, and shout before you leave.

Runs on a schedule (GitHub Actions cron), asks a traffic provider how long the
drive takes *right now*, compares that against the typical travel time for this
minute of this weekday, and pushes an alert when the difference is big enough to
change when you walk out the door.

Providers:
  tomtom  - free tier, no credit card. Gives live, free-flow AND historic
            (typical-for-this-time-of-day) travel times, plus jam sections and
            incident details. Default.
  google  - Routes API. Gives live + free-flow only, so "typical" is derived
            from typical_factor in the config.

Usage:
  python3 traffic/monitor.py                 # scheduled run
  python3 traffic/monitor.py --once          # ignore the time window
  python3 traffic/monitor.py --raw           # dump the provider response
  python3 traffic/monitor.py --no-notify     # evaluate but stay quiet
"""

from __future__ import annotations

import argparse
import json
import math
import os
import smtplib
import sys
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime, timedelta
from email.message import EmailMessage
from zoneinfo import ZoneInfo

HERE = os.path.dirname(os.path.abspath(__file__))
DEFAULT_CONFIG = os.path.join(HERE, "config.json")
DEFAULT_STATE = os.path.join(HERE, ".state.json")
DEFAULT_STATUS = os.path.join(HERE, "status.json")

# TomTom incident iconCategory codes.
INCIDENT_NAMES = {
    0: "unknown", 1: "accident", 2: "fog", 3: "dangerous conditions", 4: "rain",
    5: "ice", 6: "jam", 7: "lane closed", 8: "road closed", 9: "road works",
    10: "wind", 11: "flooding", 13: "broken down vehicle", 14: "broken down vehicle",
}


# --------------------------------------------------------------------------- http

def http_json(url, data=None, headers=None, timeout=25):
    body = None
    hdrs = dict(headers or {})
    if data is not None:
        body = json.dumps(data).encode()
        hdrs.setdefault("Content-Type", "application/json")
    req = urllib.request.Request(url, data=body, headers=hdrs)
    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            return json.loads(resp.read().decode("utf-8", "replace"))
    except urllib.error.HTTPError as exc:
        detail = exc.read().decode("utf-8", "replace")[:600]
        raise RuntimeError("HTTP %s from %s: %s" % (exc.code, url.split("?")[0], detail)) from None
    except urllib.error.URLError as exc:
        raise RuntimeError("network error talking to %s: %s" % (url.split("?")[0], exc.reason)) from None


# ------------------------------------------------------------------------ geometry

def haversine_m(lat1, lon1, lat2, lon2):
    r = 6371000.0
    p1, p2 = math.radians(lat1), math.radians(lat2)
    dp = p2 - p1
    dl = math.radians(lon2 - lon1)
    a = math.sin(dp / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dl / 2) ** 2
    return 2 * r * math.asin(math.sqrt(a))


def dist_to_path_m(lat, lon, path):
    """Rough point-to-polyline distance, good enough for a corridor filter."""
    if not path:
        return float("inf")
    best = float("inf")
    for i in range(len(path)):
        best = min(best, haversine_m(lat, lon, path[i][0], path[i][1]))
        if i + 1 < len(path):
            # project onto the segment in flat lat/lon space, then measure for real
            (ay, ax), (by, bx) = path[i], path[i + 1]
            dy, dx = by - ay, bx - ax
            if dy or dx:
                t = ((lat - ay) * dy + (lon - ax) * dx) / (dy * dy + dx * dx)
                if 0.0 < t < 1.0:
                    best = min(best, haversine_m(lat, lon, ay + t * dy, ax + t * dx))
    return best


def bbox_of(points, pad_deg=0.02):
    lats = [p[0] for p in points]
    lons = [p[1] for p in points]
    return (min(lats) - pad_deg, min(lons) - pad_deg, max(lats) + pad_deg, max(lons) + pad_deg)


# ----------------------------------------------------------------------- providers

def probe_tomtom(cfg, key, want_raw=False):
    wps = cfg["route"]["waypoints"]
    locs = ":".join("%s,%s" % (w["lat"], w["lon"]) for w in wps)
    params = {
        "key": key,
        "traffic": "true",
        "travelMode": "car",
        "routeType": "fastest",
        "computeTravelTimeFor": "all",
        "sectionType": "traffic",
    }
    url = "https://api.tomtom.com/routing/1/calculateRoute/%s/json?%s" % (
        urllib.parse.quote(locs, safe=":,"), urllib.parse.urlencode(params))
    raw = http_json(url)
    if want_raw:
        return raw, None
    route = (raw.get("routes") or [{}])[0]
    s = route.get("summary") or {}
    path = []
    for leg in route.get("legs") or []:
        for pt in leg.get("points") or []:
            path.append((pt["latitude"], pt["longitude"]))
    jams = []
    for sec in route.get("sections") or []:
        if sec.get("simpleCategory") == "TRAFFIC_JAM" or sec.get("sectionType") == "TRAFFIC":
            jams.append({
                "delay_s": sec.get("delayInSeconds"),
                "speed_kmh": sec.get("effectiveSpeedInKmh"),
                "magnitude": sec.get("magnitudeOfDelay"),
            })
    live = s.get("travelTimeInSeconds")
    if live is None:
        raise RuntimeError("no travelTimeInSeconds in TomTom response; run with --raw to inspect")
    return {
        "live_s": live,
        "freeflow_s": s.get("noTrafficTravelTimeInSeconds"),
        "typical_s": s.get("historicTrafficTravelTimeInSeconds"),
        "delay_s": s.get("trafficDelayInSeconds"),
        "jam_meters": s.get("trafficLengthInMeters"),
        "distance_m": s.get("lengthInMeters"),
        "jams": jams,
        "path": path,
    }, raw


def probe_google(cfg, key, want_raw=False):
    wps = cfg["route"]["waypoints"]

    def loc(w):
        return {"location": {"latLng": {"latitude": w["lat"], "longitude": w["lon"]}}}

    body = {
        "origin": loc(wps[0]),
        "destination": loc(wps[-1]),
        "travelMode": "DRIVE",
        "routingPreference": "TRAFFIC_AWARE_OPTIMAL",
        "extraComputations": ["TRAFFIC_ON_POLYLINE"],
        "languageCode": "en-GB",
        "units": "METRIC",
    }
    if len(wps) > 2:
        body["intermediates"] = [loc(w) for w in wps[1:-1]]
    fields = ",".join([
        "routes.duration", "routes.staticDuration", "routes.distanceMeters",
        "routes.polyline.encodedPolyline", "routes.travelAdvisory.speedReadingIntervals",
    ])
    raw = http_json(
        "https://routes.googleapis.com/directions/v2:computeRoutes",
        data=body,
        headers={"X-Goog-Api-Key": key, "X-Goog-FieldMask": fields},
    )
    if want_raw:
        return raw, None
    route = (raw.get("routes") or [{}])[0]

    def secs(v):
        return int(float(str(v).rstrip("s"))) if v else None

    live = secs(route.get("duration"))
    free = secs(route.get("staticDuration"))
    if live is None:
        raise RuntimeError("no duration in Routes API response; run with --raw to inspect")
    intervals = ((route.get("travelAdvisory") or {}).get("speedReadingIntervals") or [])
    jams = [{"speed_label": i.get("speed")} for i in intervals
            if i.get("speed") in ("SLOW", "TRAFFIC_JAM")]
    factor = cfg["thresholds"].get("typical_factor", 1.35)
    return {
        "live_s": live,
        "freeflow_s": free,
        "typical_s": int(free * factor) if free else None,
        "delay_s": (live - free) if free else None,
        "jam_meters": None,
        "distance_m": route.get("distanceMeters"),
        "jams": jams,
        "path": [],  # encoded polyline is not decoded; incident filter falls back to waypoints
    }, raw


def fetch_incidents(cfg, key, path):
    """TomTom incident details inside the route's bounding box, filtered to the corridor."""
    pts = path or [(w["lat"], w["lon"]) for w in cfg["route"]["waypoints"]]
    min_lat, min_lon, max_lat, max_lon = bbox_of(pts)
    fields = ("{incidents{type,geometry{type,coordinates},properties{iconCategory,"
              "magnitudeOfDelay,events{description,code,iconCategory},startTime,endTime,"
              "from,to,length,delay,roadNumbers}}}")
    params = {
        "key": key,
        "bbox": "%s,%s,%s,%s" % (min_lon, min_lat, max_lon, max_lat),
        "fields": fields,
        "language": "en-GB",
        "timeValidityFilter": "present",
    }
    url = "https://api.tomtom.com/traffic/services/5/incidentDetails?%s" % urllib.parse.urlencode(params)
    raw = http_json(url)
    corridor = cfg["alerting"].get("corridor_meters", 2000)
    out = []
    for inc in raw.get("incidents") or []:
        props = inc.get("properties") or {}
        geom = inc.get("geometry") or {}
        coords = geom.get("coordinates") or []
        flat = []
        stack = [coords]
        while stack:
            item = stack.pop()
            if (isinstance(item, (list, tuple)) and len(item) == 2
                    and all(isinstance(v, (int, float)) for v in item)):
                flat.append((item[1], item[0]))  # GeoJSON is lon,lat
            elif isinstance(item, (list, tuple)):
                stack.extend(item)
        if flat and path:
            if min(dist_to_path_m(la, lo, path) for la, lo in flat) > corridor:
                continue
        events = props.get("events") or []
        desc = "; ".join(e.get("description", "") for e in events if e.get("description"))
        cat = props.get("iconCategory", 0)
        out.append({
            "category": cat,
            "category_name": INCIDENT_NAMES.get(cat, "unknown"),
            "magnitude": props.get("magnitudeOfDelay", 0) or 0,
            "delay_s": props.get("delay"),
            "roads": props.get("roadNumbers") or [],
            "from": props.get("from"),
            "to": props.get("to"),
            "description": desc or INCIDENT_NAMES.get(cat, "unknown"),
        })
    return out


# ---------------------------------------------------------------------- evaluation

def evaluate(cfg, probe, incidents):
    th = cfg["thresholds"]
    live = probe["live_s"]
    typical = probe.get("typical_s")
    free = probe.get("freeflow_s")
    reasons = []
    severity = 0  # 0 normal, 1 warn, 2 alert

    if typical:
        vs_typical = live - typical
        if vs_typical >= th["alert_delay_vs_typical_s"]:
            severity = 2
            reasons.append("%d min on top of the usual %d min for this time of day"
                           % (round(vs_typical / 60), round(typical / 60)))
        elif vs_typical >= th["warn_delay_vs_typical_s"]:
            severity = max(severity, 1)
            reasons.append("%d min on top of the usual %d min for this time of day"
                           % (round(vs_typical / 60), round(typical / 60)))
    if free:
        vs_free = live - free
        if vs_free >= th["warn_delay_vs_freeflow_s"]:
            severity = max(severity, 1)
            reasons.append("%d min slower than a clear road" % round(vs_free / 60))

    wanted = set(th.get("incident_categories") or [])
    min_mag = th.get("min_incident_magnitude", 2)
    hits = [i for i in incidents
            if i["category"] in wanted and (i["magnitude"] or 0) >= min_mag]
    for i in hits:
        if i["category"] in (1, 8):  # accident or closed road
            severity = max(severity, 2)
        else:
            severity = max(severity, 1)
        where = " / ".join(x for x in [", ".join(i["roads"]), i.get("from")] if x)
        reasons.append("%s%s" % (i["category_name"].capitalize(), " on %s" % where if where else ""))

    return {"severity": severity, "reasons": reasons, "incidents": hits}


def render(cfg, probe, verdict, now):
    live_min = round(probe["live_s"] / 60)
    typical = probe.get("typical_s")
    icon = {0: "OK", 1: "Slow", 2: "Bad"}[verdict["severity"]]
    title = "%s: %s min to Godvik" % (icon, live_min)
    if typical:
        title += " (usually %d)" % round(typical / 60)
    lines = [
        cfg["route"]["name"],
        "Checked %s" % now.strftime("%a %H:%M %Z"),
        "Live drive time: %d min" % live_min,
    ]
    if typical:
        lines.append("Typical now:     %d min" % round(typical / 60))
    if probe.get("freeflow_s"):
        lines.append("Clear road:      %d min" % round(probe["freeflow_s"] / 60))
    if probe.get("jam_meters"):
        lines.append("Queue length:    %.1f km" % (probe["jam_meters"] / 1000.0))
    if verdict["reasons"]:
        lines.append("")
        lines.extend("- %s" % r for r in dict.fromkeys(verdict["reasons"]))
    for i in verdict["incidents"]:
        if i.get("delay_s"):
            lines.append("  (+%d min from that one)" % round(i["delay_s"] / 60))
    return title, "\n".join(lines)


# ------------------------------------------------------------------------- notify

def notify_ntfy(title, body, severity):
    topic = os.environ.get("NTFY_TOPIC")
    if not topic:
        return None
    server = os.environ.get("NTFY_SERVER", "https://ntfy.sh").rstrip("/")
    headers = {
        "Title": title.encode("ascii", "replace").decode(),
        "Priority": "high" if severity >= 2 else "default",
        "Tags": "car" if severity >= 2 else "hourglass",
        "Content-Type": "text/plain; charset=utf-8",
    }
    token = os.environ.get("NTFY_TOKEN")
    if token:
        headers["Authorization"] = "Bearer %s" % token
    req = urllib.request.Request("%s/%s" % (server, topic), data=body.encode(), headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=20):
            return "ntfy: sent to %s" % topic
    except Exception as exc:  # noqa: BLE001 - a failed push must not fail the run
        return "ntfy: FAILED (%s)" % exc


def notify_email(title, body):
    to = os.environ.get("ALERT_EMAIL_TO")
    host = os.environ.get("SMTP_HOST")
    if not (to and host):
        return None
    msg = EmailMessage()
    msg["Subject"] = title
    msg["From"] = os.environ.get("ALERT_EMAIL_FROM", os.environ.get("SMTP_USER", to))
    msg["To"] = to
    msg.set_content(body)
    port = int(os.environ.get("SMTP_PORT", "465"))
    try:
        if port == 465:
            server = smtplib.SMTP_SSL(host, port, timeout=25)
        else:
            server = smtplib.SMTP(host, port, timeout=25)
            server.starttls()
        with server:
            user, pw = os.environ.get("SMTP_USER"), os.environ.get("SMTP_PASS")
            if user and pw:
                server.login(user, pw)
            server.send_message(msg)
        return "email: sent to %s" % to
    except Exception as exc:  # noqa: BLE001
        return "email: FAILED (%s)" % exc


# -------------------------------------------------------------------------- state

def load_json(path, default):
    try:
        with open(path) as fh:
            return json.load(fh)
    except (OSError, ValueError):
        return default


def should_alert(cfg, state, severity, now):
    if severity < 1:
        return False, "quiet"
    today = now.strftime("%Y-%m-%d")
    day = state.get("day")
    sent = state.get("sent_today", 0) if day == today else 0
    if sent >= cfg["alerting"].get("max_alerts_per_day", 3):
        return False, "daily alert cap reached"
    last_sev = state.get("last_severity", 0) if day == today else 0
    if severity > last_sev:
        return True, "severity rose to %d" % severity
    last_at = state.get("last_alert_at")
    if last_at:
        try:
            elapsed = now - datetime.fromisoformat(last_at)
            cooldown = timedelta(minutes=cfg["alerting"].get("cooldown_minutes", 45))
            if elapsed < cooldown:
                return False, "cooldown (%d min left)" % ((cooldown - elapsed).seconds // 60)
        except ValueError:
            pass
    return True, "still bad, cooldown expired"


def in_window(cfg, now):
    w = cfg["window"]
    if now.isoweekday() not in w.get("weekdays", [1, 2, 3, 4, 5]):
        return False, "not a configured weekday"
    start_h, start_m = (int(x) for x in w["start"].split(":"))
    end_h, end_m = (int(x) for x in w["end"].split(":"))
    mins = now.hour * 60 + now.minute
    if not (start_h * 60 + start_m <= mins <= end_h * 60 + end_m):
        return False, "outside %s-%s %s" % (w["start"], w["end"], w["timezone"])
    return True, "in window"


# --------------------------------------------------------------------------- main

def main(argv=None):
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--config", default=os.environ.get("TRAFFIC_CONFIG", DEFAULT_CONFIG))
    ap.add_argument("--state", default=os.environ.get("TRAFFIC_STATE", DEFAULT_STATE))
    ap.add_argument("--status", default=os.environ.get("TRAFFIC_STATUS", DEFAULT_STATUS))
    ap.add_argument("--once", action="store_true", help="ignore the configured time window")
    ap.add_argument("--raw", action="store_true", help="print the provider response and exit")
    ap.add_argument("--no-notify", action="store_true")
    args = ap.parse_args(argv)

    with open(args.config) as fh:
        cfg = json.load(fh)

    now = datetime.now(ZoneInfo(cfg["window"]["timezone"]))
    ok, why = in_window(cfg, now)
    if not ok and not (args.once or args.raw):
        print("skipping: %s (now %s)" % (why, now.strftime("%a %H:%M")))
        return 0

    provider = os.environ.get("TRAFFIC_PROVIDER", cfg.get("provider", "tomtom"))
    if provider == "google":
        key = os.environ.get("GOOGLE_MAPS_API_KEY")
        if not key:
            print("error: GOOGLE_MAPS_API_KEY is not set", file=sys.stderr)
            return 2
        probe_fn, incident_key = probe_google, os.environ.get("TOMTOM_API_KEY")
    else:
        key = os.environ.get("TOMTOM_API_KEY")
        if not key:
            print("error: TOMTOM_API_KEY is not set", file=sys.stderr)
            return 2
        probe_fn, incident_key = probe_tomtom, key

    probe = None
    for attempt in (1, 2):
        try:
            probe, _ = probe_fn(cfg, key, want_raw=args.raw)
            break
        except RuntimeError as exc:
            print("attempt %d failed: %s" % (attempt, exc), file=sys.stderr)
    if probe is None:
        print("error: could not reach the traffic provider; no alert sent", file=sys.stderr)
        return 1

    if args.raw:
        print(json.dumps(probe, indent=2)[:20000])
        return 0

    incidents = []
    if incident_key:
        try:
            incidents = fetch_incidents(cfg, incident_key, probe.get("path") or [])
        except RuntimeError as exc:
            print("warning: incident lookup failed: %s" % exc, file=sys.stderr)

    verdict = evaluate(cfg, probe, incidents)
    title, body = render(cfg, probe, verdict, now)
    print(title)
    print(body)

    state = load_json(args.state, {})
    send, reason = should_alert(cfg, state, verdict["severity"], now)
    print("decision: %s (%s)" % ("ALERT" if send else "no alert", reason))

    results = []
    if send and not args.no_notify:
        for res in (notify_ntfy(title, body, verdict["severity"]), notify_email(title, body)):
            if res:
                results.append(res)
                print(res)
        if not results:
            print("warning: nothing configured to notify (set NTFY_TOPIC and/or SMTP_*)",
                  file=sys.stderr)
        if not any("FAILED" not in r for r in results):
            # Every channel failed, so don't burn the cooldown - retry next run.
            print("warning: no channel delivered; leaving state untouched", file=sys.stderr)
            send = False
    if send and not args.no_notify:
        today = now.strftime("%Y-%m-%d")
        state = {
            "day": today,
            "sent_today": (state.get("sent_today", 0) if state.get("day") == today else 0) + 1,
            "last_severity": verdict["severity"],
            "last_alert_at": now.isoformat(),
        }

    # Always persist, so the workflow's cache step always has a file to save.
    state.setdefault("day", now.strftime("%Y-%m-%d"))
    state["last_check_at"] = now.isoformat()
    state["last_check_severity"] = verdict["severity"]
    try:
        with open(args.state, "w") as fh:
            json.dump(state, fh)
    except OSError as exc:
        print("warning: could not persist state: %s" % exc, file=sys.stderr)

    status = {
        "checked_at": now.isoformat(),
        "route": cfg["route"]["name"],
        "provider": provider,
        "severity": verdict["severity"],
        "live_minutes": round(probe["live_s"] / 60),
        "typical_minutes": round(probe["typical_s"] / 60) if probe.get("typical_s") else None,
        "freeflow_minutes": round(probe["freeflow_s"] / 60) if probe.get("freeflow_s") else None,
        "queue_km": round(probe["jam_meters"] / 1000.0, 1) if probe.get("jam_meters") else None,
        "reasons": list(dict.fromkeys(verdict["reasons"])),
        "incidents": verdict["incidents"],
        "notified": results,
    }
    try:
        with open(args.status, "w") as fh:
            json.dump(status, fh, indent=2)
    except OSError:
        pass

    summary = os.environ.get("GITHUB_STEP_SUMMARY")
    if summary:
        with open(summary, "a") as fh:
            fh.write("### %s\n\n```\n%s\n```\n\n%s\n" % (title, body, reason))
    return 0


if __name__ == "__main__":
    sys.exit(main())
