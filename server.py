"""
CotizaPro Studio — Hardened Local & Cloud Python Backend Server
Includes strict file whitelisting, HTTP security headers, payload size limits, and SQLite persistence.
"""

import json
import os
import sqlite3
import sys
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlparse

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, "cotizapro.db")
PORT = int(os.environ.get("PORT", "8080"))
MAX_BODY_BYTES = 65536  # 64 KB max body to prevent memory DoS

ALLOWED_STATIC_PATHS = {
    "/",
    "/index.html",
    "/styles.css",
    "/app.js",
}


def init_db():
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute("""
        CREATE TABLE IF NOT EXISTS quotes (
            id TEXT PRIMARY KEY,
            date TEXT,
            client_name TEXT,
            project_title TEXT,
            total REAL,
            currency TEXT,
            deposit_amount REAL,
            items_json TEXT
        )
    """)
    cur.execute("""
        CREATE TABLE IF NOT EXISTS licenses (
            license_key TEXT PRIMARY KEY,
            email TEXT,
            created_at TEXT
        )
    """)
    cur.execute("""
        CREATE TABLE IF NOT EXISTS owner_config (
            key TEXT PRIMARY KEY,
            value_json TEXT
        )
    """)
    conn.commit()
    conn.close()


class CotizaProHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=BASE_DIR, **kwargs)

    def log_message(self, fmt, *args):
        pass

    def end_headers(self):
        # Security headers on all responses
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("X-Frame-Options", "DENY")
        self.send_header("Referrer-Policy", "strict-origin-when-cross-origin")
        self.send_header("Permissions-Policy", "camera=(), microphone=(), geolocation=()")
        super().end_headers()

    def _send_json(self, payload, status=200):
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def _read_json_body(self):
        length = int(self.headers.get("Content-Length", "0"))
        if length <= 0:
            return {}
        if length > MAX_BODY_BYTES:
            raise ValueError("Payload too large")
        raw = self.rfile.read(length).decode("utf-8")
        return json.loads(raw)

    def do_GET(self):
        parsed = urlparse(self.path)
        if parsed.path == "/api/health":
            return self._send_json({"status": "ok", "service": "CotizaPro Studio"})

        if parsed.path == "/api/state":
            conn = sqlite3.connect(DB_PATH)
            cur = conn.cursor()

            cur.execute("SELECT id, date, client_name, project_title, total, currency, deposit_amount, items_json FROM quotes ORDER BY date DESC LIMIT 200")
            quotes = [
                {
                    "id": r[0],
                    "date": r[1],
                    "clientName": r[2],
                    "projectTitle": r[3],
                    "total": r[4],
                    "currency": r[5],
                    "depositAmount": r[6],
                    "items": json.loads(r[7] or "[]"),
                }
                for r in cur.fetchall()
            ]

            cur.execute("SELECT value_json FROM owner_config WHERE key = 'main'")
            row = cur.fetchone()
            raw_cfg = json.loads(row[0]) if row else {}
            # Never leak sensitive API keys over public GET /api/state
            safe_cfg = {
                "stripeMonthlyUrl": raw_cfg.get("stripeMonthlyUrl", ""),
                "stripeLifetimeUrl": raw_cfg.get("stripeLifetimeUrl", ""),
            }

            conn.close()
            return self._send_json({"quotes": quotes, "config": safe_cfg})

        # Block access to .db, .py, .git, .env or any non-whitelisted path
        if parsed.path not in ALLOWED_STATIC_PATHS:
            return self._send_json({"error": "Forbidden"}, status=403)

        return super().do_GET()

    def do_POST(self):
        parsed = urlparse(self.path)
        try:
            data = self._read_json_body()
        except ValueError:
            return self._send_json({"error": "Payload exceeds maximum allowed size"}, status=413)
        except Exception:
            return self._send_json({"error": "Invalid JSON"}, status=400)

        conn = sqlite3.connect(DB_PATH)
        cur = conn.cursor()

        if parsed.path == "/api/quotes":
            quote_id = str(data.get("id", ""))[:40]
            cur.execute(
                """
                INSERT OR REPLACE INTO quotes
                (id, date, client_name, project_title, total, currency, deposit_amount, items_json)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    quote_id,
                    str(data.get("date", ""))[:40],
                    str(data.get("clientName", ""))[:120],
                    str(data.get("projectTitle", ""))[:180],
                    float(data.get("total", 0)),
                    str(data.get("currency", "USD"))[:10],
                    float(data.get("depositAmount", 0)),
                    json.dumps(data.get("items", [])[:50], ensure_ascii=False),
                ),
            )
            conn.commit()
            conn.close()
            return self._send_json({"saved": True, "id": quote_id})

        if parsed.path == "/api/licenses":
            cur.execute(
                """
                INSERT OR REPLACE INTO licenses (license_key, email, created_at)
                VALUES (?, ?, ?)
                """,
                (
                    str(data.get("licenseKey", ""))[:40],
                    str(data.get("email", ""))[:120],
                    str(data.get("createdAt", ""))[:40],
                ),
            )
            conn.commit()
            conn.close()
            return self._send_json({"saved": True})

        if parsed.path == "/api/config":
            cur.execute(
                """
                INSERT OR REPLACE INTO owner_config (key, value_json)
                VALUES ('main', ?)
                """,
                (json.dumps(data, ensure_ascii=False),),
            )
            conn.commit()
            conn.close()
            return self._send_json({"saved": True})

        conn.close()
        return self._send_json({"error": "Not found"}, status=404)


if __name__ == "__main__":
    init_db()
    server = ThreadingHTTPServer(("0.0.0.0", PORT), CotizaProHandler)
    print("============================================================")
    print(f"CotizaPro Studio (Hardened) corriendo en: http://localhost:{PORT}")
    print(f"Base de datos SQLite activa en: {DB_PATH}")
    print("============================================================")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nServidor detenido.")
