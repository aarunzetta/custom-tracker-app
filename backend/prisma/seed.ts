import { PrismaClient, ColumnType } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Clean existing data first
  await prisma.cell.deleteMany();
  await prisma.row.deleteMany();
  await prisma.column.deleteMany();
  await prisma.chartWidget.deleteMany();
  await prisma.page.deleteMany();
  await prisma.user.deleteMany();

  // Create a test user
  const user = await prisma.user.create({
    data: {
      clerkId: "seed_user_placeholder",
      email: "test@example.com",
      name: "Test User",
    },
  });

  // Create a sample page
  const page = await prisma.page.create({
    data: {
      name: "Book Tracker",
      icon: "📚",
      userId: user.id,
    },
  });

  // Create columns
  const titleCol = await prisma.column.create({
    data: { name: "Title", type: ColumnType.TEXT, order: 0, pageId: page.id },
  });

  const statusCol = await prisma.column.create({
    data: {
      name: "Status",
      type: ColumnType.SELECT,
      order: 1,
      pageId: page.id,
      options: { choices: ["To Read", "Reading", "Done"] },
    },
  });

  const pagesCol = await prisma.column.create({
    data: { name: "Pages", type: ColumnType.NUMBER, order: 2, pageId: page.id },
  });

  const finishedCol = await prisma.column.create({
    data: {
      name: "Finished",
      type: ColumnType.CHECKBOX,
      order: 3,
      pageId: page.id,
    },
  });

  // Create rows with cells
  const books = [
    { title: "Atomic Habits", status: "Done", pages: "320", finished: "true" },
    { title: "Deep Work", status: "Reading", pages: "296", finished: "false" },
    {
      title: "The Pragmatic Programmer",
      status: "To Read",
      pages: "352",
      finished: "false",
    },
  ];

  for (const book of books) {
    const row = await prisma.row.create({ data: { pageId: page.id } });

    await prisma.cell.createMany({
      data: [
        { rowId: row.id, columnId: titleCol.id, value: book.title },
        { rowId: row.id, columnId: statusCol.id, value: book.status },
        { rowId: row.id, columnId: pagesCol.id, value: book.pages },
        { rowId: row.id, columnId: finishedCol.id, value: book.finished },
      ],
    });
  }

  // Create a sample chart widget
  await prisma.chartWidget.create({
    data: {
      title: "Books by Status",
      type: "bar",
      config: { xColumn: statusCol.id, yColumn: "count", aggregation: "count" },
      position: 0,
      pageId: page.id,
    },
  });

  console.log("Seeding complete!");
  console.log(`Created user: ${user.email}`);
  console.log(`Created page: ${page.name} with ${books.length} rows`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
