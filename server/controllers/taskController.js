const Task = require("../models/Task");
const Project = require("../models/Project");
const { createAndSendNotification } = require("../utils/notificationHelper");

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

    // Notify assigned members
    if (assignees && assignees.length > 0) {
      const recipients = assignees.filter(
        (id) => id.toString() !== req.user._id.toString(),
      );
      for (const recipientId of recipients) {
        await createAndSendNotification(req, {
          recipient: recipientId,
          type: "TASK_ASSIGNED",
          task: task._id,
          project: projectId,
          message: `You were assigned to task "${title}" by ${req.user.name} at: ${new Date().toLocaleTimeString()}.`,
        });
      }
    }

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

    const isMember = task.project.members.some(
      (m) => m.toString() === req.user._id.toString(),
    );
    if (req.user.role !== "admin" && !isMember) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this task" });
    }

    const previousStatus = task.status;

    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      { status },
      { returnDocument: "after", runValidators: true },
    )
      .populate("assignees", "name email role whatsApp")
      .populate("createdBy", "name email role whatsApp"); // Populate createdBy here

    // Helper to format status for messages
    const formatStatus = (s) =>
      s
        .replace(/_/g, " ")
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");

    // Trigger Notification if moved to 'done' (existing logic)
    if (previousStatus !== "done" && status === "done") {
      const recipients = Array.from(
        new Set([
          ...(updatedTask.assignees?.map((a) => a._id.toString()) || []),
          updatedTask.createdBy?._id?.toString(), // Use _id?.toString() for consistency
        ]),
      )
        .filter(Boolean)
        .filter((id) => id !== req.user._id.toString());

      for (const recipientId of recipients) {
        await createAndSendNotification(req, {
          recipient: recipientId,
          type: "TASK_MOVED_DONE",
          task: updatedTask._id,
          project: updatedTask.project,
          message: `Task "${updatedTask.title}" has been moved to Done by ${req.user.name} at: ${new Date().toLocaleTimeString()}.`,
        });
      }
    }

    // NEW: Trigger Notification for any status change
    if (previousStatus !== status) {
      const recipients = Array.from(
        new Set([
          ...(updatedTask.assignees?.map((a) => a._id.toString()) || []),
          updatedTask.createdBy?._id?.toString(),
        ]),
      )
        .filter(Boolean)
        .filter((id) => id !== req.user._id.toString());

      for (const recipientId of recipients) {
        await createAndSendNotification(req, {
          recipient: recipientId,
          type: "TASK_STATUS_UPDATED", // New notification type
          task: updatedTask._id,
          project: updatedTask.project,
          message: `Task "${updatedTask.title}" moved from ${formatStatus(previousStatus)} to ${formatStatus(status)} by ${req.user.name} at: ${new Date().toLocaleTimeString()}.`,
        });
      }
    }

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

    const previousAssignees = task.assignees.map((a) => a.toString());
    const previousStatus = task.status;

    if (title) task.title = title;
    if (description !== undefined) task.description = description;
    if (assignees) task.assignees = assignees;
    if (status) task.status = status;
    if (dueDate) task.dueDate = dueDate;

    const updatedTask = await task.save();
    const populated = await updatedTask
      .populate("assignees", "name email role whatsApp")
      .populate("createdBy", "name email role whatsApp"); // Populate createdBy for notifications

    // Notify newly assigned members
    if (assignees) {
      const newlyAssigned = assignees.filter(
        (id) =>
          !previousAssignees.includes(id.toString()) &&
          id.toString() !== req.user._id.toString(),
      );
      for (const recipientId of newlyAssigned) {
        await createAndSendNotification(req, {
          recipient: recipientId,
          type: "TASK_ASSIGNED",
          task: updatedTask._id,
          project: updatedTask.project,
          message: `You were assigned to task "${updatedTask.title}" by ${req.user.name} at: ${new Date().toLocaleTimeString()}.`,
        });
      }
    }

    // Notify when moved to done via full update form
    if (previousStatus !== "done" && status === "done") {
      const recipients = Array.from(
        new Set([
          ...(populated.assignees?.map((a) => a._id.toString()) || []),
          populated.createdBy?._id?.toString(), // Use _id?.toString() for consistency
        ]),
      )
        .filter(Boolean)
        .filter((id) => id !== req.user._id.toString());

      for (const recipientId of recipients) {
        await createAndSendNotification(req, {
          recipient: recipientId,
          type: "TASK_MOVED_DONE",
          task: populated._id,
          project: populated.project,
          message: `Task "${populated.title}" has been moved to Done by ${req.user.name} at: ${new Date().toLocaleTimeString()}.`,
        });
      }
    }

    // NEW: Trigger Notification for any status change via full update form
    if (previousStatus !== status) {
      const recipients = Array.from(
        new Set([
          ...(populated.assignees?.map((a) => a._id.toString()) || []),
          populated.createdBy?._id?.toString(),
        ]),
      )
        .filter(Boolean)
        .filter((id) => id !== req.user._id.toString());

      const formatStatus = (s) =>
        s
          .replace(/_/g, " ")
          .split(" ")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ");

      for (const recipientId of recipients) {
        await createAndSendNotification(req, {
          recipient: recipientId,
          type: "TASK_STATUS_UPDATED", // New notification type
          task: populated._id,
          project: populated.project,
          message: `Task "${populated.title}" moved from ${formatStatus(previousStatus)} to ${formatStatus(status)} by ${req.user.name} at: ${new Date().toLocaleTimeString()}.`,
        });
      }
    }

    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Delete a task (Soft delete)
// @route   DELETE /api/tasks/:id
// @access  Private (Admin & Project Manager only)
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
