import { FastifyInstance } from "fastify";
import { requireAuth } from "../middleware/auth.js";
import { syncUser } from "../lib/syncUser.js";
import { prisma } from "../lib/prisma.js";

export async function pageRoutes(app: FastifyInstance) {
  // All routes here require auth
  app.addHook("preHandler", requireAuth);

  // GET /pages — list all pages for the current user
  app.get("/pages", async (request, reply) => {
    const user = await syncUser(request.user!.clerkId);

    const pages = await prisma.page.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        name: true,
        icon: true,
        createdAt: true,
      },
    });

    return reply.send(pages);
  });

  // POST /pages — create a new page
  app.post("/pages", async (request, reply) => {
    const user = await syncUser(request.user!.clerkId);
    const { name } = request.body as { name: string };

    if (!name?.trim()) {
      return reply.status(400).send({ error: "Page name is required" });
    }

    const page = await prisma.page.create({
      data: {
        name: name.trim(),
        userId: user.id,
      },
      select: {
        id: true,
        name: true,
        icon: true,
        createdAt: true,
      },
    });

    return reply.status(201).send(page);
  });

  // GET /pages/:id — get a single page
  app.get("/pages/:id", async (request, reply) => {
    const user = await syncUser(request.user!.clerkId);
    const { id } = request.params as { id: string };

    const page = await prisma.page.findFirst({
      where: { id, userId: user.id },
      select: {
        id: true,
        name: true,
        icon: true,
        createdAt: true,
      },
    });

    if (!page) {
      return reply.status(404).send({ error: "Page not found" });
    }

    return reply.send(page);
  });

  // PATCH /pages/:id — update a page
  app.patch("/pages/:id", async (request, reply) => {
    const user = await syncUser(request.user!.clerkId);
    const { id } = request.params as { id: string };
    const { name, icon } = request.body as { name?: string; icon?: string };

    const page = await prisma.page.findFirst({
      where: { id, userId: user.id },
    });

    if (!page) {
      return reply.status(404).send({ error: "Page not found" });
    }

    const updated = await prisma.page.update({
      where: { id },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(icon !== undefined && { icon }),
      },
      select: {
        id: true,
        name: true,
        icon: true,
        createdAt: true,
      },
    });

    return reply.send(updated);
  });

  // DELETE /pages/:id — delete a page
  app.delete("/pages/:id", async (request, reply) => {
    const user = await syncUser(request.user!.clerkId);
    const { id } = request.params as { id: string };

    const page = await prisma.page.findFirst({
      where: { id, userId: user.id },
    });

    if (!page) {
      return reply.status(404).send({ error: "Page not found" });
    }

    await prisma.page.delete({ where: { id } });

    return reply.status(204).send();
  });
}
