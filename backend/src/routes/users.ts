import { FastifyInstance } from "fastify";
import { requireAuth } from "../middleware/auth.js";
import { syncUser } from "../lib/syncUser.js";

export async function userRoutes(app: FastifyInstance) {
  // GET /me — returns the current user
  app.get("/me", { preHandler: requireAuth }, async (request, reply) => {
    const user = await syncUser(request.user!.clerkId);

    return reply.send({
      id: user.id,
      clerkId: user.clerkId,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
    });
  });
}
