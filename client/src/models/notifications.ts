export interface MedFsNotification {
  type: string;
  recordId: string;
  privateKey: string;
  email: string;
  encryptedAesKey: string;
  iv: string;
  filename: string;
}
