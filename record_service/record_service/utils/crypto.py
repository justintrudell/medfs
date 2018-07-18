from cryptography.fernet import Fernet
from typing import Tuple


def encrypt_file(data: str) -> Tuple[str, str]:
    """Uses Fernet, a python Crypto recipe, for now. Fernet uses AES-128 and CBC,
    ideally we'll want to use AES-256 and CTR, but we can do that in the future.
    """
    key = Fernet.generate_key()
    f = Fernet(key)
    encrypted_data = f.encrypt(data.encode())
    return (encrypted_data, key)
