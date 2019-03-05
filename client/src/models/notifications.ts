export interface MedFsNotification {
  id: string;
  userId: string;
  notificationType: NotificationType;
  content: {};
  sender: string;
  createdAt: Date;
}

export enum NotificationType {
  CREATE = "CREATE",
  UPDATE = "UPDATE",
  REVOKE = "REVOKE",
  ADD_USER = "ADD_USER"
}

export interface CreateNotification extends MedFsNotification {
  content: {
    email: string;
    filename: string;
    recordId: string;
    senderEmail: string;
  };
}

export interface UpdateNotification extends MedFsNotification {
  content: {
    email: string;
    filename: string;
    recordId: string;
    senderEmail: string;
  };
}

export interface RevokeNotification extends MedFsNotification {
  // To-do
}

export interface AddUserNotification extends MedFsNotification {
  // to-do
}