const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    assignees: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], //Teammate Visibility
    status: {
      type: String,
      enum: ["todo", "team", "in_progress", "review", "done"],
      default: "todo",
    },
    dueDate: { type: Date },
  },
  { timestamps: true },
);

const Task = mongoose.model("Task", taskSchema);

model.exports = Task;
