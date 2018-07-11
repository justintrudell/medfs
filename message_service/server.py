import asyncio
from aiohttp import web
from aiohttp_sse import sse_response
from datetime import datetime
import requests


async def stream(request):
    url = "http://0.0.0.0:5000/is_logged_in"
    r = requests.get(url, cookies=request.cookies)
    if r.status_code != 200:
        return web.Response(status=r.status_code)
    async with sse_response(request) as resp:
        while True:
            data = 'Server Time : {}'.format(datetime.now())
            await resp.send(data)
            await asyncio.sleep(1, loop=request.app.loop)
    return resp

app = web.Application()
app.router.add_route('GET', '/messages/stream', stream)
web.run_app(app, host='0.0.0.0', port=5004)
