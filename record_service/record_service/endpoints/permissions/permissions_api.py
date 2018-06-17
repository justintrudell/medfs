from flask import Blueprint


permission_api = Blueprint('permissions_api', __name__)


@permission_api.route('/permissions/<int:record_id>', methods=['POST'])
def update_permissions(record_id: int) -> str:
  pass
