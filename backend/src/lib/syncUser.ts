import { prisma } from "./prisma.js";
import { clerkClient } from "./clerk.js";

export async function syncUser(clerkId: string) {
  // First try to find by clerkId
  let user = await prisma.user.findUnique({
    where: { clerkId },
  });

  if (user) return user;

  // Not found by clerkId — fetch from Clerk
  const clerkUser = await clerkClient.users.getUser(clerkId);

  const email = clerkUser.emailAddresses[0]?.emailAddress ?? "";
  const firstName = clerkUser.firstName ?? "";
  const lastName = clerkUser.lastName ?? "";
  const name = `${firstName} ${lastName}`.trim() || null;

  const existingByEmail = await prisma.user.findUnique({
    where: { email },
  });

  if (existingByEmail) {
    user = await prisma.user.update({
      where: { email },
      data: { clerkId, name },
    });
    return user;
  }

  // Brand new user — create them
  user = await prisma.user.create({
    data: {
      clerkId,
      email,
      name,
    },
  });

  return user;
}
