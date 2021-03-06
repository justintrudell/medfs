class UploadError(Exception):
    pass


class PermissionModificationError(Exception):
    pass


class UserNotFoundError(Exception):
    pass


class BaseCryptoError(Exception):
    pass


class UnencryptedKeyProvidedError(BaseCryptoError):
    pass


class InvalidKeyFormatError(BaseCryptoError):
    pass


class InvalidKeyPasswordError(BaseCryptoError):
    pass
