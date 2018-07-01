from json import loads

from flask import Blueprint, request
from flask_login import LoginManager, login_required, login_user, logout_user
from itsdangerous import URLSafeTimedSerializer

from record_service.database.database import db
from record_service.models.user import User
from record_service.constants import SECRET_KEY, COOKIE_AGE


auth_api = Blueprint("auth_api", __name__)
login_manager = LoginManager()
login_serializer = URLSafeTimedSerializer(SECRET_KEY)


@login_manager.user_loader
def load_user(token: str) -> User:
    user_data = login_serializer.loads(token, max_age=COOKIE_AGE)
    user = db.session.query(User).get(user_data[0])
    if user.hashed_password == user_data[1]:
        return user
    return None


@auth_api.route("/login", methods=["POST"])
def login():
    data = loads(request.data)

    if not all(key in data.keys() for key in ["username", "password"]):
        return "Missing fields", 400

    u = db.session.query(User).get(data["username"])

    if not u:
        return "No user found", 401

    if not User.check_password(u.hashed_password, data["password"]):
        return "Invalid password", 401

    remember_me = data.get("remember_me", False)

    # sets the token in the response header, alternatively we can also return
    # the token in the response body
    login_user(u, remember=remember_me)
    return "Success", 200


@auth_api.route("/logout")
@login_required
def logout():
    logout_user()
    return "Success", 200
