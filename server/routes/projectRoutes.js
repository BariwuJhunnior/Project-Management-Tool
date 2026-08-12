const express = require("express");
const router = express.Router();
const {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
} = require("../controllers/projectController");
const { protect, authorize } = require("../middleware/auth");

router.use(protect); // All project routes require authentication

router.route("/").get(getProjects).post(authorize("admin"), createProject);

router.route("/:id").get(getProjectById).put(authorize("admin"), updateProject);

module.exports = router;
