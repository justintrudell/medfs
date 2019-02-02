from aiohttp import web


def healthcheck(request):
    return web.Response(text="Healthy!")
