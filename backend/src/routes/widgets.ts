import { FastifyInstance } from "fastify";
import { requireAuth } from "../middleware/auth.js";
import { syncUser } from "../lib/syncUser.js";
import { prisma } from "../lib/prisma.js";
import { Prisma } from "@prisma/client";

export async function widgetRoutes(app: FastifyInstance) {
  app.addHook("preHandler", requireAuth);

  // ─── GET /pages/:pageId/widgets ───────────────────────────────────────────
  app.get("/pages/:pageId/widgets", async (request, reply) => {
    const user = await syncUser(request.user!.clerkId);
    const { pageId } = request.params as { pageId: string };

    const page = await prisma.page.findFirst({
      where: { id: pageId, userId: user.id },
    });

    if (!page) {
      return reply.status(404).send({ error: "Page not found" });
    }

    const widgets = await prisma.chartWidget.findMany({
      where: { pageId },
      orderBy: { position: "asc" },
    });

    return reply.send(widgets);
  });

  // ─── POST /pages/:pageId/widgets ──────────────────────────────────────────
  app.post("/pages/:pageId/widgets", async (request, reply) => {
    const user = await syncUser(request.user!.clerkId);
    const { pageId } = request.params as { pageId: string };
    const { title, type, config } = request.body as {
      title: string;
      type: string;
      config: Prisma.InputJsonValue;
    };

    const page = await prisma.page.findFirst({
      where: { id: pageId, userId: user.id },
    });

    if (!page) {
      return reply.status(404).send({ error: "Page not found" });
    }

    if (!title?.trim()) {
      return reply.status(400).send({ error: "Widget title is required" });
    }

    if (!type) {
      return reply.status(400).send({ error: "Widget type is required" });
    }

    // Get highest position so new widget appends to end
    const lastWidget = await prisma.chartWidget.findFirst({
      where: { pageId },
      orderBy: { position: "desc" },
    });

    const position = lastWidget ? lastWidget.position + 1 : 0;

    const widget = await prisma.chartWidget.create({
      data: {
        title: title.trim(),
        type,
        config: config ?? Prisma.JsonNull,
        position,
        pageId,
      },
    });

    return reply.status(201).send(widget);
  });

  // ─── PATCH /widgets/:id ───────────────────────────────────────────────────
  app.patch("/widgets/:id", async (request, reply) => {
    const user = await syncUser(request.user!.clerkId);
    const { id } = request.params as { id: string };
    const { title, config, position } = request.body as {
      title?: string;
      config?: Prisma.InputJsonValue;
      position?: number;
    };

    const widget = await prisma.chartWidget.findFirst({
      where: { id },
      include: { page: true },
    });

    if (!widget || widget.page.userId !== user.id) {
      return reply.status(404).send({ error: "Widget not found" });
    }

    const updated = await prisma.chartWidget.update({
      where: { id },
      data: {
        ...(title !== undefined && { title: title.trim() }),
        ...(config !== undefined && { config: config ?? Prisma.JsonNull }),
        ...(position !== undefined && { position }),
      },
    });

    return reply.send(updated);
  });

  // ─── DELETE /widgets/:id ──────────────────────────────────────────────────
  app.delete("/widgets/:id", async (request, reply) => {
    const user = await syncUser(request.user!.clerkId);
    const { id } = request.params as { id: string };

    const widget = await prisma.chartWidget.findFirst({
      where: { id },
      include: { page: true },
    });

    if (!widget || widget.page.userId !== user.id) {
      return reply.status(404).send({ error: "Widget not found" });
    }

    await prisma.chartWidget.delete({ where: { id } });

    return reply.status(204).send();
  });
}
