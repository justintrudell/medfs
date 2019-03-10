from abc import ABC
from datetime import datetime
from flask import current_app
from werkzeug import secure_filename
import ipfsapi
import os
from uuid import uuid4
from config import IPFS_HOST, IPFS_PORT

from record_service.models.record import Record
from record_service.utils.exceptions import UploadError


class FsWriter(ABC):
    def write(self, fp: str) -> dict:
        pass


class MockWriter(FsWriter):
    def write(self, fp: str) -> dict:
        """Mock upload file."""
        return {"Hash": uuid4()}


class IpfsWriter(FsWriter):
    def __init__(self):
        self._client = None

    # Lazily connect to handle case where record-srv deploys before IPFS
    @property
    def client(self):
        if self._client is None:
            self._client = ipfsapi.connect(host=IPFS_HOST, port=IPFS_PORT)
        return self._client

    def write(self, fp: str) -> dict:
        return self.client.add(fp)


class FileUploader:
    def __init__(self, fs_writer: FsWriter) -> None:
        self._fs_writer = fs_writer

    def _save_temp_file(self, flask_file) -> str:
        if not flask_file.filename:
            raise ValueError("No filename on uploaded file")
        # TODO: add header data to file
        filename = secure_filename(flask_file.filename)
        path = os.path.join("/tmp", filename)
        flask_file.save(path)
        return path

    def update(self, flask_file, filename: str, record_id: str):
        path = self._save_temp_file(flask_file)
        try:
            upload_response = self._fs_writer.write(path)
            current_app.logger.info(upload_response)
        except Exception as e:
            raise UploadError(str(e))

        return {"filename": filename, "record_hash": upload_response["Hash"]}

    def upload(self, flask_file, filename: str) -> Record:
        path = self._save_temp_file(flask_file)
        now = datetime.now()
        try:
            upload_response = self._fs_writer.write(path)
            current_app.logger.info(upload_response)
        except Exception as e:
            raise UploadError(str(e))

        return Record(
            id=uuid4(),
            filename=filename,
            record_hash=upload_response["Hash"],
            created=now,
        )
