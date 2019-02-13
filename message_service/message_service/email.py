import logging
import requests

import config

log = logging.getLogger()


def send_notification_email(to_address):
    resp = requests.post(
        "https://api.mailgun.net/v3/sandbox411aefec7b00410eb571457f4ba216b6.mailgun.org/messages",
        auth=("api", config.MAILGUN_API_KEY),
        data={
            "from": "Mailgun Sandbox <postmaster@sandbox411aefec7b00410eb571457f4ba216b6.mailgun.org>",
            "to": to_address,
            "subject": "Notification from medFS",
            "text": "Hello! You have received a new notification from medFS. Please login to view it.",
        },
    )
    if resp.status_code != 200:
        log.info("Request failed: %s", resp.json())
