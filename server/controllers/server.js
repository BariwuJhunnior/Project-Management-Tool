const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const connectDB = require("./config/db"); // Assuming you have a DB connection setup
const { protect } = require("./middleware/authMiddleware"); // Assuming auth middleware

// --- Load Environment Variables ---
// Make sure you have a .env file in a 'config' folder
dotenv.config({ path: "./config/config.env" });

// --- Database Connection ---
connectDB();

// --- Express App Initialization ---
const app = express();

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

// --- API Routes ---
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/projects", require("./routes/projectRoutes"));
app.use("/api/tasks", require("./routes/taskRoutes"));
app.use("/api/notifications", require("./routes/notificationRoutes"));

// --- HTTP Server & Socket.IO Initialization ---
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

// Attach io instance to app to be accessible from controllers
app.set("io", io);

// --- Server Listening ---
const PORT = process.env.PORT || 5000;
server.listen(PORT, () =>
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`),
);

module.exports = { io };
