import * as Datastore from "nedb";
import { constants } from "../config";

export interface UserInternal {
  userId: string;
  email: string;
}

export const userDB = new Datastore({
  filename: constants.GET_DB_PATH("users"),
  autoload: true
});
