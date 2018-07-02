from flask import Response
from json import dumps


class JsonResponse(Response):
    JSON_MIME = "application/json"

    def __init__(self, data=None, message=None, status=200):
        resp_obj = {
            "message": message,
            "data": data,
            "status": status
        }
        super().__init__(
            response=dumps(resp_obj),
            status=status,
            mimetype=self.JSON_MIME,
            content_type=self.JSON_MIME
        )
