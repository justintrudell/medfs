from aiohttp import web

import config
from message_service import stream_api, healthcheck


app = web.Application()
app.router.add_route("GET", "/messages/stream/{uuid}", stream_api.stream)
app.router.add_route("GET", "/healthcheck", healthcheck.healthcheck)
web.run_app(app, host=config.APP_HOST, port=config.APP_PORT)
