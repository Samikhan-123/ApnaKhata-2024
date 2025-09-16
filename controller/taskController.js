import mongoose from "mongoose";
import Task from "../model/taskSchema.js";

// Get all tasks for user
export const getTasks = async (req, res) => {
  try {
    const {
      status,
      priority,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;
    const userId = req.user._id;

    // Build query
    let query = { user: userId };

    if (status && status !== "all") {
      query.status = status;
    }

    if (priority && priority !== "all") {
      query.priority = priority;
    }

    // Build sort options
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === "desc" ? -1 : 1;

    const tasks = await Task.find(query).sort(sortOptions).select("-__v");

    // Get stats for dashboard
    const totalTasks = await Task.countDocuments({ user: userId });
    const completedTasks = await Task.countDocuments({
      user: userId,
      status: "completed",
    });
    const overdueTasks = await Task.countDocuments({
      user: userId,
      dueDate: { $lt: new Date() },
      status: { $ne: "completed" },
    });

    res.status(200).json({
      success: true,
      data: {
        tasks,
        stats: {
          total: totalTasks,
          completed: completedTasks,
          overdue: overdueTasks,
          pending: totalTasks - completedTasks,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching tasks",
      error: error.message,
    });
  }
};

// Get single task
export const getTask = async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    res.status(200).json({
      success: true,
      data: task,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching task",
      error: error.message,
    });
  }
};

// Create new task
export const createTask = async (req, res) => {
  try {
    const { title, description, priority, dueDate, tags } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: "Title is required",
      });
    }

    if (!description) {
      return res.status(400).json({
        success: false,
        message: "Description is required",
      });
    }

    if (!priority) {
      return res.status(400).json({
        success: false,
        message: "Priority is required",
      });
    }
    const validPriorities = ["low", "medium", "high"];
    if (!validPriorities.includes(priority)) {
      return res.status(400).json({
        success: false,
        message: `Priority must be one of ${validPriorities.join(", ")}`,
      });
    }
    if (dueDate && isNaN(new Date(dueDate).getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid due date format",
      });
    }

  

    const task = new Task({
      title,
      description,
      priority,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      tags,
      user: req.user._id,
    });

    const savedTask = await task.save();
    await savedTask.populate("user", "name email");

    res.status(201).json({
      success: true,
      message: "Task created successfully",
      data: savedTask,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: error.message,
        errors,
      });
    }

    res.status(500).json({
      success: false,
      message: "Error creating task",
      error: error.message,
    });
  }
};

// Update task
export const updateTask = async (req, res) => {
  try {
    const { title, description, status, priority, dueDate, tags } = req.body;

    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      {
        title,
        description,
        status,
        priority,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        tags,
        ...(status === "completed" && { completedAt: new Date() }),
        ...(status !== "completed" && { completedAt: undefined }),
      },
      { new: true, runValidators: true }
    );

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Task updated successfully",
      data: task,
    });
  } catch (error) {
    console.log(error)
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors,
      });
    }

    res.status(500).json({
      success: false,
      message: "Error updating task",
      error: error.message,
    });
  }
};

// Delete task
export const deleteTask = async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Task deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting task",
      error: error.message,
    });
  }
};

// Update task status
export const updateTaskStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      {
        status,
        ...(status === "completed" && { completedAt: new Date() }),
        ...(status !== "completed" && { completedAt: undefined }),
      },
      { new: true, runValidators: true }
    );

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Task status updated successfully",
      data: task,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating task status",
      error: error.message,
    });
  }
};

// Get task statistics
export const getTaskStats = async (req, res) => {
  try {
    const userId = req.user._id;

    const stats = await Task.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const totalTasks = await Task.countDocuments({ user: new mongoose.Types.ObjectId(userId) });
    const overdueTasks = await Task.countDocuments({
      user: new mongoose.Types.ObjectId(userId),
      dueDate: { $lt: new Date() },
      status: { $ne: "completed" },
    });

    const formattedStats = {
      total: totalTasks,
      overdue: overdueTasks,
      todo: 0,
      "in-progress": 0,
      completed: 0,
    };

    stats.forEach((stat) => {
      formattedStats[stat._id] = stat.count;
    });

    res.status(200).json({
      success: true,
      data: formattedStats,
    });
  } catch (error) {
    console.log("statistics error", error);
    res.status(500).json({
      success: false,
      message: "Error fetching task statistics",
      error: error.message,
    });
  }
};
