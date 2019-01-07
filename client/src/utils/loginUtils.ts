import * as localForage from "localforage";
import { constants } from "../config";
import * as _ from "lodash";

export function getLogin(): Promise<UserInternal | null> {
  return localForage.getItem(constants.LOGGEDIN_USER).then(item => {
    if (_.isEmpty(item)) {
      return null;
    } else {
      return item as UserInternal;
    }
  });
}
