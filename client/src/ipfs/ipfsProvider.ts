import * as IPFS from "ipfs";

const ipfsNode = new IPFS({});
const remoteNode =
  "/ip4/54.145.221.117/tcp/4001/ipfs/QmfPsMDnvfPRh7xXYfbUMHbT7TZLor5M7iHB29E1ouhz7R";

let ipfsPromise: Promise<IPFS>;
export function getIpfs(): Promise<IPFS> {
  if (ipfsPromise) {
    return ipfsPromise;
  }

  ipfsPromise = new Promise((resolve, reject) => {
    ipfsNode.on("ready", () => {
      ipfsNode.swarm
        .connect(remoteNode)
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

  return ipfsPromise;
}

// Force initialize
getIpfs();
