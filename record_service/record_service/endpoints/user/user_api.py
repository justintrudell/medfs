from flask import Blueprint, request


user_api = Blueprint('user_api', __name__)


@user_api.route('/users/<int:user_id>', methods=['GET'])
def get_users(user_id):
  return "Hi user!"