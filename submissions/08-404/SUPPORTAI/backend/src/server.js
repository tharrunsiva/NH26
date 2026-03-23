require("dotenv").config();

const http = require("http");
const { Server } = require("socket.io");
const app = require("./app");
const { connectDatabase } = require("./config/db");
const { setIo } = require("./services/socketService");

const PORT = process.env.PORT || 5000;

async function startServer() {
  await connectDatabase();

  const server = http.createServer(app);
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:3000",
      methods: ["GET", "POST", "PATCH"]
    }
  });

  io.on("connection", (socket) => {
    socket.emit("support:connected", { message: "Realtime support channel connected" });
  });

  setIo(io);

  server.listen(PORT, () => {
    console.log(`Backend listening on port ${PORT}`);
  });
}

startServer().catch((error) => {
  console.error("Server startup failed", error);
  process.exit(1);
});
