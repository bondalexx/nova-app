import "dotenv/config";
import http from "http";
import app from "./app";
import jwt from "jsonwebtoken";
import { prisma } from "./lib/prisma";

const PORT = Number(process.env.PORT ?? 4000);
const CORS_ORIGIN = process.env.CORS_ORIGIN ?? "http://localhost:3000";
const server = http.createServer(app);

const { Server } = require("socket.io");

const io = new Server(server, {
  cors: {
    origin: CORS_ORIGIN,
    credentials: true,
  },
});

io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token as string | undefined;
    if (!token) return next(new Error("No token"));

    const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET! ) as { sub: string; email?: string };

    // Load minimal profile from DB (recommended so you get displayName, etc.)
    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user) return next(new Error("User not found"));

    socket.data.user = {
      id: user.id,
      displayName: user.displayName,
      email: user.email,
    };

    next();
  } catch (e) {
    next(new Error("Auth failed"));
  }
});

io.on("connection", (socket) => {
  console.log(`User Connected: ${socket.id}`, socket.data.user);

  // one-time: tell the client “who am I”
  socket.emit("session", socket.data.user);

  socket.on("join_room", (roomId: string) => {
    console.log(roomId)
    // (optional) check membership in DB before joining
    socket.join(roomId);
  });

  socket.on("send_message", (data: { room: string; message: string }) => {
    const sender = socket.data.user;     // trusted
    if (!sender?.id) return;

    // (optional) persist to DB here with sender.id & data.room

    io.to(data.room).emit("receive_message", {
      room: data.room,
      message: data.message,
      user: sender,                      // <- attach trusted user
      from: socket.id,
      createdAt: new Date().toISOString()
    });
  });
});

server.listen(PORT, () => {
  console.log(`listening on *:${PORT}`);
});





























// // middlewares
// app.use(cors({ origin: CORS_ORIGIN, credentials: true }));
// app.use(express.json());

// // health: checks server + DB
// app.get("/health", async (_req, res) => {
//   try {
//     await prisma.$queryRaw`SELECT 1`;
//     res.json({ ok: true, db: "ok" });
//   } catch (e) {
//     res.status(500).json({ ok: false, db: "fail" });
//   }
// });

// // quick DB routes
// app.get("/users/count", async (_req, res, next) => {
//   try {
//     const count = await prisma.user.count();
//     res.json({ count });
//   } catch (e) {
//     next(e);
//   }
// });

// app.get("/users", async (_req, res, next) => {
//   try {
//     const users = await prisma.user.findMany({
//       select: { id: true, email: true, displayName: true, createdAt: true },
//       orderBy: { createdAt: "desc" },
//     });
//     res.json(users);
//   } catch (e) {
//     next(e);
//   }
// });

// // simple error handler
// app.use((err: any, _req: any, res: any, _next: any) => {
//   console.error(err);
//   res.status(500).json({ error: "Internal Server Error" });
// });

// const io = new Server(app, { cors: { origin: CORS_ORIGIN } });
// io.on("connection", (socket) => {
//   console.log(`User Connected: ${socket.id}`);
// });


// const server = app.listen(PORT, async () => {
//   // optional: small startup check
//   try {
//     const users = await prisma.user.findMany({ take: 1 });
//     console.log(`[server] up on http://localhost:${PORT} — prisma OK, users sample:`, users.length);
//   } catch (e) {
//     console.error("[server] started but prisma check failed:", e);
//   }
// });



// // graceful shutdown
// process.on("SIGINT", async () => {
//   console.log("\n[server] shutting down…");
//   server.close();
//   await prisma.$disconnect();
//   process.exit(0);
// });
// process.on("SIGTERM", async () => {
//   server.close();
//   await prisma.$disconnect();
//   process.exit(0);
// });