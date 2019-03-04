export interface MedFsNotification {
  type: string;
  recordId: string;
  privateKey: string;
  email: string;
  encryptedAesKey: string;
  iv: string;
  filename: string;
  senderEmail: string;
}

export enum NotificationType {
  CREATE = "CREATE",
  UPDATE = "UPDATE",
  REVOKE = "REVOKE",
  ADD_USER = "ADD_USER"
}

export interface StaticNotification {
  id: string;
  userId: string;
  notificationType: NotificationType;
  content: {};
  sender: string;
  createdAt: Date;
}
