# Tracker App

A Notion-style tracker where every topic gets its own page, every page has a customizable data table, and the page itself is a live analytics dashboard built from that table.

Create a page for anything you want to track (books, expenses, habits, job applications), define your own columns, add your data, and turn it into charts. The table stays out of the way until you need it, so the dashboard is always the focus.

![Tracker App dashboard](./docs/screenshot.png)

## Features

**Pages**

- Create, rename (inline), delete, and re-icon pages
- Sidebar navigation with a collapsible icon-only mode
- Home screen with a time-aware greeting and recent pages

**Custom data table (hidden by default)**

- Slide-up data panel, opened only when you want to edit data
- Six column types: Text, Number, Date, Checkbox, Select, URL
- Type-aware inline cell editors with auto-save and per-cell save/error states
- Drag-and-drop column reordering
- Add and delete rows, with delete confirmation
- Virtualized rows, so large tables stay fast

**Dashboard and analytics**

- Four widget types: bar chart, line chart (time series), pie/donut chart, KPI card
- Aggregations: count, sum, average
- Widget configuration modal with a live preview
- Drag-and-drop widget reordering and small/large sizing
- Charts update instantly as table data changes

**Polish**

- Clerk authentication (email and Google)
- Optimistic updates with rollback on failure
- Toast notifications, error boundaries, and an offline indicator
- Page transitions, staggered widget entrance, and loading skeletons
- Accessibility: visible focus rings, skip link, focus-trapped modal, labelled icon buttons, reduced-motion support

## Tech stack

| Layer         | Technology                             |
| ------------- | -------------------------------------- |
| Frontend      | React, Vite, TypeScript                |
| Styling       | Tailwind CSS v4, CSS design tokens     |
| State         | Zustand                                |
| Tables        | TanStack Table v8, TanStack Virtual v3 |
| Charts        | Recharts                               |
| Drag and drop | dnd-kit                                |
| Animation     | Framer Motion                          |
| Icons         | Lucide                                 |
| Routing       | React Router                           |
| Backend       | Node.js, Fastify, TypeScript           |
| Database      | PostgreSQL 16                          |
| ORM           | Prisma 6                               |
| Auth          | Clerk                                  |
| Dev database  | Docker                                 |

## Project structure

```
tracker-app/
├── frontend/                 React + Vite app
│   └── src/
│       ├── components/
│       │   ├── column/       Add column popover, column list
│       │   ├── dashboard/    Dashboard, widget grid, cards, config modal, charts
│       │   ├── layout/       App shell, sidebar, page transition
│       │   ├── page/         Page header pieces, data panel, empty states
│       │   ├── table/        Data table, cell editors, sortable headers
│       │   └── ui/           Button, Input, Select, Modal, Tooltip, Skeleton
│       ├── config/           Column type metadata
│       ├── hooks/            usePage
│       ├── lib/              API client, chart data transforms, error helpers
│       ├── pages/            Route-level screens
│       └── stores/           Zustand stores (pages, columns, rows, widgets)
├── backend/                  Fastify API
│   ├── prisma/               Schema, migrations, seed script
│   └── src/
│       ├── lib/              Prisma client, Clerk client, user sync
│       ├── middleware/       Auth (Clerk token verification)
│       ├── routes/           users, pages, columns, rows, widgets
│       └── types/            Fastify type extensions
└── package.json              npm workspaces root
```

## Getting started

### Prerequisites

