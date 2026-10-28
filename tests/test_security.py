"""
Security regression tests for the CotizaPro server.
Each test reproduces an attack that worked before the hardening phases.

Run: python -m unittest discover -s tests -v
"""

import http.client
import json
import os
import sys
import tempfile
import threading
import unittest
import urllib.error
from http.server import ThreadingHTTPServer
from socketserver import ThreadingMixIn
from wsgiref.simple_server import WSGIRequestHandler, WSGIServer, make_server

TMP_DIR = tempfile.mkdtemp(prefix="cotizapro-test-")
os.environ["COTIZAPRO_DB_PATH"] = os.path.join(TMP_DIR, "test.db")
os.environ["COTIZAPRO_OWNER_PASSWORD"] = "frase-de-prueba-larga-123"
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import server  # noqa: E402
import wsgi  # noqa: E402

CLIENT_A = "a" * 32
CLIENT_B = "b" * 32

STRIPE_SESSIONS = {
    "cs_test_paidlifetime00000000000": {
        "status": "complete", "payment_status": "paid", "mode": "payment",
        "customer_details": {"email": "cliente@correo.com"}, "payment_link": "plink_ok",
    },
    "cs_test_paidmonthly000000000000": {
        "status": "complete", "payment_status": "paid", "mode": "subscription",
        "subscription": "sub_123", "payment_link": "plink_ok",
    },
    "cs_test_unpaid00000000000000000": {"status": "open", "payment_status": "unpaid", "mode": "payment"},
    "cs_test_otherproduct00000000000": {
        "status": "complete", "payment_status": "paid", "mode": "payment", "payment_link": "plink_other",
    },
}
SUBSCRIPTIONS = {"sub_123": "active"}


def fake_stripe_get(path):
    if path.startswith("checkout/sessions/"):
        session_id = path.rsplit("/", 1)[-1]
        if session_id not in STRIPE_SESSIONS:
            raise urllib.error.HTTPError(path, 404, "Not Found", {}, None)
        return STRIPE_SESSIONS[session_id]
    if path.startswith("subscriptions/"):
        return {"status": SUBSCRIPTIONS[path.rsplit("/", 1)[-1]]}
    raise AssertionError(f"Unexpected Stripe call {path}")


def fake_gemini_generate(api_key, prompt, json_mode=True):
    malicious = {
        "clientName": {"nested": "object"},
        "projectTitle": "<img src=x onerror=alert(1)>" * 20,
        "items": [{"name": "ok", "qty": "NaN", "price": 1}, {"name": "Web", "qty": 2, "price": 100}, "junk"],
        "extra": "dropped",
    }
    return {"candidates": [{"content": {"parts": [{"text": json.dumps(malicious)}]}}]}


def configure_mocks():
    # Each test class gets an empty database so redeemed sessions / quotes do not leak across runs
    server.DB_PATH = tempfile.mktemp(suffix=".db", dir=TMP_DIR)
    server.stripe_get = fake_stripe_get
    server.gemini_generate = fake_gemini_generate
    server.STRIPE_SECRET_KEY = "sk_test_mock"
    server.STRIPE_PAYMENT_LINK_IDS = {"plink_ok"}
    server.GEMINI_API_KEY = "AIzaFAKEKEYFAKEKEYFAKEKEY"
    server.init_db()


