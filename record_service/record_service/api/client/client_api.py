import requests

from app import app


def get_user_info(id: int) -> str:
    r = requests.get("https://example.com/")
    if r.status_code != requests.codes.ok:
        app.logger.info(r.text)
    return r.json()
