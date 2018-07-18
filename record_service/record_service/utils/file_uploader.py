from abc import ABC
from uuid import uuid4
from datetime import datetime
from werkzeug import secure_filename
import ipfsapi
import os
from flask import current_app

from record_service.models.record import Record
from record_service.utils.exceptions import UploadException


class FsWriter(ABC):
    def write(self, fp: str) -> dict:
        pass


class MockWriter(FsWriter):
    def write(self, fp: str) -> dict:
        """Mock upload file."""
        return {"Hash": uuid4()}


class IpfsWriter(FsWriter):
    def __init__(self):
        self._client = ipfsapi.connect(host="ipfs", port=5001)

    def write(self, fp: str) -> dict:
        return self._client.add(fp)


class FileUploader:
    def __init__(self, fs_writer: FsWriter):
        self._fs_writer = fs_writer

    def upload(self, file, ext) -> Record:
        if not file.filename:
            raise ValueError("No filename")

        now = datetime.now()

        # TODO: add header data to file
        filename = secure_filename(file.filename)
        path = os.path.join("/tmp", filename)
        file.save(path)

        try:
            upload_response = self._fs_writer.write(path)
            current_app.logger.info(upload_response)
        except Exception as e:
            raise UploadException(str(e))
        finally:
            os.remove(path)

        return Record(
            id=uuid4(),
            filename=file.filename,
            record_hash=upload_response["Hash"],
            created=now,
        )
