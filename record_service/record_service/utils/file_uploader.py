from abc import ABC
from datetime import datetime
from flask import current_app
import ipfsapi
import tempfile
from uuid import uuid4

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
    def __init__(self, fs_writer: FsWriter) -> None:
        self._fs_writer = fs_writer

    def upload_bytes(self, flask_filename: str, data: bytes, ext: str) -> Record:
        """Helper to upload bytes rather than a file."""
        with tempfile.NamedTemporaryFile() as tmp_f:
            tmp_f.write(data)
            tmp_f.flush()
            return self.upload(flask_filename, tmp_f.name, ext)

    def upload(self, filename: str, path: str, ext: str) -> Record:
        now = datetime.now()
        try:
            upload_response = self._fs_writer.write(path)
            current_app.logger.info(upload_response)
        except Exception as e:
            raise UploadException(str(e))

        return Record(
            id=uuid4(),
            filename=filename,
            record_hash=upload_response["Hash"],
            created=now,
        )
