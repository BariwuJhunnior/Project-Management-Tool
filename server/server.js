const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const connectDB = require("./config/db"); // Assuming you have a DB connection setup
const { protect } = require("./middleware/auth");
const jwt = require("jsonwebtoken"); // Assuming this was added for Socket.IO auth

// --- Load Environment Variables ---
// This will load the .env file from the root of the 'server' directory
dotenv.config();

// --- Database Connection ---
connectDB();

// --- Express App and HTTP Server Initialization ---
const app = express();
const server = http.createServer(app);

// --- CORS Configuration ---
// This should come before your routes
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173", // Allow your client origin
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// --- Middlewares ---
app.use(express.json()); // To parse JSON bodies

// --- Socket.IO Initialization ---
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

// Attach io instance to app to be accessible from controllers
app.set("io", io);

// Socket.IO middleware for JWT Authentication
io.use(async (socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) {
    return next(new Error("Authentication failed: No token provided"));
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Attach user ID to socket for later use
    socket.userId = decoded.id || decoded._id;
    next();
  } catch (err) {
    next(new Error("Authentication failed: Invalid token"));
  }
});

// Join individual user room on connection
io.on("connection", (socket) => {
  const userRoom = `user:${socket.userId}`;
  socket.join(userRoom);

  socket.on("disconnect", () => {
    socket.leave(userRoom);
  });
});

// --- API Routes ---
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/projects", require("./routes/projectRoutes"));
app.use("/api/tasks", require("./routes/taskRoutes"));
app.use("/api/notifications", require("./controllers/notificationRoutes"));

// --- Server Listening ---
const PORT = process.env.PORT || 5000;
server.listen(PORT, () =>
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`),
);
