require("dotenv").config();

const http = require("http");
const { Server } = require("socket.io");

const app = require("./app");
const connectDB = require("./config/db");
const registerPeerInterviewSocket = require("./sockets/peerInterview.socket");

const PORT = process.env.PORT || 5000;

// ------------------------------------
// Connect Database
// ------------------------------------
connectDB();

// ------------------------------------
// Create HTTP server
// ------------------------------------
const server = http.createServer(app);

// ------------------------------------
// Initialize Socket.IO
// ------------------------------------
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// ------------------------------------
// Socket.IO connection
// ------------------------------------
io.on("connection", (socket) => {
  console.log("🔌 Socket connected:", socket.id);

  registerPeerInterviewSocket(io, socket);
});

// ------------------------------------
// Start server
// ------------------------------------
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
