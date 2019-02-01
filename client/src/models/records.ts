export interface RecordItem {
  id: string;
  name: string;
  hash: string;
  created: Date;
  permissionedUsers: [{ id: string; email: string }];
}

export interface RecordDetails {
  id: string;
  creator: string;
  filename: string;
  hash: string;
  aclId: string;
  createdAt: Date;
  archived: boolean;
}

export interface RecordKey {
  aesKey: string;
  iv: string;
}
