require("dotenv").config();

const jwt = require("jsonwebtoken");
const http = require("http");
const { Server } = require("socket.io");

const app = require("./app");
const connectDB = require("./config/db");
const registerPeerInterviewSocket = require("./sockets/peerInterview.socket");
const registerAIInterviewSocket = require("./sockets/aiInterview.socket");
// Reset rate limiter for test suite
const { connectRedis } = require("./config/redis");

const PORT = process.env.PORT || 5000;

// Connect Database
connectDB();

// Connect Redis
connectRedis();

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Socket Authentication
io.use((socket, next) => {
  try {
    const token = socket.handshake.auth?.token;

    if (!token) {
      return next(new Error("Authentication token required"));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    socket.userId = decoded.id;

    console.log("🔐 Socket authenticated:", socket.userId);

    next();
  } catch (error) {
    console.error("❌ Socket authentication failed:", error.message);

    next(new Error("Invalid socket authentication"));
  }
});

// Socket.IO connection
io.on("connection", (socket) => {
  console.log("🔌 Socket connected:", socket.id);

  registerPeerInterviewSocket(io, socket);
  registerAIInterviewSocket(io, socket);

  socket.on("disconnect", () => {
    console.log("🔌 Socket disconnected:", socket.id);
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
