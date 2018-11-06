from json import loads
from flask import Blueprint, request
from flask_login import login_required, current_user, logout_user
from sqlalchemy.sql import exists

from record_service.database.database import db
from record_service.models.user import User
from record_service.utils.exceptions import (
    UnencryptedKeyProvidedError,
    InvalidKeyFormatError,
    InvalidKeyPasswordError,
)


user_api = Blueprint("user_api", __name__)


# test auth works
@user_api.route("/users/test", methods=["GET"])
@login_required
def test():
    return "Hi {}".format(current_user.id)


@user_api.route("/users/create", methods=["POST"])
def create_user():
    data = loads(request.data)
    if ("username", "password", "keyPair") - data.keys() or (
        "public",
        "private",
    ) - data["keyPair"].keys():
        return "Missing fields", 400

    # TODO: add validation around username and password
    user_id = data["username"]
    user_pw = User.hash_password(data["password"])

    if db.session.query(exists().where(User.email == user_id)).scalar():
        return "User already exists", 400

    try:
        db.session.add(
            User(
                email=user_id,
                password=user_pw,
                public_key=data["keyPair"]["public"],
                private_key=data["keyPair"]["private"],
            )
        )
        db.session.commit()
        return "Success", 201
    except UnencryptedKeyProvidedError:
        return "The private key provided was unencrypted", 400
    except InvalidKeyPasswordError:
        return (
            "The private key could not be decrypted with the provided password",
            400,
        )
    except InvalidKeyFormatError:
        return (
            "The keys provided could not be parsed, ensure they're in PEM format",
            400,
        )
    except Exception as e:
        # TODO: logging
        print(e)
        return "Internal Server Error", 500


@user_api.route("/users/update", methods=["PATCH"])
@login_required
def update_user():
    """ Note: we may want to consider moving away from emails as PK so that
    so that we can support changing a users email address. """
    data = loads(request.data)
    # we only support password changes right now
    if ("password", "privateKey") - data.keys():
        return "Missing fields", 400

    # TODO: do some pw validation
    hashpw = User.hash_password(data["password"])

    u = db.session.query(User).get(current_user.id)

    if not u:
        return "User not found", 404

    u.update(dict(password=hashpw, private_key=data["privateKey"]))
    db.session.commit()

    # invalidate token
    logout_user(current_user)

    return "Success", 200
