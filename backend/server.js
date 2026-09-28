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

const { corsOriginDelegate } = require("./config/cors");

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
    origin: corsOriginDelegate,
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

const { setNotificationIO } = require("./services/notification.service");
setNotificationIO(io);

// Socket.IO connection
io.on("connection", (socket) => {
  console.log("🔌 Socket connected:", socket.id);

  if (socket.userId) {
    const userRoom = `user:${socket.userId.toString()}`;
    socket.join(userRoom);
    console.log(`🔐 Socket ${socket.id} joined private notification room: ${userRoom}`);
  }

  registerPeerInterviewSocket(io, socket);
  registerAIInterviewSocket(io, socket);

  socket.on("disconnect", () => {
    console.log("🔌 Socket disconnected:", socket.id);
  });
});

const { logSmtpDiagnostics } = require("./services/email.service");

// Start server
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  logSmtpDiagnostics();
});
