import express from "express";
import {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  updateTaskStatus,
  getTaskStats,
} from "../controller/taskController.js";
import { authenticate } from "../utils/jwtUtills.js";

const router = express.Router();

// All routes require authentication
router.use(authenticate);
// Base route: /api/tasks

router.get("/", getTasks);
router.get("/stats", getTaskStats);
router.get("/:id", getTask);
router.post("/", createTask);
router.put("/:id", updateTask);
router.patch("/:id/status", updateTaskStatus);
router.delete("/:id", deleteTask);

export default router;
