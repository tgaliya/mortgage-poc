export type UserStatus = 'Active' | 'Inactive';

export interface AppUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  /** Stored as plain text - POC only, no backend available to hash it. */
  password: string;
  roleId: string;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
}
