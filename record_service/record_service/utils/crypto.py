from cryptography.fernet import Fernet
from typing import Tuple


def encrypt_file(file_path: str) -> Tuple[str, str]:
    """Helper to encrypt files by first opening them and then encrypting their data."""
    with open(file_path, mode="rb") as f:
        return encrypt_data(f.read())


def encrypt_data(data: bytes) -> Tuple[str, str]:
    """Uses Fernet, a python Crypto recipe, for now. Fernet uses AES-128 and CBC,
    ideally we'll want to use AES-256 and CTR, but we can do that in the future.
    """
    key = Fernet.generate_key()
    fernet_obj = Fernet(key)
    encrypted_data = fernet_obj.encrypt(data)
    return (encrypted_data, key)
