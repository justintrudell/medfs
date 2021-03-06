from json import loads

from flask import Blueprint, request
from flask_login import LoginManager, login_required, login_user, logout_user

from record_service.database.database import db
from record_service.models.user import User
from record_service.models.doctor import Doctor
from record_service.utils.responses import JsonResponse


auth_api = Blueprint("auth_api", __name__)
login_manager = LoginManager()


@login_manager.user_loader
def load_user(user_id: str) -> User:
    return db.session.query(User).get(user_id)


# [
#     Data object:
#     {
#         userId: string,
#         privateKey: string,
#         isDoctor: bool,
#     }
# ]
@auth_api.route("/login", methods=["POST"])
def login():
    data = loads(request.data)

    if not all(key in data.keys() for key in ["username", "password"]):
        return "Missing fields", 400

    u = db.session.query(User).filter(User.email == data["username"]).first()

    if not u:
        return "No user found", 401

    if not User.check_password(u.password, data["password"]):
        return "Invalid password", 401

    # Find out if person is a doctor or patient. For now, we assume only one of the two.
    doctor = db.session.query(Doctor).filter(Doctor.user_id == u.id).first()

    remember_me = data.get("remember_me", False)

    # sets the token in the response header, alternatively we can also return
    # the token in the response body
    login_user(u, remember=remember_me)
    data = {
        "userId": str(u.id),
        "privateKey": u.private_key,
        "isDoctor": doctor is not None,
    }
    return JsonResponse(data=data, message="Success", status=200)


@auth_api.route("/logout", methods=["POST"])
@login_required
def logout():
    logout_user()
    return "Success", 200


@auth_api.route("/is_logged_in", methods=["GET"])
@login_required
def is_logged_in():
    """Used by the message service to determine if requesting users are logged in
    given the provided cookies.
    """
    return "Success", 200
