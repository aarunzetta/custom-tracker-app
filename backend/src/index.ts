import Fastify from "fastify";
import cors from "@fastify/cors";
import dotenv from "dotenv";
import { userRoutes } from "./routes/users.js";

dotenv.config();

const app = Fastify({ logger: true });

await app.register(cors, {
  origin: "http://localhost:5173",
});

// Routes
await app.register(userRoutes);

// Health check (no auth needed)
app.get("/health", async () => {
  return { status: "ok", message: "Server is running" };
});

const PORT = Number(process.env.PORT) || 3000;

try {
  await app.listen({ port: PORT });
  console.log(`Server running on http://localhost:${PORT}`);
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
