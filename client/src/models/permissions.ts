export enum PermissionType {
  DISABLED = "Select a permission",
  READ = "READ",
  WRITE = "WRITE"
}

export interface Permission {
  userEmail: string;
  permissionType: PermissionType;
}

// TODO, coalesce this and the above
export interface PermissionRequest {
  email: string;
  values: {
    permission: PermissionType;
    encryptedAesKey: string;
    iv: string;
  };
}
