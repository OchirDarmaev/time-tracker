import { CurrentUser, RoleOption, UserOption, UserRole } from "./types";

export const roleLabels: Record<UserRole, string> = {
  account: "Account",
  "office-manager": "Office Manager",
  admin: "Admin",
} as const;

export const userOptions: UserOption[] = [
  { value: "1", label: "User 1" },
  { value: "2", label: "User 2" },
  { value: "3", label: "User 3" },
];

export const roleOptions: RoleOption[] = [
  { value: "account", label: "Account" },
  { value: "office-manager", label: "Office Manager" },
  { value: "admin", label: "Admin" },
];

export const getCurrentUser = (): Promise<CurrentUser> => {
  return Promise.resolve({
    id: "1",
    email: "test@example.com",
    role: "account",
  });
};

export const getRoleLabel = (role: UserRole): string => {
  return roleLabels[role];
};
