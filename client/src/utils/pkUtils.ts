import { pkDB, PrivateKeyInternal } from "../models/private_key";

export function getPk(): Promise<PrivateKeyInternal | null> {
  return new Promise((resolve, reject) => {
    pkDB.findOne({}, (err, doc) => {
      if (err) {
        reject(err);
      }

      resolve(doc as PrivateKeyInternal | null);
    });
  });
}

export function setPk(pk: PrivateKeyInternal): Promise<PrivateKeyInternal> {
  return new Promise((resolve, reject) => {
    pkDB.insert(pk, (err, doc) => {
      if (err) {
        reject(err);
      }

      resolve(doc);
    });
  });
}

export function clearPk(): Promise<boolean> {
  return new Promise((resolve, reject) => {
    pkDB.remove({}, { multi: true }, (err, _) => {
      if (err) {
        reject(err);
      }

      resolve(true);
    });
  });
}