class SecurityRegressionTests(unittest.TestCase):
    # The wsgiref test server adds its own Server header; real WSGI hosts set theirs
    checks_server_header = True

    @classmethod
    def setUpClass(cls):
        configure_mocks()
        cls.httpd = ThreadingHTTPServer(("127.0.0.1", 0), server.CotizaProHandler)
        cls.port = cls.httpd.server_address[1]
        threading.Thread(target=cls.httpd.serve_forever, daemon=True).start()

    @classmethod
    def tearDownClass(cls):
        cls.httpd.shutdown()
        cls.httpd.server_close()

    def setUp(self):
        # Fresh rate-limit windows per test
        for limiter in (server.login_limiter, server.license_limiter, server.write_limiter, server.ai_limiter):
            limiter.hits.clear()
        server.subscription_cache.clear()

    def request(self, method, path, body=None, headers=None, raw_body=None):
        conn = http.client.HTTPConnection("127.0.0.1", self.port, timeout=10)
        hdrs = {"Content-Type": "application/json"}
        hdrs.update(headers or {})
        payload = raw_body if raw_body is not None else (json.dumps(body) if body is not None else None)
        conn.request(method, path, body=payload, headers=hdrs)
        resp = conn.getresponse()
        data = resp.read()
        conn.close()
        try:
            parsed = json.loads(data) if data else None
        except ValueError:
            parsed = data
        return resp.status, parsed, resp

    def owner_token(self):
        status, data, _ = self.request("POST", "/api/owner/login", {"password": "frase-de-prueba-larga-123"})
        self.assertEqual(status, 200)
        return data["token"]

    # --- Phase 1: owner authentication -------------------------------------------------------

    def test_config_cannot_be_overwritten_without_owner_session(self):
        evil = {"stripeMonthlyUrl": "https://buy.stripe.com/ATTACKER", "stripeLifetimeUrl": "https://buy.stripe.com/ATTACKER"}
        status, _, _ = self.request("POST", "/api/config", evil)
        self.assertEqual(status, 401)
        status, _, _ = self.request("POST", "/api/config", evil, {"Authorization": "Bearer forged"})
        self.assertEqual(status, 401)

    def test_leaked_master_key_is_not_an_owner_password(self):
        status, _, _ = self.request("POST", "/api/owner/login", {"password": "CPRO-OWNER-PRO"})
        self.assertEqual(status, 401)

    def test_login_is_rate_limited(self):
        for _ in range(server.LOGIN_MAX_ATTEMPTS):
            self.request("POST", "/api/owner/login", {"password": "wrong"})
        status, _, _ = self.request("POST", "/api/owner/login", {"password": "frase-de-prueba-larga-123"})
        self.assertEqual(status, 429)

    def test_gemini_key_is_never_returned(self):
        token = self.owner_token()
        cfg = {"stripeMonthlyUrl": "https://buy.stripe.com/m", "stripeLifetimeUrl": "https://buy.stripe.com/l",
               "geminiApiKey": "AIzaSECRETSECRETSECRET123"}
        status, _, _ = self.request("POST", "/api/config", cfg, {"Authorization": f"Bearer {token}"})
        self.assertEqual(status, 200)
        _, owner_view, _ = self.request("GET", "/api/owner/config", headers={"Authorization": f"Bearer {token}"})
        _, public_view, _ = self.request("GET", "/api/state", headers={"X-Client-Id": CLIENT_A})
        for view in (owner_view, public_view):
            self.assertNotIn("AIzaSECRETSECRETSECRET123", json.dumps(view))

    def test_owner_config_only_accepts_stripe_payment_links(self):
        token = self.owner_token()
        cfg = {"stripeMonthlyUrl": "https://evil.example/pay", "stripeLifetimeUrl": "https://buy.stripe.com/l"}
        status, _, _ = self.request("POST", "/api/config", cfg, {"Authorization": f"Bearer {token}"})
        self.assertEqual(status, 400)

    # --- Phase 2: licenses and Stripe ----------------------------------------------------------

    def test_forged_legacy_license_is_rejected(self):
        for key in ("CPRO-2026-HACKED-1RNU", "CPRO-OWNER-PRO", "CPRO-2026-VIP999", "CPRO-AAAAA-AAAAA-AAAAA-AAAAA"):
            _, data, _ = self.request("POST", "/api/licenses/verify", {"licenseKey": key})
            self.assertFalse(data["valid"], key)

    def test_fake_or_unpaid_stripe_session_does_not_unlock(self):
        for session_id, expected in (
            ("cs_live_AAAAAAAAAAAAAAAAAAAA", 400),
            ("cs_test_unpaid00000000000000000", 402),
            ("cs_test_otherproduct00000000000", 403),
            ("cs_test_../../v1/customers", 400),
        ):
            status, data, _ = self.request("POST", "/api/stripe/redeem", {"sessionId": session_id})
            self.assertEqual(status, expected, session_id)
            self.assertNotIn("licenseKey", data or {})

    def test_paid_session_redeems_exactly_one_valid_license(self):
        status, data, _ = self.request("POST", "/api/stripe/redeem", {"sessionId": "cs_test_paidlifetime00000000000"})
        self.assertEqual(status, 200)
        key = data["licenseKey"]
        _, verify, _ = self.request("POST", "/api/licenses/verify", {"licenseKey": key})
        self.assertTrue(verify["valid"])
        status, _, _ = self.request("POST", "/api/stripe/redeem", {"sessionId": "cs_test_paidlifetime00000000000"})
        self.assertEqual(status, 409)

    def test_cancelled_subscription_license_stops_working(self):
        _, data, _ = self.request("POST", "/api/stripe/redeem", {"sessionId": "cs_test_paidmonthly000000000000"})
        key = data["licenseKey"]
        self.assertTrue(self.request("POST", "/api/licenses/verify", {"licenseKey": key})[1]["valid"])
        SUBSCRIPTIONS["sub_123"] = "canceled"
        server.subscription_cache.clear()
        try:
            self.assertFalse(self.request("POST", "/api/licenses/verify", {"licenseKey": key})[1]["valid"])
        finally:
            SUBSCRIPTIONS["sub_123"] = "active"

    def test_only_owner_can_issue_licenses(self):
        status, _, _ = self.request("POST", "/api/licenses", {"email": "x@y.com"})
        self.assertEqual(status, 401)
        token = self.owner_token()
        status, data, _ = self.request("POST", "/api/licenses", {"email": "x@y.com"}, {"Authorization": f"Bearer {token}"})
        self.assertEqual(status, 200)
        self.assertTrue(self.request("POST", "/api/licenses/verify", {"licenseKey": data["licenseKey"]})[1]["valid"])

    # --- Phase 3: data isolation, validation, robustness -----------------------------------

    def test_quotes_are_isolated_per_client(self):
        quote = {"id": "CP-2026-1111", "clientName": "Cliente secreto", "total": 10, "currency": "MXN",
                 "items": [{"name": "Web", "qty": 1, "price": 10}]}
        status, _, _ = self.request("POST", "/api/quotes", quote, {"X-Client-Id": CLIENT_A})
        self.assertEqual(status, 200)
        _, other, _ = self.request("GET", "/api/state", headers={"X-Client-Id": CLIENT_B})
        self.assertEqual(other["quotes"], [])
        _, anonymous, _ = self.request("GET", "/api/state")
        self.assertEqual(anonymous["quotes"], [])
        self.request("POST", "/api/quotes", dict(quote, clientName="HACK"), {"X-Client-Id": CLIENT_B})
        _, mine, _ = self.request("GET", "/api/state", headers={"X-Client-Id": CLIENT_A})
        self.assertEqual(mine["quotes"][0]["clientName"], "Cliente secreto")

    def test_malicious_quote_payloads_are_rejected(self):
        payloads = [
            {"id": "x');alert(1);//", "total": 1},
            {"id": "CP-1", "items": [{"name": "n", "qty": "1\"><img src=x onerror=alert(1)>", "price": 1}]},
            {"id": "CP-1", "total": "abc"},
            {"id": "CP-1", "currency": "<b>"},
            {"id": "CP-1", "items": {"not": "a list"}},
            {"id": "CP-1", "items": [{"name": "n", "qty": 1, "price": 1}] * 51},
        ]
        for body in payloads:
            status, _, _ = self.request("POST", "/api/quotes", body, {"X-Client-Id": CLIENT_A})
            self.assertEqual(status, 400, body)

    def test_non_object_and_nan_bodies_are_rejected_without_crashing(self):
        for raw in ("[1]", '{"id":"CP-1","total":NaN}', "{broken", '"text"'):
            status, _, _ = self.request("POST", "/api/quotes", raw_body=raw, headers={"X-Client-Id": CLIENT_A})
            self.assertEqual(status, 400, raw)
        self.assertEqual(self.request("GET", "/api/health")[0], 200)

    def test_csrf_requests_are_rejected(self):
        status, _, _ = self.request("POST", "/api/quotes", {"id": "CP-1"},
                                    {"Content-Type": "text/plain", "X-Client-Id": CLIENT_A})
        self.assertEqual(status, 403)
        status, _, _ = self.request("POST", "/api/quotes", {"id": "CP-1"},
                                    {"Origin": "https://evil.example", "X-Client-Id": CLIENT_A})
        self.assertEqual(status, 403)

    def test_sensitive_files_are_blocked_for_get_and_head(self):
        for path in ("/cotizapro.db", "/server.py", "/.env", "/.git/config", "/..%2fserver.py", "/tests/test_security.py"):
            for method in ("GET", "HEAD"):
                status, _, _ = self.request(method, path)
                self.assertEqual(status, 403, f"{method} {path}")

    def test_oversized_body_is_rejected(self):
        raw = json.dumps({"id": "CP-1", "clientName": "x" * (server.MAX_BODY_BYTES + 10)})
        status, _, _ = self.request("POST", "/api/quotes", raw_body=raw, headers={"X-Client-Id": CLIENT_A})
        self.assertEqual(status, 413)

    # --- Phase 4: AI proxy ----------------------------------------------------------------------

    def test_ai_output_is_sanitized_and_rate_limited(self):
        status, data, _ = self.request("POST", "/api/ai/generate", {"brief": "pagina web"})
        self.assertEqual(status, 200)
        proposal = data["proposal"]
        self.assertEqual(proposal["clientName"], "")
        self.assertLessEqual(len(proposal["projectTitle"]), 180)
        self.assertEqual(proposal["items"], [{"name": "Web", "qty": 2.0, "price": 100.0}])
        self.assertNotIn("extra", proposal)
        for _ in range(10):
            self.request("POST", "/api/ai/generate", {"brief": "x"})
        self.assertEqual(self.request("POST", "/api/ai/generate", {"brief": "x"})[0], 429)

    def test_seo_assets_are_public_and_api_is_disallowed(self):
        for path, content_type in (("/robots.txt", "text/plain"), ("/sitemap.xml", "xml"),
                                   ("/favicon.svg", "image/svg+xml"), ("/og-image.png", "image/png")):
            status, _, resp = self.request("GET", path)
            self.assertEqual(status, 200, path)
            self.assertIn(content_type, resp.getheader("Content-Type"), path)
        _, robots, _ = self.request("GET", "/robots.txt")
        self.assertIn(b"Disallow: /api/", robots)

    # --- Phase 6: headers -----------------------------------------------------------------------

    def test_security_headers_are_sent(self):
        _, _, resp = self.request("GET", "/")
        csp = resp.getheader("Content-Security-Policy")
        self.assertIn("script-src 'self';", csp)
        self.assertNotIn("unsafe-inline", csp)
        self.assertIn("frame-ancestors 'none'", csp)
        self.assertEqual(resp.getheader("X-Frame-Options"), "DENY")
        self.assertEqual(resp.getheader("X-Content-Type-Options"), "nosniff")
        if self.checks_server_header:
            self.assertNotIn("Python", resp.getheader("Server"))


class _QuietWSGIRequestHandler(WSGIRequestHandler):
    def log_message(self, fmt, *args):
        pass


class _ThreadingWSGIServer(ThreadingMixIn, WSGIServer):
    daemon_threads = True


class WSGISecurityRegressionTests(SecurityRegressionTests):
    """Same attacks against the WSGI entrypoint used on PythonAnywhere."""

    checks_server_header = False

    @classmethod
    def setUpClass(cls):
        configure_mocks()
        cls.httpd = make_server("127.0.0.1", 0, wsgi.application,
                                server_class=_ThreadingWSGIServer, handler_class=_QuietWSGIRequestHandler)
        cls.port = cls.httpd.server_address[1]
        threading.Thread(target=cls.httpd.serve_forever, daemon=True).start()

    def test_static_frontend_is_served(self):
        status, body, resp = self.request("GET", "/")
        self.assertEqual(status, 200)
        self.assertIn(b"<!DOCTYPE html>", body)
        self.assertIn("text/html", resp.getheader("Content-Type"))
        status, _, resp = self.request("GET", "/tailwind.css")
        self.assertEqual(status, 200)


if __name__ == "__main__":
    unittest.main()
