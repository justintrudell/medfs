import logging
import requests

import config

log = logging.getLogger()


def send_notification_email(to_address, msg):
    sender = "medFS <notifications@mail.medfs.io>"

    url = "https://api.mailgun.net/v3/mail.medfs.io/messages"
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
        log.info("Request failed: %s", resp)
