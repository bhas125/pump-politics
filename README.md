# Pump Politics

**Issue priority, by the gallon.**

A one-screen political satire web app: a gas-gauge needle points at today's US regular national average. Tap **What issue should I focus on?** for a ~1.5s slot-machine spin, then a **featured (hero) answer** for that price band with the other options listed underneath.

Answers stay hidden until you click the CTA.

## Live preview

- **Live site:** https://pump-politics.vercel.app
- **Repo:** https://github.com/bhas125/pump-politics

Gas price on the hosted preview uses Vercel serverless `GET /api/gas-price` (scrapes AAA). The browser falls back to CORS proxies if that endpoint is unavailable.

## Open / run locally

```bash
cd pump-politics
python3 server.py
```

Open [http://localhost:8765](http://localhost:8765). No build step, no API keys, no login.

`server.py` serves the static files **and** `/api/gas-price` (scrapes AAA server-side). On Vercel, `api/gas-price.js` does the same.

## Modes

| Mode | Default? | What it does |
|------|----------|--------------|
| **Live US gas** | Yes | Fetches today's AAA national regular average and sets the gauge |
| **Simulate** | No | Pretend slider ($1–$6). Moves the needle. Clearly labeled PRETEND |

## Slot UX

1. Default: no answers visible.
2. Click **What issue should I focus on?** → ~1.5s slot-machine roll through issues/zones.
3. Reveal: the **landed answer stays as the big hero result**; the other answers for that zone sit underneath as a secondary list.

## Issue stacks (tone by zone)

| Zone   | Range        | Tone |
|--------|--------------|------|
| Green  | $1.00–$2.50  | Bob Ross calm — kindness, happy little trees, soft virtue |
| Yellow | $2.50–$3.00  | Sensible campaign messaging — tax policy + trans kids |
| Orange | $3.00–$3.50  | Kitchen-table messaging — economy + crime |
| Red    | $3.50–$6.00+ | Hysterical populist pocketbook chants — Higher Wages! Lower Prices! Cheap Houses! |

## How gas price is sourced (hosted + local)

1. Prefer `GET /api/gas-price` — local `server.py` or Vercel `api/gas-price.js` (scrapes [AAA Fuel Prices](https://gasprices.aaa.com/) server-side — no API key).
2. Else client scrapes AAA via CORS proxies (`api.allorigins.win`, `corsproxy.io`).
3. On failure: demo price `$3.21` with a clear error note so the UI still works.

## Files

- `index.html` / `styles.css` / `app.js` — the whole app
- `server.py` — local static server + AAA price API
- `api/gas-price.js` — Vercel serverless AAA proxy
- `vercel.json` — Vercel config
- `preview.png` — phone-sized screenshot (default state: answers hidden)
- `README.md` — this file

Satire only. Not campaign advice.
