"""
Vercel entrypoint for the Flask backend.

Vercel serves the React build as static files and sends every /api/* request here.
The Flask routes don't have an /api prefix (so local dev and Docker are unchanged),
so we mount the app under /api instead.
"""
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "backend"))

from werkzeug.middleware.dispatcher import DispatcherMiddleware  # noqa: E402
from werkzeug.wrappers import Response  # noqa: E402
from server import app as flask_app  # noqa: E402

app = DispatcherMiddleware(Response("Not found", status=404), {"/api": flask_app})
