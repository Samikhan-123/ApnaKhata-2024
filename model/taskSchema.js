import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Task title is required"],
      trim: true,
      maxlength: [100, "Title cannot be more than 100 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot be more than 500 characters"],
    },
    status: {
      type: String,
      enum: ["todo", "in-progress", "completed"],
      default: "todo",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    dueDate: {
      type: Date,
      validate: {
        validator: function (date) {
          return date > new Date();
        },
        message: "Due date must be in the future",
      },
    },
    tags: [
      {
        type: String,
        trim: true,
        maxlength: [20, "Tag cannot be more than 20 characters"],
      },
    ],
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    completedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Index for better query performance
taskSchema.index({ user: 1, status: 1 });
taskSchema.index({ user: 1, dueDate: 1 });

// Virtual for overdue tasks
taskSchema.virtual("isOverdue").get(function () {
  if (this.dueDate && this.status !== "completed") {
    return this.dueDate < new Date();
  }
  return false;
});

// Method to mark task as complete
taskSchema.methods.markComplete = function () {
  this.status = "completed";
  this.completedAt = new Date();
  return this.save();
};

// Method to update task status
taskSchema.methods.updateStatus = function (newStatus) {
  this.status = newStatus;
  if (newStatus === "completed") {
    this.completedAt = new Date();
  } else {
    this.completedAt = undefined;
  }
  return this.save();
};

const Task = mongoose.model("Task", taskSchema);

export default Task;
