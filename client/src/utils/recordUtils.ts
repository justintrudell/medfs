import { getIpfs } from "../ipfs/ipfsProvider";
import { getKeyForRecord } from "../api/records";
import { file } from "tmp-promise";
import { IPFSFile } from "ipfs";
import util from "util";
const execFile = util.promisify(require("child_process").execFile);
const writeFile = util.promisify(require("fs").writeFile);

export interface TmpFile {
  path: string;
  cleanup: () => void;
}

export async function downloadRecord(
  recordHash: string,
  recordId: string
): Promise<TmpFile> {
  try {
    const ipfs = await getIpfs();
    const files = await ipfs.files.get(recordHash);
    if (files.length !== 1) {
      Promise.reject(
        new Error(`More than one file found for hash: ${recordHash}`)
      );
    }
    return downloadFile(files[0], recordId);
  } catch (err) {
    return Promise.reject(err);
  }
}

async function downloadFile(
  ipfsFile: IPFSFile,
  recordId: string
): Promise<TmpFile> {
  if (!ipfsFile.content) {
    return Promise.reject(new Error("No content in downloaded IPFS file."));
  }
  try {
    const decryptedContents = await decryptFile(
      ipfsFile.content as string,
      recordId
    );
    return decryptedContents;
  } catch (err) {
    return Promise.reject(err);
  }
}

async function decryptFile(
  encryptedContent: string,
  recordId: string
): Promise<TmpFile> {
  const keyAndIv = await getKeyForRecord(recordId);
  const { path: encPath, cleanup: encCleanup } = await file({
    mode: 0o644,
    prefix: "medfstmp-"
  });
  await writeFile(encPath, encryptedContent);
  const { path: outPath, cleanup: outCleanup } = await file({
    mode: 0o644,
    prefix: "medfstmp-"
  });
  await execFile("src/scripts/decrypt_file.sh", [
    encPath,
    outPath,
    keyAndIv.aesKey,
    keyAndIv.iv
  ]);
  encCleanup();
  return { path: outPath, cleanup: outCleanup };
}
