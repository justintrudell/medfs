import { getIpfs } from "../ipfs/ipfsProvider";
import { getKeyForRecord } from "../api/records";
import { file } from "tmp-promise";
import { IPFSFile } from "ipfs";
import util from "util";
const exec = util.promisify(require("child_process").exec);
const writeFile = util.promisify(require("fs").writeFile);

export interface TmpFile {
  path: string;
  cleanup: () => void;
}

export async function downloadRecord(recordHash: string, recordId: string) : Promise<TmpFile> {
  try {
    const ipfs = await getIpfs();
    const files = await ipfs.files.get(recordHash);
    if (files.length !== 1) {
      Promise.reject(new Error(`More than one file found for hash: ${recordHash}`));
    }
    return downloadFile(files[0], recordId);
  }
  catch (err) {
    return Promise.reject(err);
  }
}

async function downloadFile(ipfsFile: IPFSFile, recordId: string): Promise<TmpFile> {
  if (!ipfsFile.content) {
    return Promise.reject(new Error("No content in downloaded IPFS file."));
  }
  const { path: outPath, cleanup: outCleanup } = await file({
    mode: 0o644,
    prefix: "medfstmp-"
  });

  const decryptedContents = await decryptFile(ipfsFile.content as string, recordId);
  try {
    await writeFile(outPath, decryptedContents);
    return {"path": outPath, "cleanup": outCleanup};
  }
  catch (err) {
    return Promise.reject(err);
  }
}

async function decryptFile(encryptedContent: string, recordId: string): Promise<string> {
  const keyAndIv = await getKeyForRecord(recordId);
  const { path: encPath, cleanup: encCleanup } = await file({
    mode: 0o644,
    prefix: "medfstmp-"
  });
  await writeFile(encPath, encryptedContent);
  const decryptedContents = await exec(
    `src/scripts/decrypt_file.sh "${encPath}" "${keyAndIv.aesKey}" "${
      keyAndIv.iv
    }"`
  );
  encCleanup();
  return decryptedContents.stdout;
}