- Node.js (current LTS)
- npm
- Docker Desktop (for the local PostgreSQL database)
- A free [Clerk](https://clerk.com) account

### 1. Clone and install

```bash
git clone https://github.com/aarunzetta/custom-tracker-app.git
cd tracker-app
npm install
```

### 2. Start PostgreSQL

```bash
docker run --name tracker-db \
  -e POSTGRES_USER=tracker \
  -e POSTGRES_PASSWORD=tracker123 \
  -e POSTGRES_DB=trackerdb \
  -p 5432:5432 -d postgres:16
```

On later sessions, just run `docker start tracker-db`.

### 3. Set up Clerk

1. Create an application in the Clerk dashboard and enable Email and Google sign-in.
2. Copy the **Publishable key** and **Secret key** from the API Keys page.

### 4. Configure environment variables

Create `backend/.env`:

```env
DATABASE_URL="postgresql://tracker:tracker123@localhost:5432/trackerdb"
PORT=3000
CLERK_SECRET_KEY="sk_test_your_secret_key"
```

Create `frontend/.env`:

```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_publishable_key
VITE_API_URL=http://localhost:3000
```

Neither file is committed. Both are listed in `.gitignore`.

### 5. Run database migrations

```bash
cd backend
npx prisma migrate dev
```

Optionally load sample data (a "Book Tracker" page):

```bash
npm run seed
```

### 6. Start the app

Use two terminals.

```bash
# Terminal 1: API on http://localhost:3000
cd backend
npm run dev
```

```bash
# Terminal 2: web app on http://localhost:5173
cd frontend
npm run dev
```

Open `http://localhost:5173`, sign up, and create your first page.

## Scripts

**Backend** (`backend/`)

| Command             | Description                        |
| ------------------- | ---------------------------------- |
| `npm run dev`       | Start the API with auto-restart    |
| `npm run build`     | Compile TypeScript                 |
| `npm run start`     | Run the compiled build             |
| `npm run seed`      | Seed the database with sample data |
| `npx prisma studio` | Browse the database in the browser |

**Frontend** (`frontend/`)

| Command           | Description                                     |
| ----------------- | ----------------------------------------------- |
| `npm run dev`     | Start the Vite dev server                       |
| `npm run build`   | Type-check and create a production build        |
| `npm run preview` | Serve the production build locally on port 4173 |

## Data model

```
User ─┬─ Page ─┬─ Column ── Cell
      │        ├─ Row ───── Cell
      │        └─ ChartWidget
```

- A **Page** belongs to a user and owns its columns, rows, and widgets. Deleting a page cascades to everything under it.
- A **Column** defines a field: name, type, order, and options (the choices for Select columns).
- A **Row** is one record. A **Cell** holds the value for one row and one column. Cells are created on first edit, so empty rows cost nothing.
- A **ChartWidget** stores its type, title, position, and a JSON config (columns, aggregation, size).

## API overview

All routes require a Clerk session token sent as `Authorization: Bearer <token>`. Every query is scoped to the signed-in user.

| Method             | Route                    | Purpose                                            |
| ------------------ | ------------------------ | -------------------------------------------------- |
| GET                | `/me`                    | Current user (creates the DB record on first call) |
| GET, POST          | `/pages`                 | List and create pages                              |
| GET, PATCH, DELETE | `/pages/:id`             | Read, update, delete a page                        |
| GET, POST          | `/pages/:pageId/columns` | List and create columns                            |
| PATCH, DELETE      | `/columns/:id`           | Update (including reorder) and delete a column     |
| GET, POST          | `/pages/:pageId/rows`    | List rows with cells, create a row                 |
| DELETE             | `/rows/:id`              | Delete a row                                       |
| PATCH              | `/cells`                 | Create or update a cell value (upsert)             |
| GET, POST          | `/pages/:pageId/widgets` | List and create widgets                            |
| PATCH, DELETE      | `/widgets/:id`           | Update and delete a widget                         |
| GET                | `/health`                | Health check (no auth)                             |

## Design decisions

- **Table as a hidden database.** The dashboard is the default view. The table lives in a slide-up panel, so analytics stay front and center.
- **Cells stored as strings.** Every value is a string and is parsed per column type in the UI. This keeps the schema simple and flexible.
- **Sparse cells.** Cells are created on demand instead of pre-filling a grid.
- **Optimistic UI.** Stores update immediately and roll back if the request fails.
- **Shared stores drive charts.** The table and dashboard read from the same Zustand stores, so charts update without extra requests.

## Roadmap

- [x] Authentication, pages, columns, rows, cells
- [x] Dashboard with bar, line, pie, and KPI widgets
- [x] Animations, empty states, error handling, accessibility
- [ ] Automated tests (Vitest, React Testing Library, Playwright)
- [ ] Production deployment
- [ ] Dark mode toggle
- [ ] Widget filters
- [ ] Custom images, logos, and stickers (v2)

## Notes

- Prisma is pinned to v6 and TanStack Table to v8. Newer major versions changed their APIs significantly.
- CORS currently allows `localhost:5173` (dev) and `localhost:4173` (preview). Production origins will be moved to an environment variable at deploy time.

## License

MIT. Add a `LICENSE` file to the repository root to make this official.
