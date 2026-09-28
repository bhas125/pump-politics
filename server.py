#!/usr/bin/env python3
"""Serve Pump Politics + /api/gas-price (scrapes AAA server-side; no API key)."""
from __future__ import annotations

import json
import re
import urllib.request
from datetime import datetime, timezone
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

ROOT = Path(__file__).resolve().parent
AAA_URL = "https://gasprices.aaa.com/"
UA = "Mozilla/5.0 (compatible; PumpPolitics/1.0; +local)"


def fetch_aaa() -> dict:
    req = urllib.request.Request(AAA_URL, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=20) as resp:
        html = resp.read().decode("utf-8", errors="replace")
    m = re.search(r"National Average\s*\$([0-9]+(?:\.[0-9]+)?)", html, re.I)
    if not m:
        m = re.search(r"Current Avg\.\s*\$([0-9]+(?:\.[0-9]+)?)", html, re.I)
    if not m:
        raise ValueError("Could not parse AAA national average")
    price = float(m.group(1))
    d = re.search(r"Price as of\s*([^<\n]+)", html, re.I)
    as_of = d.group(1).strip() if d else None
    return {
        "price": price,
        "asOf": as_of,
        "source": "AAA",
        "fuel": "US regular national average",
        "fetchedAt": datetime.now(timezone.utc).isoformat(),
    }


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def do_GET(self):
        if self.path.split("?", 1)[0] == "/api/gas-price":
            try:
                data = fetch_aaa()
                body = json.dumps(data).encode()
                self.send_response(200)
                self.send_header("Content-Type", "application/json; charset=utf-8")
                self.send_header("Cache-Control", "no-store")
                self.send_header("Access-Control-Allow-Origin", "*")
                self.send_header("Content-Length", str(len(body)))
                self.end_headers()
                self.wfile.write(body)
            except Exception as e:
                body = json.dumps({"error": str(e)}).encode()
                self.send_response(502)
                self.send_header("Content-Type", "application/json; charset=utf-8")
                self.send_header("Content-Length", str(len(body)))
                self.end_headers()
                self.wfile.write(body)
            return
        return super().do_GET()


if __name__ == "__main__":
    port = 8765
    httpd = ThreadingHTTPServer(("0.0.0.0", port), Handler)
    print(f"Pump Politics at http://127.0.0.1:{port}/  (API: /api/gas-price)")
    httpd.serve_forever()
