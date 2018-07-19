import * as IPFS from "ipfs";
import { constants } from "../config";
import { exec } from "child_process";

const ipfsNode = new IPFS({});

let ipfsPromise: Promise<IPFS>;
export function getIpfs(): Promise<IPFS> {
  if (ipfsPromise) {
    return ipfsPromise;
  }

  ipfsPromise = new Promise((resolve, reject) => {
    ipfsNode.on("ready", () => {
      if (constants.IS_PROD) {
        resolve(ipfsNode);
        return;
      }

      // TODO: are there issues with using this path? Also this probably isn't windows friendly
      exec("src/scripts/ipfsAddr.sh", (_error, stdout: string, _stderr) => {
        ipfsNode.swarm
          .connect(stdout)
          .then(() => {
            resolve(ipfsNode);
            return;
          })
          .catch(err => {
            reject(err);
            return;
          });
      });
    });
  });

  return ipfsPromise;
}

// Force initialize
getIpfs();
