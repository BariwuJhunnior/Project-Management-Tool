const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

dotenv.config();

//Connect to Database
connectDB();

const app = express();

//Middleware
app.use(express.json());
app.use(cors());

//Routes
app.use("/api/auth", require("./routes/authRoutes"));

//Root Test Route
app.get("/", (req, res) => {
  res.send("Project Management API is running...");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port: ${PORT}`);
});
