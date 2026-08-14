const asyncHandler = require("express-async-handler");
const Project = require("../models/Project");
const User = require("../models/User");
const { createAndSendNotification } = require("../utils/notificationHelper");

// @desc    Get all projects for the logged-in user
// @route   GET /api/projects
// @access  Private
const getProjects = asyncHandler(async (req, res) => {
  const projects = await Project.find({ members: req.user._id }).sort({
    createdAt: -1,
  });
  res.json(projects);
});

// @desc    Get a single project by ID
// @route   GET /api/projects/:id
// @access  Private
const getProjectById = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id)
    .populate("members", "name email role whatsApp", "name email role whatsApp")
    .populate("createdBy", "_id name");

  if (!project) {
    res.status(404);
    throw new Error("Project not found");
  }

  // Check if user is a member
  const isMember = project.members.some(
    (m) => m._id.toString() === req.user._id.toString(),
  );
  if (!isMember && req.user.role !== "admin") {
    res.status(403);
    throw new Error("User not authorized for this project");
  }

  res.json(project);
});

// @desc    Create a new project
// @route   POST /api/projects
// @access  Private (Admin/Project Manager)
const createProject = asyncHandler(async (req, res) => {
  const { title, description, members } = req.body;

  if (!title) {
    res.status(400);
    throw new Error("Project title is required");
  }

  const project = await Project.create({
    title,
    description: description || "",
    createdBy: req.user._id,
    members: members && members.length > 0 ? members : [req.user._id],
  });

  const populatedProject = await Project.findById(project._id).populate(
    "createdBy",
    "name",
  );

  // --- NOTIFICATION LOGIC ---
  // Notify all members who were added to the project, except the creator.
  if (populatedProject && members && members.length > 0) {
    for (const memberId of members) {
      if (memberId.toString() !== req.user._id.toString()) {
        await createAndSendNotification(req, {
          recipient: memberId,
          type: "PROJECT_INVITE",
          project: populatedProject._id,
          message: `You have been added to the project "${populatedProject.title}" by ${populatedProject.createdBy.name}.`,
        });
      }
    }
  }

  res.status(201).json(populatedProject);
});

// @desc    Delete a project
// @route   DELETE /api/projects/:id
// @access  Private (Admin/Project Manager & Creator only)
const deleteProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);

  if (!project) {
    res.status(404);
    throw new Error("Project not found");
  }

  const isCreator = project.createdBy.toString() === req.user._id.toString();
  const isAdminOrManager =
    req.user.role === "admin" || req.user.role === "project_manager";

  if (!isCreator || !isAdminOrManager) {
    res.status(403);
    throw new Error("User not authorized to delete this project");
  }

  // In a real-world scenario, you might also want to delete associated tasks,
  // but for now, we will just remove the project.
  await project.deleteOne(); // Mongoose v6+ uses deleteOne()

  res.json({ message: "Project removed successfully" });
});

// Placeholder for updateProject
const updateProject = asyncHandler(async (req, res) => {
  res.status(501).json({ message: "Not Implemented" });
});

module.exports = {
  getProjects,
  getProjectById,
  createProject,
  deleteProject,
  updateProject,
};
