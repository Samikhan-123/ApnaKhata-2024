import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Modal,
  Form,
  Badge,
  Dropdown,
  Spinner,
  Alert,
  ProgressBar,
} from "react-bootstrap";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaCheck,
  FaClock,
  FaFilter,
  FaSort,
  FaChartBar,
  FaExclamationTriangle,
  FaArrowRight,
  FaTimesCircle,
  FaPlayCircle,
  FaTag,
  FaCalendar,
  FaEllipsisV,
  FaCheckCircle,
} from "react-icons/fa";
import { Formik, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import axios from "axios";
import "../pages/styles/TaskManager.css";
import { useAuth } from "../auth/AuthContext";
import toast from "react-hot-toast";

// Validation Schema
const taskValidationSchema = Yup.object().shape({
  title: Yup.string()
    .required("Title is required")
    .min(3, "Title must be at least 3 characters")
    .max(40, "Title cannot exceed 40 characters"),
  description: Yup.string().max(
    200,
    "Description cannot exceed 200 characters"
  ),
  priority: Yup.string()
    .oneOf(["low", "medium", "high"], "Invalid priority level")
    .required("Priority is required"),
  dueDate: Yup.date()
    .min(new Date(), "Due date must be in the future")
    .nullable(),
  tags: Yup.array().of(Yup.string().max(20, "Tag cannot exceed 20 characters")),
});

const TaskManager = () => {
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [filter, setFilter] = useState("all");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");

  const { token } = useAuth();

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "medium",
    dueDate: "",
    tags: [],
  });

  const [tagInput, setTagInput] = useState("");

  useEffect(() => {
    fetchTasks();
    fetchStats();
  }, [filter, sortBy, sortOrder]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `/api/tasks?status=${filter}&sortBy=${sortBy}&sortOrder=${sortOrder}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        setTasks(response.data.data.tasks);
        setStats(response.data.data.stats);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Error fetching tasks");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get("/api/tasks/stats", {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("stats", response.data.data);
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (err) {
      console.error("Error fetching stats:", err);
    }
  };

  const handleFormSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      const url = editingTask ? `/api/tasks/${editingTask._id}` : "/api/tasks";
      const method = editingTask ? "put" : "post";

      const response = await axios[method](url, values, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        toast.success(
          `Task ${editingTask ? "updated" : "created"} successfully`
        );
        setShowModal(false);
        setEditingTask(null);
        resetForm();
        setTagInput("");
        fetchTasks();
        fetchStats();
      }
    } catch (err) {
      setError(err.response?.data?.message || "Error saving task");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (taskId) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;

    try {
      const response = await axios.delete(`/api/tasks/${taskId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) {
        toast.success("Task deleted successfully");
        fetchTasks();
        fetchStats();
      }
    } catch (err) {
      setError(err.response?.data?.message || "Error deleting task");
    }
  };

  const handleStatusUpdate = async (taskId, newStatus) => {
    try {
      const response = await axios.patch(
        `/api/tasks/${taskId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        toast.success("Task status updated successfully");
        fetchTasks();
        fetchStats();
      }
    } catch (err) {
      setError(err.response?.data?.message || "Error updating task status");
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      priority: "medium",
      dueDate: "",
      tags: [],
    });
    setTagInput("");
  };

  const openEditModal = (task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description || "",
      priority: task.priority,
      dueDate: task.dueDate
        ? new Date(task.dueDate).toISOString().split("T")[0]
        : "",
      tags: task.tags || [],
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingTask(null);
    resetForm();
  };

  const addTag = (setFieldValue, values) => {
    if (tagInput.trim() && !values.tags.includes(tagInput.trim())) {
      const newTags = [...values.tags, tagInput.trim()];
      setFieldValue("tags", newTags);
      setTagInput("");
    }
  };

  const removeTag = (setFieldValue, values, tagToRemove) => {
    const newTags = values.tags.filter((tag) => tag !== tagToRemove);
    setFieldValue("tags", newTags);
  };

  const getPriorityVariant = (priority) =>
    priority === "high"
      ? "danger"
      : priority === "medium"
        ? "warning"
        : "success";

  const getStatusVariant = (status) =>
    status === "completed"
      ? "success"
      : status === "in-progress"
        ? "primary"
        : "secondary";

  const isOverdue = (dueDate) => {
    return dueDate && new Date(dueDate) < new Date();
  };

  if (loading) {
    return (
      <Container className="task-manager-container">
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3">Loading tasks...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container fluid className="task-manager-container mt-5">
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center flex-wrap">
            <div>
              <h2>Task Manager</h2>
              <p className="text-muted">Manage your tasks efficiently</p>
            </div>
            <Button variant="primary" onClick={() => setShowModal(true)}>
              <FaPlus className="me-2" />
              Add Task
            </Button>
          </div>
        </Col>
      </Row>

      {/* Stats Cards */}
      <Row className="g-3 mb-4">
        <Col md={3} sm={6}>
          <Card className="stats-card total-tasks">
            <Card.Body>
              <div className="stats-icon">
                <FaChartBar />
              </div>
              <h3>{stats.total || 0}</h3>
              <p>Total Tasks</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} sm={6}>
          <Card className="stats-card completed-tasks">
            <Card.Body>
              <div className="stats-icon">
                <FaCheck />
              </div>
              <h3>{stats.completed || 0}</h3>
              <p>Completed</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} sm={6}>
          <Card className="stats-card pending-tasks">
            <Card.Body>
              <div className="stats-icon">
                <FaClock />
              </div>
              <h3>{stats.pending || 0}</h3>
              <p>Pending</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} sm={6}>
          <Card className="stats-card overdue-tasks">
            <Card.Body>
              <div className="stats-icon">
                <FaExclamationTriangle />
              </div>
              <h3>{stats.overdue || 0}</h3>
              <p>Overdue</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Progress Bar */}
      {stats.total > 0 && (
        <Row className="mb-4">
          <Col>
            <Card>
              <Card.Body>
                <div className="d-flex justify-content-between mb-2">
                  <span>Completion Progress</span>
                  <span>
                    {Math.round((stats.completed / stats.total) * 100)}%
                  </span>
                </div>
                <ProgressBar
                  now={(stats.completed / stats.total) * 100}
                  variant="success"
                  style={{ height: "10px" }}
                />
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Filters and Sorting */}
      <Row className="mb-3">
        <Col md={6}>
          <Dropdown className="d-inline me-2">
            <Dropdown.Toggle variant="outline-primary">
              <FaFilter className="me-2" />
              Filter: {filter === "all" ? "All" : filter}
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item onClick={() => setFilter("all")}>
                All Tasks
              </Dropdown.Item>
              <Dropdown.Item onClick={() => setFilter("todo")}>
                To Do
              </Dropdown.Item>
              <Dropdown.Item onClick={() => setFilter("in-progress")}>
                In Progress
              </Dropdown.Item>
              <Dropdown.Item onClick={() => setFilter("completed")}>
                Completed
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>

          <Dropdown className="d-inline">
            <Dropdown.Toggle variant="outline-secondary">
              <FaSort className="me-2" />
              Sort: {sortBy} ({sortOrder})
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item
                onClick={() => {
                  setSortBy("createdAt");
                  setSortOrder("desc");
                }}
              >
                Newest First
              </Dropdown.Item>
              <Dropdown.Item
                onClick={() => {
                  setSortBy("createdAt");
                  setSortOrder("asc");
                }}
              >
                Oldest First
              </Dropdown.Item>
              <Dropdown.Item
                onClick={() => {
                  setSortBy("dueDate");
                  setSortOrder("asc");
                }}
              >
                Due Date (Ascending)
              </Dropdown.Item>
              <Dropdown.Item
                onClick={() => {
                  setSortBy("dueDate");
                  setSortOrder("desc");
                }}
              >
                Due Date (Descending)
              </Dropdown.Item>
              <Dropdown.Item
                onClick={() => {
                  setSortBy("priority");
                  setSortOrder("desc");
                }}
              >
                Priority (High to Low)
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </Col>
      </Row>

      {/* Error Alert */}
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      {/* Tasks List */}
      <Row>
        <Col>
          {tasks.length === 0 ? (
            <Card className="no-tasks-card">
              <Card.Body className="text-center py-5">
                <div className="no-tasks-icon">
                  <FaClock size={48} />
                </div>
                <h4>No tasks found</h4>
                <p className="text-muted">
                  Get started by creating your first task!
                </p>
                <Button variant="primary" onClick={() => setShowModal(true)}>
                  Create Your First Task
                </Button>
              </Card.Body>
            </Card>
          ) : (
            <Row>
              {tasks.map((task) => (
                <Col key={task._id} xl={4} lg={6} md={6} className="mb-4">
                  <Card className="task-card premium-card h-100">
                    {/* Card Header with Priority Indicator */}
                    <div
                      className={`priority-indicator priority-${task.priority}`}
                    ></div>

                    <Card.Body className="p-4">
                      {/* Task Header */}
                      <div className="d-flex justify-content-between align-items-start mb-3">
                        <div className="flex-grow-1">
                          <Card.Title className="task-title mb-2">
                            {task.title}
                          </Card.Title>

                          {/* Status and Priority Badges */}
                          <div className="d-flex align-items-center mb-3">
                            <Badge
                              className="status-badge me-2"
                              bg={getStatusVariant(task.status)}
                            >
                              <span className="status-icon me-1">
                                {task.status === "completed" && (
                                  <FaCheckCircle />
                                )}
                                {task.status === "in-progress" && (
                                  <FaPlayCircle />
                                )}
                                {task.status === "todo" && <FaTimesCircle />}
                              </span>
                              {task.status.charAt(0).toUpperCase() +
                                task.status.slice(1)}
                            </Badge>

                            <Badge
                              className="priority-badge"
                              bg={getPriorityVariant(task.priority)}
                            >
                              {task.priority.charAt(0).toUpperCase() +
                                task.priority.slice(1)}
                            </Badge>
                          </div>
                        </div>

                        {/* Dropdown Menu */}
                        <Dropdown>
                          <Dropdown.Toggle
                            variant="light"
                            className="task-dropdown-btn"
                          >
                            <FaEllipsisV />
                          </Dropdown.Toggle>
                          <Dropdown.Menu align="end">
                            <Dropdown.Item onClick={() => openEditModal(task)}>
                              <FaEdit className="me-2" /> Edit Task
                            </Dropdown.Item>
                            <Dropdown.Item
                              onClick={() => handleDelete(task._id)}
                            >
                              <FaTrash className="me-2" /> Delete Task
                            </Dropdown.Item>
                          </Dropdown.Menu>
                        </Dropdown>
                      </div>

                      {/* Task Description */}
                      {task.description && (
                        <Card.Text className="task-description mb-3">
                          {task.description}
                        </Card.Text>
                      )}

                      {/* Due Date */}
                      {task.dueDate && (
                        <div className="due-date-section mb-3">
                          <div className="d-flex align-items-center">
                            <FaCalendar className="text-muted me-2" />
                            <span
                              className={`due-date-text ${isOverdue(task.dueDate) && task.status !== "completed" ? "text-danger" : "text-muted"}`}
                            >
                              Due:{" "}
                              {new Date(task.dueDate).toLocaleDateString(
                                "en-US",
                                {
                                  weekday: "short",
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                }
                              )}
                            </span>
                            {isOverdue(task.dueDate) &&
                              task.status !== "completed" && (
                                <Badge
                                  bg="danger"
                                  className="ms-2 overdue-badge"
                                >
                                  <FaExclamationTriangle className="me-1" />
                                  Overdue
                                </Badge>
                              )}
                          </div>
                        </div>
                      )}

                      {/* Tags */}
                      {task.tags && task.tags.length > 0 && (
                        <div className="tags-section mb-3">
                          <div className="d-flex align-items-center flex-wrap">
                            <FaTag className="text-muted me-2" />
                            {task.tags.map((tag, index) => (
                              <span
                                key={index}
                                className="custom-tag me-1 mb-1"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="task-actions mt-4 pt-3 border-top">
                        <div className="d-flex gap-2 flex-wrap">
                          {task.status !== "completed" && (
                            <Button
                              size="sm"
                              variant="success"
                              className="action-btn"
                              onClick={() =>
                                handleStatusUpdate(task._id, "completed")
                              }
                            >
                              <FaCheck className="me-1" /> Complete
                            </Button>
                          )}

                          {task.status === "todo" && (
                            <Button
                              size="sm"
                              variant="primary"
                              className="action-btn"
                              onClick={() =>
                                handleStatusUpdate(task._id, "in-progress")
                              }
                            >
                              <FaPlayCircle className="me-1" /> Start
                            </Button>
                          )}

                          {task.status === "in-progress" && (
                            <Button
                              size="sm"
                              variant="outline-secondary"
                              className="action-btn"
                              onClick={() =>
                                handleStatusUpdate(task._id, "todo")
                              }
                            >
                              <FaTimesCircle className="me-1" /> Pause
                            </Button>
                          )}

                          {task.status === "completed" && (
                            <Button
                              size="sm"
                              variant="outline-secondary"
                              className="action-btn"
                              onClick={() =>
                                handleStatusUpdate(task._id, "todo")
                              }
                            >
                              <FaArrowRight className="me-1" /> Reopen
                            </Button>
                          )}
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </Col>
      </Row>

      {/* Add/Edit Task Modal with Formik */}
      <Modal show={showModal} onHide={closeModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {editingTask ? "Edit Task" : "Create New Task"}
          </Modal.Title>
        </Modal.Header>

        <Formik
          initialValues={formData}
          validationSchema={taskValidationSchema}
          onSubmit={handleFormSubmit}
          enableReinitialize
        >
          {({
            values,
            errors,
            touched,
            handleSubmit,
            setFieldValue,
            isSubmitting,
          }) => (
            <Form onSubmit={handleSubmit}>
              <Modal.Body>
                {/* Title Field */}
                <Form.Group className="mb-3">
                  <Form.Label>Title *</Form.Label>
                  <Field
                    as={Form.Control}
                    type="text"
                    name="title"
                    placeholder="Enter task title"
                    isInvalid={touched.title && errors.title}
                  />
                  <ErrorMessage
                    name="title"
                    component="div"
                    className="text-danger small mt-1"
                  />
                </Form.Group>

                {/* Description Field */}
                <Form.Group as={Col} md={6} className="mb-3 ">
                  <Form.Label>Description</Form.Label>
                  <Field
                    as={Form.Control}
                    as="textarea"
                    rows={3}
                    name="description"
                    placeholder="Enter task description"
                    isInvalid={touched.description && errors.description}
                  />
                  <ErrorMessage
                    name="description"
                    component="div"
                    className="text-danger small mt-1"
                  />
                </Form.Group>

                <Row>
                  {/* Priority Field */}
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Priority</Form.Label>
                      <Field
                        as={Form.Select}
                        name="priority"
                        isInvalid={touched.priority && errors.priority}
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </Field>
                      <ErrorMessage
                        name="priority"
                        component="div"
                        className="text-danger small mt-1"
                      />
                    </Form.Group>
                  </Col>

                  {/* Due Date Field */}
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Due Date</Form.Label>
                      <Field
                        as={Form.Control}
                        type="date"
                        name="dueDate"
                        min={new Date().toISOString().split("T")[0]}
                        isInvalid={touched.dueDate && errors.dueDate}
                      />
                      <ErrorMessage
                        name="dueDate"
                        component="div"
                        className="text-danger small mt-1"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                {/* Tags Field */}
                <Form.Group className="mb-3">
                  <Form.Label>Tags (optional)</Form.Label>
                  <div className="d-flex mb-2">
                    <Form.Control
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      placeholder="Enter tag and press Add"
                      onKeyPress={(e) =>
                        e.key === "Enter" &&
                        (e.preventDefault(), addTag(setFieldValue, values))
                      }
                    />
                    <Button
                      variant="outline-secondary"
                      onClick={() => addTag(setFieldValue, values)}
                      className="ms-2"
                    >
                      Add
                    </Button>
                  </div>
                  <div>
                    {values.tags.map((tag, index) => (
                      <Badge key={index} bg="primary" className="me-1 mb-1">
                        #{tag}
                        <button
                          type="button"
                          className="btn-close btn-close-white ms-1"
                          style={{ fontSize: "0.6rem" }}
                          onClick={() => removeTag(setFieldValue, values, tag)}
                        />
                      </Badge>
                    ))}
                  </div>
                </Form.Group>
              </Modal.Body>
              <Modal.Footer>
                <Button variant="secondary" onClick={closeModal}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-2" />
                      {editingTask ? "Updating..." : "Creating..."}
                    </>
                  ) : editingTask ? (
                    "Update Task"
                  ) : (
                    "Create Task"
                  )}
                </Button>
              </Modal.Footer>
            </Form>
          )}
        </Formik>
      </Modal>
    </Container>
  );
};

export default TaskManager;
