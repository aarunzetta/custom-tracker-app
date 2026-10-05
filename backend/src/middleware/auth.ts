import { FastifyRequest, FastifyReply } from "fastify";
import { clerkClient } from "../lib/clerk.js";

export async function requireAuth(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return reply.status(401).send({
        error: "Unauthorized",
        message: "No token provided",
      });
    }

    const token = authHeader.split(" ")[1];

    // Ask Clerk to verify this token
    const payload = await clerkClient.verifyToken(token);

    (request as any).user = {
      clerkId: payload.sub,
    };
  } catch (error) {
    return reply.status(401).send({
      error: "Unauthorized",
      message: "Invalid or expired token",
    });
  }
}
