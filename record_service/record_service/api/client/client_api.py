import requests

from record_service.logs.logger import log


def get_user_info(id: int) -> str:
    r = requests.get("https://example.com/")
    if r.status_code != requests.codes.ok:
        log(r.text)
    return r.json()
