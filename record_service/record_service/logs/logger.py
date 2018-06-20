import logging

import config


# TODO: Implement more robust logging functionality
def log(msg: str):
    if config.ENVIRONMENT == "DEV":
        print(msg)
    else:
        logging.getLogger("record_service.root").info(msg)
