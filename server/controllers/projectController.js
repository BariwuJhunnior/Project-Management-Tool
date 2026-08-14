const Project = require("../models/Project");
const Task = require("../models/Task");
const { createAndSendNotification } = require("../utils/notificationHelper");

// @desc     Create a new project
// @route    POST /api/projects
// @access   Private (Admin / Project Manager)
const createProject = async (req, res) => {
  try {
    const { title, description, members } = req.body;

    //Ensure the creator is automatically included in members
    const uniqueMembers = Array.from(
      new Set([...(members || []), req.user._id.toString()]),
    );

    const project = await Project.create({
      title,
      description,
      members: uniqueMembers,
      createdBy: req.user._id,
    });

    const populatedProject = await project.populate(
      "members",
      "name email role whatsApp",
    );

    // --- NOTIFICATION LOGIC ---
    // Notify all members who were added to the project, except the creator.
    if (populatedProject && uniqueMembers && uniqueMembers.length > 0) {
      for (const memberId of uniqueMembers) {
        if (memberId.toString() !== req.user._id.toString()) {
          await createAndSendNotification(req, {
            recipient: memberId,
            type: "PROJECT_INVITE",
            project: populatedProject._id,
            message: `You have been added to the project "${populatedProject.title}" by ${req.user.name}.`,
          });
        }
      }
    }

    res.status(201).json(populatedProject);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get all projects assigned to logged-in user
// @route   GET /api/projects
// @access  Private
const getProjects = async (req, res) => {
  try {
    let query = {};

    //Filter by membership unless the user is an admin
    if (req.user.role !== "admin") {
      query = { members: req.user._id };
    }

    const projects = await Project.find(query)
      .populate("members", "name email role whatsApp")
      .populate("createdBy", "name email role whatsApp")
      .sort({ createdAt: -1 });

    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc     Update project by id
// @route    PUT /api/projects/:id
// @access   Private (Admin / Project Manager)
const updateProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    } // Check if the user is authorized to update this project
    if (req.user.role !== "admin" && !project.members.includes(req.user._id)) {
      return res.status(403).json({ message: "Access denied to this project" });
    }

    const updatedProject = await Project.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true },
    );
    res.json(updatedProject);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get single project details with access verification
// @route   GET /api/projects/:id
// @access  Private
const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate("members", "name email role whatsApp")
      .populate("createdBy", "name email whatsApp");

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Access check: User must be an admin or a member of the project
    const isMember = project.members.some(
      (m) => m._id.toString() === req.user._id.toString(),
    );

    if (req.user.role !== "admin" && !isMember) {
      return res.status(403).json({ message: "Access denied to this project" });
    }

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Delete a project
// @route   DELETE /api/projects/:id
// @access  Private (Admin/Project Manager & Creator only)
const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const isCreator = project.createdBy.toString() === req.user._id.toString();
    const isAdminOrManager =
      req.user.role === "admin" || req.user.role === "project_manager";

    if (!isCreator || !isAdminOrManager) {
      return res
        .status(403)
        .json({ message: "User not authorized to delete this project" });
    }

    await Task.deleteMany({ project: req.params.id });
    await project.deleteOne();

    res.json({ message: "Project and associated tasks removed successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
};
