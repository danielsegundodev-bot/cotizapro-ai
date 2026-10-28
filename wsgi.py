"""
WSGI entrypoint (PythonAnywhere and any WSGI host).

Runs every request through the same CotizaProHandler used by `python server.py`, so routing,
validation and security headers live in a single place.
"""

import io

import server

server.init_db()


class _WSGIServerStub:
    """Minimal stand-in for the socketserver the handler normally receives."""

    server_name = "wsgi"
    server_port = 0


def _raw_request(environ):
    method = environ["REQUEST_METHOD"]
    path = environ.get("PATH_INFO", "/") or "/"
    query = environ.get("QUERY_STRING", "")
    target = path + ("?" + query if query else "")

    try:
        length = int(environ.get("CONTENT_LENGTH") or 0)
    except ValueError:
        length = 0
    # Read at most one byte over the limit so the handler can still answer 413
    body = environ["wsgi.input"].read(min(max(length, 0), server.MAX_BODY_BYTES + 1)) if length > 0 else b""

    headers = []
    for key, value in environ.items():
        if key.startswith("HTTP_"):
            headers.append((key[5:].replace("_", "-").title(), value))
    if environ.get("CONTENT_TYPE"):
        headers.append(("Content-Type", environ["CONTENT_TYPE"]))
    headers.append(("Content-Length", str(len(body)) if length <= server.MAX_BODY_BYTES else str(length)))

    head = f"{method} {target} HTTP/1.0\r\n" + "".join(f"{k}: {v}\r\n" for k, v in headers) + "\r\n"
    return head.encode("latin-1", "replace") + body


def _client_ip(environ):
    # PythonAnywhere's front-end proxy sets X-Real-IP; it cannot be spoofed by the visitor
    return environ.get("HTTP_X_REAL_IP") or environ.get("REMOTE_ADDR") or "0.0.0.0"


def application(environ, start_response):
    rfile = io.BytesIO(_raw_request(environ))
    wfile = io.BytesIO()

    handler = server.CotizaProHandler.__new__(server.CotizaProHandler)
    handler.directory = server.BASE_DIR
    handler.rfile = rfile
    handler.wfile = wfile
    handler.client_address = (_client_ip(environ), 0)
    handler.server = _WSGIServerStub()
    handler.close_connection = True
    handler.handle_one_request()

    raw = wfile.getvalue()
    head, _, body = raw.partition(b"\r\n\r\n")
    lines = head.decode("latin-1").split("\r\n")
    status_line = lines[0].split(" ", 2)
    status = f"{status_line[1]} {status_line[2] if len(status_line) > 2 else ''}".strip()
    response_headers = []
    for line in lines[1:]:
        name, _, value = line.partition(":")
        # Hop-by-hop / server-managed headers are set by the WSGI host
        if name.lower() in ("server", "date", "connection"):
            continue
        response_headers.append((name, value.strip()))
    if environ.get("REQUEST_METHOD") == "HEAD":
        body = b""
    start_response(status, response_headers)
    return [body]
