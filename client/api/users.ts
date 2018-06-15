let record_svc = require("./record_service")

export function get_user(user_id: number) {
    return record_svc.get(`/users/${user_id}`);
}
