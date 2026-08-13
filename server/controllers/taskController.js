const Task = require("../models/Task");
const Project = require("../models/Project");

// @desc    Create a new task within a project
// @route   POST /api/tasks
// @access  Private
const createTask = async (req, res) => {
  try {
    const {
      title,
      description,
      project: projectId,
      assignees,
      status,
      dueDate,
    } = req.body;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Ensure creator has access to the target project
    const isMember = project.members.some(
      (m) => m.toString() === req.user._id.toString(),
    );
    if (req.user.role !== "admin" && !isMember) {
      return res.status(403).json({ message: "Access denied to this project" });
    }

    const task = await Task.create({
      title,
      description,
      project: projectId,
      assignees: assignees || [],
      status: status || "todo",
      dueDate,
      createdBy: req.user._id,
    });

    const populatedTask = await task.populate(
      "assignees",
      "name email role whatsApp",
    );
    res.status(201).json(populatedTask);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get all tasks for a specific project
// @route   GET /api/tasks/project/:projectId
// @access  Private
const getTasksByProject = async (req, res) => {
  try {
    const { projectId } = req.params;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found." });
    }

    // Verify user membership in project
    const isMember = project.members.some(
      (m) => m.toString() === req.user._id.toString(),
    );
    if (req.user.role !== "admin" && !isMember) {
      return res
        .status(403)
        .json({ message: "Not authorized to view tasks for this project" });
    }

    const tasks = await Task.find({ project: projectId, isDeleted: false })
      .populate("assignees", "name email role whatsApp")
      .populate("createdBy", "name email whatsApp")
      .sort({ createdAt: -1 });

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Update task status (e.g., when dragging between Kanban columns)
// @route   PATCH /api/tasks/:id/status
// @access  Private
const updateTaskStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowedStatuses = ["todo", "team", "in_progress", "review", "done"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const task = await Task.findById(req.params.id).populate(
      "project",
      "members",
    );
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Authorization check: User must be a member of the project or admin
    const isMember = task.project.members.some(
      (m) => m.toString() === req.user._id.toString(),
    );
    if (req.user.role !== "admin" && !isMember) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this task" });
    }

    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true },
    ).populate("assignees", "name email role whatsApp");

    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Update task details (title, assignees, due dates)
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = async (req, res) => {
  try {
    const { title, description, assignees, status, dueDate } = req.body;

    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    if (title) task.title = title;
    if (description !== undefined) task.description = description;
    if (assignees) task.assignees = assignees;
    if (status) task.status = status;
    if (dueDate) task.dueDate = dueDate;

    const updatedTask = await task.save();
    const populated = await updatedTask.populate(
      "assignees",
      "name email role whatsApp",
    );

    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Delete a task (Soft delete)
// @route   DELETE /api/tasks/:id
// @access  Private (Admin & Project Manager only via middleware)
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    task.isDeleted = true;
    task.deletedAt = new Date();
    await task.save();

    res.json({ message: "Task deleted successfully", taskId: req.params.id });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  createTask,
  getTasksByProject,
  updateTaskStatus,
  updateTask,
  deleteTask,
};
