import asyncio
from aiohttp import web
from aiohttp_sse import sse_response
import json
import logging
import re
import requests
from typing import Any, Optional

import config
from message_service import queueing_api, email


log = logging.getLogger()


class ServerSentEvent:
    def __init__(self, message: Any) -> None:
        msg_dict = json.loads(message.body)
        self.data = msg_dict["body"]
        self.id = msg_dict["id"]

    def encode(self) -> str:
        return self.data


def check_credentials(request) -> Optional[web.Response]:
    check_url = f"http://{config.RECORD_SVC_HOST}:{config.RECORD_SVC_PORT}/is_logged_in"
    try:
        r = requests.get(check_url, cookies=request.cookies)
    except requests.ConnectionError:
        # Assume record service is not yet up, return 500 for now
        return web.Response(status=500)
    if r.status_code != 200:
        return web.Response(status=r.status_code)
    return None


async def stream(request):
    check_res = check_credentials(request)
    if check_res is not None:
        return check_res
    user_uuid = request.match_info["uuid"]
    async with sse_response(request) as resp:
        while True:
            for message in queueing_api.receive_messages(user_uuid):
                encoded_msg = ServerSentEvent(message).encode()
                await resp.send(encoded_msg)
                # Delete the message from the queue
                message.delete()
                email_addr = json.loads(encoded_msg)["content"]["email"]
                # Perform some basic email validation
                if re.match(r"^[^@\s]+@[^@\s]+\.[^@\s]+$", email_addr):
                    email.send_notification_email(email_addr)
            await asyncio.sleep(
                int(config.SQS_POLLING_INTERVAL_S), loop=request.app.loop
            )
    return resp
