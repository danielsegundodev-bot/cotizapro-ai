"""
Script Automatizado de Publicación en GitHub + GitHub Pages para danielsegundodev-bot
Uso:
  export GITHUB_TOKEN=...   # o defínelo en .env; nunca lo pases como argumento (queda en el historial y en `ps`)
  python deploy_github.py
"""

import base64
import json
import os
import subprocess
import sys
import urllib.error
import urllib.request

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

GITHUB_USER = "danielsegundodev-bot"
REPO_NAME = "cotizapro-ai"
BASE_DIR = os.path.dirname(os.path.abspath(__file__))


def github_api(method, path, token, payload=None):
    url = f"https://api.github.com{path}"
    data = json.dumps(payload).encode("utf-8") if payload else None
    req = urllib.request.Request(url, data=data, method=method)
    req.add_header("Authorization", f"Bearer {token}")
    req.add_header("Accept", "application/vnd.github+json")
    req.add_header("User-Agent", "CotizaPro-AI-Deployer")
    if data:
        req.add_header("Content-Type", "application/json")
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode("utf-8"))


def main():
    token = os.environ.get("GITHUB_TOKEN", "").strip()
    if len(sys.argv) > 1:
        print("Por seguridad el token ya no se acepta como argumento. Usa la variable de entorno GITHUB_TOKEN.")
        sys.exit(1)
    if not token:
        print("Para desplegar automáticamente en tu cuenta 'danielsegundodev-bot',")
        print("ejecuta: GITHUB_TOKEN=<TU_TOKEN> python deploy_github.py")
        sys.exit(1)

    print(f"1. Creando o verificando repositorio {GITHUB_USER}/{REPO_NAME} en GitHub...")
    try:
        github_api("POST", "/user/repos", token, {
            "name": REPO_NAME,
            "description": "CotizaPro AI — Micro-SaaS de Propuestas Comerciales, Contratos Legales y Auditoría B2B",
            "private": False,
            "auto_init": False
        })
        print("   ✅ Repositorio creado en GitHub.")
    except urllib.error.HTTPError as e:
        if e.code == 422:
            print("   ℹ️ El repositorio ya existe, actualizando código...")
        else:
            raise

    print("2. Subiendo código fuente a la rama main...")
    # The token travels in an HTTP header passed through the environment: it is never written to
    # .git/config, never appears in the remote URL / error messages, and is not visible in `ps`.
    # No --force: a push that would overwrite remote history fails instead of destroying it.
    clean_url = f"https://github.com/{GITHUB_USER}/{REPO_NAME}.git"
    basic = base64.b64encode(f"x-access-token:{token}".encode("utf-8")).decode("ascii")
    git_env = {
        **os.environ,
        "GIT_CONFIG_COUNT": "1",
        "GIT_CONFIG_KEY_0": "http.https://github.com/.extraheader",
        "GIT_CONFIG_VALUE_0": f"Authorization: Basic {basic}",
        "GIT_TERMINAL_PROMPT": "0",
    }
    subprocess.run(["git", "push", clean_url, "HEAD:main"], cwd=BASE_DIR, env=git_env, check=True)

    print("3. Activando GitHub Pages ($0/mes de hosting)...")
    try:
        github_api("POST", f"/repos/{GITHUB_USER}/{REPO_NAME}/pages", token, {
            "build_type": "workflow"
        })
    except urllib.error.HTTPError:
        pass

    print("============================================================")
    print(f"🎉 ¡Despliegue completado con éxito!")
    print(f"🔗 Repositorio: https://github.com/{GITHUB_USER}/{REPO_NAME}")
    print(f"🌐 URL Pública: https://{GITHUB_USER}.github.io/{REPO_NAME}/")
    print("============================================================")


if __name__ == "__main__":
    main()
