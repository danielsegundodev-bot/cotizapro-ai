"""
Despliegue gratuito en PythonAnywhere (plan Beginner) vía su API oficial.

Uso:
  1. Define en tu .env local: PA_USERNAME, PA_API_TOKEN (y opcional PA_REGION=eu),
     además de COTIZAPRO_OWNER_PASSWORD, STRIPE_SECRET_KEY, etc.
  2. python deploy_pythonanywhere.py

Sube solo los archivos necesarios, genera un .env remoto con los secretos del servidor
(nunca el token de PythonAnywhere), configura la app WSGI con HTTPS forzado y la recarga.
"""

import json
import os
import sys
import urllib.error
import urllib.parse
import urllib.request
import uuid

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_FILES = ["index.html", "app.js", "styles.css", "tailwind.css", "server.py", "wsgi.py"]
# Only server secrets are copied to the remote .env; deployment credentials stay local
REMOTE_ENV_KEYS = ["COTIZAPRO_OWNER_PASSWORD", "STRIPE_SECRET_KEY", "STRIPE_PAYMENT_LINK_IDS", "GEMINI_API_KEY"]


def read_dotenv(path):
    values = {}
    if os.path.isfile(path):
        with open(path, encoding="utf-8") as fh:
            for line in fh:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    key, value = line.split("=", 1)
                    values[key.strip()] = value.strip().strip('"').strip("'")
    return values


class PythonAnywhere:
    def __init__(self, username, token, region):
        host = "eu.pythonanywhere.com" if region == "eu" else "www.pythonanywhere.com"
        self.base = f"https://{host}/api/v0/user/{username}"
        self.token = token

    def call(self, method, path, data=None, content_type=None):
        req = urllib.request.Request(self.base + path, data=data, method=method)
        req.add_header("Authorization", f"Token {self.token}")
        if content_type:
            req.add_header("Content-Type", content_type)
        try:
            with urllib.request.urlopen(req, timeout=60) as resp:
                body = resp.read().decode("utf-8")
                return resp.status, (json.loads(body) if body.strip().startswith(("{", "[")) else body)
        except urllib.error.HTTPError as exc:
            return exc.code, exc.read().decode("utf-8", "replace")

    def form(self, method, path, fields):
        data = urllib.parse.urlencode(fields).encode("utf-8")
        return self.call(method, path, data, "application/x-www-form-urlencoded")

    def upload(self, remote_path, content):
        boundary = uuid.uuid4().hex
        body = (
            f"--{boundary}\r\nContent-Disposition: form-data; name=\"content\"; filename=\"f\"\r\n"
            "Content-Type: application/octet-stream\r\n\r\n"
        ).encode("utf-8") + content + f"\r\n--{boundary}--\r\n".encode("utf-8")
        status, resp = self.call("POST", f"/files/path{remote_path}", body, f"multipart/form-data; boundary={boundary}")
        if status not in (200, 201):
            raise SystemExit(f"   ❌ Error subiendo {remote_path}: {status} {resp}")


def main():
    env = {**read_dotenv(os.path.join(BASE_DIR, ".env")), **os.environ}
    username = env.get("PA_USERNAME", "").strip()
    token = env.get("PA_API_TOKEN", "").strip()
    region = env.get("PA_REGION", "us").strip().lower()
    if not username or not token:
        raise SystemExit("Define PA_USERNAME y PA_API_TOKEN en tu .env local (ver .env.example).")
    if not env.get("COTIZAPRO_OWNER_PASSWORD"):
        raise SystemExit("Define COTIZAPRO_OWNER_PASSWORD en tu .env antes de desplegar.")

    pa = PythonAnywhere(username, token, region)
    domain = f"{username}.{'eu.' if region == 'eu' else ''}pythonanywhere.com"
    project_dir = f"/home/{username}/cotizapro-ai"

    print(f"1. Subiendo archivos a {project_dir} ...")
    for name in PROJECT_FILES:
        with open(os.path.join(BASE_DIR, name), "rb") as fh:
            pa.upload(f"{project_dir}/{name}", fh.read())
        print(f"   ✅ {name}")

    remote_env = "".join(f"{k}={env[k]}\n" for k in REMOTE_ENV_KEYS if env.get(k))
    remote_env += "HOST=127.0.0.1\nTRUST_PROXY=0\n"
    pa.upload(f"{project_dir}/.env", remote_env.encode("utf-8"))
    print(f"   ✅ .env remoto ({', '.join(k for k in REMOTE_ENV_KEYS if env.get(k))})")

    print(f"2. Configurando la app web {domain} ...")
    status, _ = pa.call("GET", f"/webapps/{domain}/")
    if status == 404:
        _, versions = pa.call("GET", "/default_python_version/")
        available = versions.get("available_python_versions", []) if isinstance(versions, dict) else []
        candidates = sorted((v for v in available if str(v).startswith("3.")), key=lambda v: tuple(int(p) for p in v.split(".")))
        python_version = "python" + (candidates[-1].replace(".", "") if candidates else "310")
        status, resp = pa.form("POST", "/webapps/", {"domain_name": domain, "python_version": python_version})
        if status not in (200, 201):
            raise SystemExit(f"   ❌ No se pudo crear la app: {status} {resp}")
        print(f"   ✅ App creada ({python_version})")
    else:
        print("   ℹ️ La app ya existe, se actualiza")

    wsgi_path = f"/var/www/{domain.replace('.', '_')}_wsgi.py"
    wsgi_source = (
        "import sys\n"
        f"sys.path.insert(0, {project_dir!r})\n"
        "from wsgi import application  # noqa: E402,F401\n"
    )
    pa.upload(wsgi_path, wsgi_source.encode("utf-8"))
    print(f"   ✅ {wsgi_path}")

    status, resp = pa.form("PATCH", f"/webapps/{domain}/", {"source_directory": project_dir, "force_https": "true"})
    if status != 200:
        print(f"   ⚠️ No se pudo forzar HTTPS ({status}); actívalo en la pestaña Web.")

    print("3. Recargando ...")
    status, resp = pa.call("POST", f"/webapps/{domain}/reload/")
    if status != 200:
        raise SystemExit(f"   ❌ Error al recargar: {status} {resp}")

    print("============================================================")
    print(f"🎉 CotizaPro está en línea: https://{domain}/")
    print(f"💳 Redirección de Stripe: https://{domain}/?session_id={{CHECKOUT_SESSION_ID}}")
    print("============================================================")


if __name__ == "__main__":
    main()
