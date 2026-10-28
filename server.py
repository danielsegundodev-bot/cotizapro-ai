"""
CotizaPro Studio — Hardened Local & Cloud Python Backend Server
Includes strict file whitelisting, HTTP security headers, payload size limits, and SQLite persistence.
Owner authentication is verified server-side; secrets are loaded from environment variables / .env.
"""

import hashlib
import hmac
import json
import os
import secrets
import sqlite3
import sys
import threading
import time
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlparse

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

BASE_DIR = os.path.dirname(os.path.abspath(__file__))


def load_dotenv(path):
    """Minimal .env loader (KEY=VALUE per line) so secrets never live in source code."""
    if not os.path.isfile(path):
        return
    with open(path, encoding="utf-8") as fh:
        for line in fh:
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            key, value = line.split("=", 1)
            os.environ.setdefault(key.strip(), value.strip().strip('"').strip("'"))


load_dotenv(os.path.join(BASE_DIR, ".env"))

DB_PATH = os.environ.get("COTIZAPRO_DB_PATH", os.path.join(BASE_DIR, "cotizapro.db"))
PORT = int(os.environ.get("PORT", "8080"))
MAX_BODY_BYTES = 65536  # 64 KB max body to prevent memory DoS

# Owner password is NEVER shipped to the browser; if unset, the owner panel stays disabled.
OWNER_PASSWORD = os.environ.get("COTIZAPRO_OWNER_PASSWORD", "")
OWNER_SESSION_TTL = 8 * 3600
LOGIN_MAX_ATTEMPTS = 5
LOGIN_WINDOW_SECONDS = 15 * 60

ALLOWED_STATIC_PATHS = {
    "/",
    "/index.html",
    "/styles.css",
    "/app.js",
}


class RateLimiter:
    """In-memory sliding window limiter keyed by client IP."""

    def __init__(self, max_hits, window_seconds):
        self.max_hits = max_hits
        self.window = window_seconds
        self.hits = {}
        self.lock = threading.Lock()

    def allow(self, key):
        now = time.time()
        with self.lock:
            recent = [t for t in self.hits.get(key, []) if now - t < self.window]
            if len(recent) >= self.max_hits:
                self.hits[key] = recent
                return False
            recent.append(now)
            self.hits[key] = recent
            return True


login_limiter = RateLimiter(LOGIN_MAX_ATTEMPTS, LOGIN_WINDOW_SECONDS)
owner_sessions = {}
owner_sessions_lock = threading.Lock()


def verify_owner_password(candidate):
    if not OWNER_PASSWORD:
        return False
    expected = hashlib.sha256(OWNER_PASSWORD.encode("utf-8")).digest()
    provided = hashlib.sha256(str(candidate).encode("utf-8")).digest()
    return hmac.compare_digest(expected, provided)


def create_owner_session():
    token = secrets.token_urlsafe(32)
    with owner_sessions_lock:
        owner_sessions[token] = time.time() + OWNER_SESSION_TTL
    return token


def is_valid_owner_session(token):
    if not token:
        return False
    now = time.time()
    with owner_sessions_lock:
        for t in [t for t, exp in owner_sessions.items() if exp < now]:
            del owner_sessions[t]
        return token in owner_sessions


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


def load_owner_config(cur):
    cur.execute("SELECT value_json FROM owner_config WHERE key = 'main'")
    row = cur.fetchone()
    return json.loads(row[0]) if row else {}


class CotizaProHandler(SimpleHTTPRequestHandler):
    server_version = "CotizaPro"
    sys_version = ""

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

    def _client_ip(self):
        return self.client_address[0]

    def _bearer_token(self):
        auth = self.headers.get("Authorization", "")
        if auth.startswith("Bearer "):
            return auth[7:].strip()
        return ""

    def _is_owner(self):
        return is_valid_owner_session(self._bearer_token())

    def _send_json(self, payload, status=200):
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
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

            raw_cfg = load_owner_config(cur)
            # Never leak sensitive API keys over public GET /api/state
            safe_cfg = {
                "stripeMonthlyUrl": raw_cfg.get("stripeMonthlyUrl", ""),
                "stripeLifetimeUrl": raw_cfg.get("stripeLifetimeUrl", ""),
            }

            conn.close()
            return self._send_json({"quotes": quotes, "config": safe_cfg})

        if parsed.path == "/api/owner/config":
            if not self._is_owner():
                return self._send_json({"error": "Unauthorized"}, status=401)
            conn = sqlite3.connect(DB_PATH)
            raw_cfg = load_owner_config(conn.cursor())
            conn.close()
            cfg = {k: v for k, v in raw_cfg.items() if k != "geminiApiKey"}
            cfg["geminiConfigured"] = bool(raw_cfg.get("geminiApiKey"))
            return self._send_json({"config": cfg})

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

        if parsed.path == "/api/owner/login":
            if not login_limiter.allow(self._client_ip()):
                return self._send_json({"error": "Too many attempts, try again later"}, status=429)
            if not verify_owner_password(data.get("password", "")):
                return self._send_json({"error": "Invalid credentials"}, status=401)
            return self._send_json({"token": create_owner_session(), "expiresIn": OWNER_SESSION_TTL})

        if parsed.path == "/api/owner/logout":
            token = self._bearer_token()
            with owner_sessions_lock:
                owner_sessions.pop(token, None)
            return self._send_json({"ok": True})

        if parsed.path in ("/api/licenses", "/api/config") and not self._is_owner():
            return self._send_json({"error": "Unauthorized"}, status=401)

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
            current = load_owner_config(cur)
            # An empty Gemini key keeps the stored one, so the key never needs to round-trip to the browser
            if not data.get("geminiApiKey"):
                data["geminiApiKey"] = current.get("geminiApiKey", "")
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
    if not OWNER_PASSWORD:
        print("AVISO: COTIZAPRO_OWNER_PASSWORD no está definido; el panel de propietario queda deshabilitado.")
    server = ThreadingHTTPServer(("0.0.0.0", PORT), CotizaProHandler)
    print("============================================================")
    print(f"CotizaPro Studio (Hardened) corriendo en: http://localhost:{PORT}")
    print(f"Base de datos SQLite activa en: {DB_PATH}")
    print("============================================================")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nServidor detenido.")
