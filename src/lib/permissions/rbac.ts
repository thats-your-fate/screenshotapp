import type { UserRole } from "@prisma/client";

export function isAdmin(role?: UserRole | null): role is "ADMIN" {
  return role === "ADMIN";
}

export function canEditElementByUser(editableByUser: boolean) {
  return editableByUser;
}
