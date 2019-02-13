import logging
import requests

import config

log = logging.getLogger()


def send_notification_email(to_address):
    sender = "medFS <postmaster@sandbox411aefec7b00410eb571457f4ba216b6.mailgun.org>"
    msg = (
        "Hello! You have received a new notification from medFS. "
        "Please login to view it."
    )
    url = (
        "https://api.mailgun.net/v3/sandbox411aefec7b00410eb571457f4ba216b6"
        ".mailgun.org/messages"
    )
    resp = requests.post(
        url,
        auth=("api", config.MAILGUN_API_KEY),
        data={
            "from": sender,
            "to": to_address,
            "subject": "Notification from medFS",
            "text": msg,
        },
    )
    if resp.status_code != 200:
        log.info("Request failed: %s", resp.json())
