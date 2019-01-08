import { UserInternal, userDB } from "../models/users";

export function getLogin(): Promise<UserInternal | null> {
  return new Promise((resolve, reject) => {
    userDB.findOne({}, (err, doc) => {
      if (err) {
        reject(err);
      }

      resolve(doc as UserInternal | null);
    });
  });
}

export function setLogin(user: UserInternal): Promise<UserInternal> {
  return new Promise((resolve, reject) => {
    userDB.insert(user, (err, doc) => {
      if (err) {
        reject(err);
      }

      resolve(doc);
    });
  });
}

export function clearLogin(): Promise<boolean> {
  return new Promise((resolve, reject) => {
    userDB.remove({}, { multi: true }, (err, _) => {
      if (err) {
        reject(err);
      }

      resolve(true);
    });
  });
}
