import { prisma } from "./prisma.js";
import { clerkClient } from "./clerk.js";

export async function syncUser(clerkId: string) {
  // Check if user already exists in our database
  let user = await prisma.user.findUnique({
    where: { clerkId },
  });

  // fetch their info from Clerk and create them
  if (!user) {
    const clerkUser = await clerkClient.users.getUser(clerkId);

    const email = clerkUser.emailAddresses[0]?.emailAddress ?? "";
    const name =
      `${clerkUser.firstName ?? ""} ${clerkUser.lastName ?? ""}`.trim();

    user = await prisma.user.create({
      data: {
        clerkId,
        email,
        name: name || null,
      },
    });
  }

  return user;
}
