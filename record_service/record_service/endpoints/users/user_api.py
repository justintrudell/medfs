from json import loads
from flask import (Blueprint, request)
from flask_login import (login_required, current_user,
                         login_user, logout_user)

from record_service.database.database import db
from record_service.models.user import User


user_api = Blueprint("user_api", __name__)


# test auth works
@user_api.route("/users/test", methods=["GET"])
@login_required
def test():
    return "Hi {}".format(current_user.id)


@user_api.route("/users/create", methods=["POST"])
def create_user():
    data = loads(request.data)
    if not all(key in data.keys() for key in ["username", "password"]):
        return "Missing fields", 400

    # TODO: add validation around username and password
    user_id = data["username"]
    user_hashpw = User.hash_password(data["password"])

    if db.session.query(User).get(user_id) is not None:
        return "User already exists", 400

    try:
        db.session.add(User(id=user_id, hashed_password=user_hashpw))
        db.session.commit()
        return "Success", 201
    except Exception:
        # TODO: logging
        return "Internal Server Error", 500


@user_api.route("/users/update", methods=["PATCH"])
@login_required
def update_user():
    """ Note: we may want to consider moving away from emails as PK so that
    so that we can support changing a users email address. """
    data = loads(request.data)
    # we only support password changes right now
    if "password" not in data.keys():
        return "Missing fields", 400

    # TODO: do some pw validation
    hashpw = User.hash_password(data["password"])

    u = db.session.query(User).get(current_user.id)

    if not u:
        return "User not found", 404

    u.update(dict(hashed_password=hashpw))
    db.session.commit()

    # invalidate token
    logout_user(current_user)
    login_user(u)

    return "Success", 200
