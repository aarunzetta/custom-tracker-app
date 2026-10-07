import { FastifyInstance } from "fastify";
import { requireAuth } from "../middleware/auth.js";
import { syncUser } from "../lib/syncUser.js";
import { prisma } from "../lib/prisma.js";

export async function rowRoutes(app: FastifyInstance) {
  app.addHook("preHandler", requireAuth);

  // ─── GET /pages/:pageId/rows ───────────────────────────────────────────────
  // Fetches all rows for a page WITH their cells and column info
  // This is the main data fetch for the table
  app.get("/pages/:pageId/rows", async (request, reply) => {
    const user = await syncUser(request.user!.clerkId);
    const { pageId } = request.params as { pageId: string };

    // Verify page ownership
    const page = await prisma.page.findFirst({
      where: { id: pageId, userId: user.id },
    });

    if (!page) {
      return reply.status(404).send({ error: "Page not found" });
    }

    // Fetch rows with cells, and each cell includes its column definition
    // This gives the frontend everything it needs to render the table in one request
    const rows = await prisma.row.findMany({
      where: { pageId },
      orderBy: { createdAt: "asc" },
      include: {
        cells: {
          include: {
            column: {
              select: {
                id: true,
                name: true,
                type: true,
                order: true,
                options: true,
              },
            },
          },
        },
      },
    });

    // Transform the data into a flat, table-friendly shape
    // Instead of nested cells array, return an object keyed by columnId
    // This makes it very easy to look up a cell value in the table UI
    const transformed = rows.map((row) => ({
      id: row.id,
      pageId: row.pageId,
      createdAt: row.createdAt,
      // cells becomes { [columnId]: { id, value } }
      cells: row.cells.reduce(
        (acc, cell) => {
          acc[cell.columnId] = {
            id: cell.id,
            value: cell.value,
          };
          return acc;
        },
        {} as Record<string, { id: string; value: string | null }>,
      ),
    }));

    return reply.send(transformed);
  });

  // ─── POST /pages/:pageId/rows ──────────────────────────────────────────────
  // Creates a new empty row — cells are created on demand when user types
  app.post("/pages/:pageId/rows", async (request, reply) => {
    const user = await syncUser(request.user!.clerkId);
    const { pageId } = request.params as { pageId: string };

    const page = await prisma.page.findFirst({
      where: { id: pageId, userId: user.id },
    });

    if (!page) {
      return reply.status(404).send({ error: "Page not found" });
    }

    const row = await prisma.row.create({
      data: { pageId },
    });

    // Return the new row in the same transformed shape as the GET
    return reply.status(201).send({
      id: row.id,
      pageId: row.pageId,
      createdAt: row.createdAt,
      cells: {},
    });
  });

  // ─── DELETE /rows/:id ──────────────────────────────────────────────────────
  // Deletes a row — cells are deleted automatically via cascade
  app.delete("/rows/:id", async (request, reply) => {
    const user = await syncUser(request.user!.clerkId);
    const { id } = request.params as { id: string };

    // Find row and verify ownership via the page
    const row = await prisma.row.findFirst({
      where: { id },
      include: { page: true },
    });

    if (!row || row.page.userId !== user.id) {
      return reply.status(404).send({ error: "Row not found" });
    }

    await prisma.row.delete({ where: { id } });

    return reply.status(204).send();
  });

  // ─── PATCH /cells ──────────────────────────────────────────────────────────
  // Updates or creates a cell value (upsert)
  // We use upsert because a cell might not exist yet if the user never typed in it
  app.patch("/cells", async (request, reply) => {
    const user = await syncUser(request.user!.clerkId);
    const { rowId, columnId, value } = request.body as {
      rowId: string;
      columnId: string;
      value: string | null;
    };

    if (!rowId || !columnId) {
      return reply
        .status(400)
        .send({ error: "rowId and columnId are required" });
    }

    // Verify the row belongs to the user
    const row = await prisma.row.findFirst({
      where: { id: rowId },
      include: { page: true },
    });

    if (!row || row.page.userId !== user.id) {
      return reply.status(404).send({ error: "Row not found" });
    }

    // Verify the column belongs to the same page
    const column = await prisma.column.findFirst({
      where: { id: columnId, pageId: row.pageId },
    });

    if (!column) {
      return reply.status(404).send({ error: "Column not found" });
    }

    // Upsert — create if doesn't exist, update if it does
    // This is why we have @@unique([rowId, columnId]) in the schema
    const cell = await prisma.cell.upsert({
      where: {
        rowId_columnId: { rowId, columnId },
      },
      update: { value: value ?? null },
      create: { rowId, columnId, value: value ?? null },
    });

    return reply.send(cell);
  });
}
