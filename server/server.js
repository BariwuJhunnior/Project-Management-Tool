const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const http = require("http");
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const connectDB = require("./config/db");

dotenv.config();

// Connect to Database
connectDB();

const app = express();
const server = http.createServer(app);

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: "*", // Adjust for production origin
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
  },
});

// Middleware for Socket.io JWT Authentication
io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token)
    return next(new Error("Authentication failed: No token provided"));

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
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

// Make io accessible across req.app
app.set("socketio", io);

// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/projects", require("./routes/projectRoutes"));
app.use("/api/tasks", require("./routes/taskRoutes"));
app.use("/api/notifications", require("./routes/notificationRoutes"));

app.get("/", (req, res) => {
  res.send("API is running...");
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port: ${PORT}`);
});
