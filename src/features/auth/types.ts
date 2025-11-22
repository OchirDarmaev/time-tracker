export type UserRole = "account" | "office-manager" | "admin";

export type UserOption = {
  value: string;
  label: string;
};

export type RoleOption = {
  value: UserRole;
  label: string;
};

export type CurrentUser = {
  id: string;
  email: string;
  role: UserRole;
};


