"""
Script Automatizado de Publicación en GitHub + GitHub Pages para danielsegundodev-bot
Uso:
  python deploy_github.py <TU_GITHUB_TOKEN>
"""

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
    token = sys.argv[1] if len(sys.argv) > 1 else os.environ.get("GITHUB_TOKEN", "").strip()
    if not token:
        print("Para desplegar automáticamente en tu cuenta 'danielsegundodev-bot',")
        print("ejecuta: python deploy_github.py <TU_GITHUB_PERSONAL_ACCESS_TOKEN>")
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
    remote_url = f"https://{GITHUB_USER}:{token}@github.com/{GITHUB_USER}/{REPO_NAME}.git"
    subprocess.run(["git", "branch", "-M", "main"], cwd=BASE_DIR, check=True)
    subprocess.run(["git", "remote", "remove", "origin"], cwd=BASE_DIR, stderr=subprocess.DEVNULL)
    subprocess.run(["git", "remote", "add", "origin", remote_url], cwd=BASE_DIR, check=True)
    subprocess.run(["git", "push", "-u", "origin", "main", "--force"], cwd=BASE_DIR, check=True)

    # Reset remote URL to clean URL without token stored in .git/config
    clean_url = f"https://github.com/{GITHUB_USER}/{REPO_NAME}.git"
    subprocess.run(["git", "remote", "set-url", "origin", clean_url], cwd=BASE_DIR, check=True)

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
