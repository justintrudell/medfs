export enum PermissionType {
  READ = "READ",
  WRITE = "WRITE"
}

export interface Permission {
  userEmail: string;
  permissionType: PermissionType;
}
