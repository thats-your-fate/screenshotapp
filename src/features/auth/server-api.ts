import { auth } from "@/features/auth/auth";
import { db } from "@/lib/db/prisma";

export async function getCurrentApiUser() {
  const session = await auth();
  if (!session?.user?.id) {
    return null;
  }

  return db.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, email: true, role: true, createdAt: true, updatedAt: true },
  });
}
