"""
WSGI app for the retired ssjosedaniel.pythonanywhere.com account.

Permanently redirects every request (path + query string, e.g. Stripe's ?session_id=)
to the current domain so old links, bookmarks and search results keep working.
"""

NEW_ORIGIN = "https://cotizapro.pythonanywhere.com"


def application(environ, start_response):
    path = environ.get("PATH_INFO", "/") or "/"
    query = environ.get("QUERY_STRING", "")
    location = NEW_ORIGIN + path + ("?" + query if query else "")
    start_response("301 Moved Permanently", [
        ("Location", location),
        ("Content-Type", "text/plain; charset=utf-8"),
        ("Cache-Control", "public, max-age=86400"),
    ])
    return [f"CotizaPro se mudó a {location}\n".encode("utf-8")]
