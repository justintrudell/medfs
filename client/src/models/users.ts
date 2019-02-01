import * as Datastore from "nedb";
import { constants } from "../config";

export interface UserInternal {
  userId: string;
  email: string;
  privateKey: string;
  isDoctor: boolean;
}

export const userDB = new Datastore({
  filename: constants.GET_DB_PATH("users"),
  autoload: true
});
