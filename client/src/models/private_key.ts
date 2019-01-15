import * as Datastore from "nedb";
import { constants } from "../config";

export interface PrivateKeyInternal {
    private_key: string;
  }

export const pkDB = new Datastore({
  filename: constants.GET_DB_PATH("private_key"),
  autoload: true
});
