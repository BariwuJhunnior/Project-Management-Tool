const express = require("express");
const router = express.Router();
const {
  createTask,
  getTasksByProject,
  updateTaskStatus,
  updateTask,
  deleteTask,
} = require("../controllers/taskController");
const { protect } = require("../middleware/auth");

router.use(protect); // All task routes require authentication

router.post("/", createTask);
router.get("/project/:projectId", getTasksByProject);
router.patch("/:id/status", updateTaskStatus);
router.put("/:id", updateTask);
router.delete("/:id", deleteTask);

module.exports = router;
