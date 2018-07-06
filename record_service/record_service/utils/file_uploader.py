from abc import ABC, abstractmethod
from uuid import uuid4
from datetime import datetime
from werkzeug import secure_filename
import os

from record_service.models.record import Record
from record_service.utils.exceptions import UploadException


class FsWriter(ABC):
    @abstractmethod
    def write(fp):
        pass


class SoftWriter(FsWriter):
    @staticmethod
    def write(fp):
        """Mock upload file."""
        return {"hash": uuid4()}


class IpfsWriter(FsWriter):
    @staticmethod
    def write(fp):
        # TODO: waiting on encryption protocol to be set up first
        pass


class FileUploader(object):
    def __init__(self, fs_writer):
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
        except Exception as e:
            raise UploadException(e.message)
        finally:
            os.remove(path)

        return Record(
            filename=file.filename, record_hash=upload_response["hash"], created=now
        )
