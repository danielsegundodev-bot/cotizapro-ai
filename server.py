"""
CotizaPro AI — Local & Cloud Python Backend Server (Zero External Dependencies)
Provides SQLite persistence for quotes, leads, owner monetization settings, and PRO license keys,
while serving the static frontend at http://localhost:8080
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

    def _send_json(self, payload, status=200):
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(body)

    def _read_json_body(self):
        length = int(self.headers.get("Content-Length", "0"))
        if length <= 0:
            return {}
        raw = self.rfile.read(length).decode("utf-8")
        return json.loads(raw)

    def do_GET(self):
        parsed = urlparse(self.path)
        if parsed.path == "/api/health":
            return self._send_json({"status": "ok", "service": "CotizaPro AI"})

        if parsed.path == "/api/state":
            conn = sqlite3.connect(DB_PATH)
            cur = conn.cursor()

            cur.execute("SELECT id, date, client_name, project_title, total, currency, deposit_amount, items_json FROM quotes ORDER BY date DESC")
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

            cur.execute("SELECT license_key, email, created_at FROM licenses ORDER BY created_at DESC")
            licenses = [
                {"licenseKey": r[0], "email": r[1], "createdAt": r[2]}
                for r in cur.fetchall()
            ]

            cur.execute("SELECT value_json FROM owner_config WHERE key = 'main'")
            row = cur.fetchone()
            config = json.loads(row[0]) if row else {}

            conn.close()
            return self._send_json({"quotes": quotes, "licenses": licenses, "config": config})

        return super().do_GET()

    def do_POST(self):
        parsed = urlparse(self.path)
        data = self._read_json_body()
        conn = sqlite3.connect(DB_PATH)
        cur = conn.cursor()

        if parsed.path == "/api/quotes":
            cur.execute(
                """
                INSERT OR REPLACE INTO quotes
                (id, date, client_name, project_title, total, currency, deposit_amount, items_json)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    data.get("id"),
                    data.get("date"),
                    data.get("clientName"),
                    data.get("projectTitle"),
                    float(data.get("total", 0)),
                    data.get("currency", "USD"),
                    float(data.get("depositAmount", 0)),
                    json.dumps(data.get("items", []), ensure_ascii=False),
                ),
            )
            conn.commit()
            conn.close()
            return self._send_json({"saved": True, "id": data.get("id")})

        if parsed.path == "/api/licenses":
            cur.execute(
                """
                INSERT OR REPLACE INTO licenses (license_key, email, created_at)
                VALUES (?, ?, ?)
                """,
                (data.get("licenseKey"), data.get("email"), data.get("createdAt")),
            )
            conn.commit()
            conn.close()
            return self._send_json({"saved": True, "licenseKey": data.get("licenseKey")})

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
    print(f"============================================================")
    print(f"🚀 CotizaPro AI corriendo en: http://localhost:{PORT}")
    print(f"📦 Base de datos SQLite activa en: {DB_PATH}")
    print(f"============================================================")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nServidor detenido.")
