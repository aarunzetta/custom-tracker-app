import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const pages = await prisma.page.findMany({
  include: {
    columns: true,
    rows: {
      include: { cells: true },
    },
  },
});

console.log(JSON.stringify(pages, null, 2));

await prisma.$disconnect();
