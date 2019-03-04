from flask import Blueprint, request
from flask_login import login_required, current_user, logout_user
import json
from sqlalchemy.sql import exists

from record_service.database.database import db
from record_service.models.user import User
from record_service.models.doctor import Doctor
from record_service.models.patient import Patient
from record_service.models.notification import Notification
from record_service.utils.exceptions import (
    UnencryptedKeyProvidedError,
    InvalidKeyFormatError,
    InvalidKeyPasswordError,
)
from record_service.utils.responses import JsonResponse
from record_service.utils.email import send_notification_email

user_api = Blueprint("user_api", __name__)


# test auth works
@user_api.route("/users/test", methods=["GET"])
@login_required
def test():
    return "Hi {}".format(current_user.id)


@user_api.route("/users/create", methods=["POST"])
def create_user():
    data = json.loads(request.data)
    if ("username", "password", "keyPair", "isDoctor") - data.keys() or (
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
        User.validate_password_for_private_key(
            data["password"], data["keyPair"]["private"]
        )
        user = User(
            email=user_id,
            password=user_pw,
            public_key=data["keyPair"]["public"],
            private_key=data["keyPair"]["private"],
        )
        db.session.add(user)
        db.session.commit()
        if data["isDoctor"] is True:
            db.session.add(Doctor(user_id=user.id))
        else:
            db.session.add(Patient(user_id=user.id))
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
    data = json.loads(request.data)
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


@user_api.route("/users/keys", methods=["GET"])
@login_required
def get_keys_for_emails():
    """Retrieve public keys for all clients with provided email addresses."""
    extra_args = set(request.args.keys()) - {"emails", "shouldEmail"}
    if extra_args:
        return f"Received unknown args {extra_args}", 400
    emails = request.args.getlist("emails")
    should_email = request.args.get("shouldEmail", "false") == "true"
    keys = {}
    acct_required_list = []
    for email in emails:
        user_obj = db.session.query(User).filter_by(email=email).one_or_none()
        if user_obj is None:
            acct_required_list.append(email)
        else:
            keys[email] = user_obj.public_key

    if acct_required_list:
        acct_list = ", ".join(acct_required_list)
        msg = f"The following users, {acct_list}, require an account."
        if should_email:
            msg += "They have been emailed to create one."
            for email in acct_required_list:
                send_notification_email(
                    email,
                    "A file has been shared with you in medfs! Sign up to get started.",
                )
        return msg, 400

    return json.dumps(keys), 200


@user_api.route("/users/notifications", methods=["GET"])
@login_required
def get_notifications():
    notifications = (
        db.session.query(Notification)
        .filter_by(user_id=current_user.get_id())
        .order_by(Notification.created_at.desc())
        .all()
    )

    return JsonResponse(
        data=[notification.to_dict() for notification in notifications], status=200
    )
