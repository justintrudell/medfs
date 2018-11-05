import * as recordService from "./record_service";
import { file } from "tmp-promise";
var tmp = require("tmp");
import util from "util";
import fs from "fs";
const exec = util.promisify(require("child_process").exec);
// Clean up files even if uncaught exceptions occur
tmp.setGracefulCleanup();

export function getUser(userId: number): recordService.RecordServiceResponse {
  return recordService.get(`/users/${userId}`);
}

export function createUser(
  username: string,
  password: string
): recordService.RecordServiceResponse {
  return (async () => {
    const { path, cleanup } = await file({
      mode: 0o644,
      prefix: "medfstmp-"
    });
    await util.promisify(fs.writeFile)(path, password);
    const privKey = await exec(`src/scripts/gen_pk.sh ${path}`);
    // TODO: Figure out how to pipe privKey into stdin instead of echo
    const pubKey = await exec(
      `echo "${privKey}" | src/scripts/extract_pub.sh ${path}`
    );
    cleanup();
    const data = {
      username,
      password,
      keyPair: {
        private: privKey,
        public: pubKey
      }
    };
    return recordService.post(`/users/create`, data);
  })();
}

export function testEndpoint(): recordService.RecordServiceResponse {
  return recordService.get(`/users/test`);
}
