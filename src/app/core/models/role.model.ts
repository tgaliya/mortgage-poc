export type RoleStatus = 'Active' | 'Inactive';

export interface Role {
  id: string;
  roleName: string;
  description?: string;
  status: RoleStatus;
  permissionIds: string[];
  createdAt: string;
  updatedAt: string;
}
