import { FastifyInstance } from "fastify";
import { requireAuth } from "../middleware/auth.js";
import { syncUser } from "../lib/syncUser.js";
import { prisma } from "../lib/prisma.js";
import { ColumnType, Prisma } from "@prisma/client";

// Valid column types as an array for validation
const VALID_TYPES: ColumnType[] = [
  "TEXT",
  "NUMBER",
  "DATE",
  "CHECKBOX",
  "SELECT",
  "URL",
];

export async function columnRoutes(app: FastifyInstance) {
  // All routes require auth
  app.addHook("preHandler", requireAuth);

  // ─── GET /pages/:pageId/columns ───────────────────────────────────────────
  // Returns all columns for a page, ordered by their position
  app.get("/pages/:pageId/columns", async (request, reply) => {
    const user = await syncUser(request.user!.clerkId);
    const { pageId } = request.params as { pageId: string };

    // Make sure this page belongs to the current user
    const page = await prisma.page.findFirst({
      where: { id: pageId, userId: user.id },
    });

    if (!page) {
      return reply.status(404).send({ error: "Page not found" });
    }

    const columns = await prisma.column.findMany({
      where: { pageId },
      orderBy: { order: "asc" },
    });

    return reply.send(columns);
  });

  // ─── POST /pages/:pageId/columns ──────────────────────────────────────────
  // Creates a new column on a page
  app.post("/pages/:pageId/columns", async (request, reply) => {
    const user = await syncUser(request.user!.clerkId);
    const { pageId } = request.params as { pageId: string };
    const { name, type, options } = request.body as {
      name: string;
      type: string;
      options?: { choices: string[] };
    };

    // Validate the page belongs to the user
    const page = await prisma.page.findFirst({
      where: { id: pageId, userId: user.id },
    });

    if (!page) {
      return reply.status(404).send({ error: "Page not found" });
    }

    // Validate inputs
    if (!name?.trim()) {
      return reply.status(400).send({ error: "Column name is required" });
    }

    if (!VALID_TYPES.includes(type as ColumnType)) {
      return reply.status(400).send({
        error: `Invalid column type. Must be one of: ${VALID_TYPES.join(", ")}`,
      });
    }

    // SELECT type requires at least one option
    if (
      type === "SELECT" &&
      (!options?.choices || options.choices.length === 0)
    ) {
      return reply.status(400).send({
        error: "Select columns must have at least one choice",
      });
    }

    // Get the highest current order value so we append to the end
    const lastColumn = await prisma.column.findFirst({
      where: { pageId },
      orderBy: { order: "desc" },
    });

    const nextOrder = lastColumn ? lastColumn.order + 1 : 0;

    const column = await prisma.column.create({
      data: {
        name: name.trim(),
        type: type as ColumnType,
        order: nextOrder,
        options: options ?? Prisma.JsonNull,
        pageId,
      },
    });

    return reply.status(201).send(column);
  });

  // ─── PATCH /columns/:id ───────────────────────────────────────────────────
  // Updates a column's name, options, or order
  app.patch("/columns/:id", async (request, reply) => {
    const user = await syncUser(request.user!.clerkId);
    const { id } = request.params as { id: string };
    const { name, options, order } = request.body as {
      name?: string;
      options?: { choices: string[] };
      order?: number;
    };

    // Find the column and verify the user owns the page it belongs to
    const column = await prisma.column.findFirst({
      where: { id },
      include: { page: true },
    });

    if (!column || column.page.userId !== user.id) {
      return reply.status(404).send({ error: "Column not found" });
    }

    // If reordering, shift other columns to make room
    // Example: moving column from order 3 to order 1
    // means columns at 1 and 2 need to shift up to 2 and 3
    if (order !== undefined && order !== column.order) {
      const movingDown = order > column.order;

      if (movingDown) {
        // Moving toward the end — shift columns in between down by 1
        await prisma.column.updateMany({
          where: {
            pageId: column.pageId,
            order: { gt: column.order, lte: order },
          },
          data: { order: { decrement: 1 } },
        });
      } else {
        // Moving toward the start — shift columns in between up by 1
        await prisma.column.updateMany({
          where: {
            pageId: column.pageId,
            order: { gte: order, lt: column.order },
          },
          data: { order: { increment: 1 } },
        });
      }
    }

    const updated = await prisma.column.update({
      where: { id },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(options !== undefined && { options: options ?? Prisma.JsonNull }),
        ...(order !== undefined && { order }),
      },
    });

    return reply.send(updated);
  });

  // ─── DELETE /columns/:id ──────────────────────────────────────────────────
  // Deletes a column and all its cells (cascade handles cells automatically)
  app.delete("/columns/:id", async (request, reply) => {
    const user = await syncUser(request.user!.clerkId);
    const { id } = request.params as { id: string };

    const column = await prisma.column.findFirst({
      where: { id },
      include: { page: true },
    });

    if (!column || column.page.userId !== user.id) {
      return reply.status(404).send({ error: "Column not found" });
    }

    // Delete the column — cells are deleted automatically via cascade
    await prisma.column.delete({ where: { id } });

    // Reorder remaining columns to close the gap
    // Example: if we deleted column at order 2 from [0,1,2,3,4]
    // we want [0,1,2,3] not [0,1,3,4]
    await prisma.column.updateMany({
      where: {
        pageId: column.pageId,
        order: { gt: column.order },
      },
      data: { order: { decrement: 1 } },
    });

    return reply.status(204).send();
  });
}
