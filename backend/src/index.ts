import Fastify from "fastify";
import cors from "@fastify/cors";
import dotenv from "dotenv";

dotenv.config();

const app = Fastify({ logger: true });

await app.register(cors, {
  origin: "http://localhost:5173", // Vite's default port
});

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
