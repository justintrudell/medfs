export enum PermissionType {
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
  value: PermissionType;
}
