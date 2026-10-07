import os
import requests
from dotenv import load_dotenv

load_dotenv()
RAWG_API_KEY = os.getenv("RAWG_API_KEY")

# Reusing one session keeps the connection to RAWG open between calls, which is noticeably faster
session = requests.Session()


def rawg_get(endpoint, params=None):
    """
    Helper to call the RAWG API.
    Automatically adds the API key to every request.
    Returns an empty dict if RAWG is down or slow, so routes fail soft instead of crashing.
    """
    params = {**(params or {}), "key": RAWG_API_KEY}
    try:
        response = session.get(f"https://api.rawg.io/api/{endpoint}", params=params, timeout=10)
        return response.json()
    except (requests.RequestException, ValueError):
        return {}
