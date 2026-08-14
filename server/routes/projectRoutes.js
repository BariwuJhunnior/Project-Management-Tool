const express = require("express");
const router = express.Router();
const {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
} = require("../controllers/projectController");
const { protect, authorize } = require("../middleware/auth");

router.use(protect); // All project routes require authentication

router
  .route("/")
  .get(getProjects)
  .post(authorize("admin", "project_manager"), createProject);

router
  .route("/:id")
  .get(getProjectById)
  .put(authorize("admin", "project_manager"), updateProject)
  .delete(authorize("admin", "project_manager"), deleteProject);

module.exports = router;
