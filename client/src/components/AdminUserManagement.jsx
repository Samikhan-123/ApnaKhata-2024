import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Modal,
  Alert,
  Pagination,
  InputGroup,
  Badge,
  Spinner,
  Navbar,
  Nav,
} from "react-bootstrap";
import {
  FaSearch,
  FaKey,
  FaEye,
  FaEyeSlash,
  FaUser,
  FaCalendar,
  FaGoogle,
  FaSignOutAlt,
  FaUsers,
  FaShieldAlt,
  FaCog,
} from "react-icons/fa";
import axios from "axios";
import { useAuth } from "../auth/AuthContext";

const AdminUserManagement = () => {
  const [email, setEmail] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
    const { token } = useAuth();
  
  const api = import.meta.env.VITE_API_BASE_URL;

  // Container styles
  const containerStyle = {
    minHeight: "100vh",
    padding: "0",
  };

  // Card styles
  const cardStyle = {
    border: "none",
    borderRadius: "15px",
    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.15)",
    background: "rgba(255, 255, 255, 0.95)",
    backdropFilter: "blur(10px)",
  };

  // Header styles
  const headerStyle = {
    background: "linear-gradient(135deg, #2c3e50 0%, #34495e 100%)",
    color: "white",
    padding: "1rem 0",
    marginBottom: "2rem",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
  };

  // User card styles
  const userCardStyle = {
    border: "none",
    borderRadius: "12px",
    boxShadow: "0 4px 15px rgba(0, 0, 0, 0.08)",
    transition: "all 0.3s ease",
    background: "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)",
    height: "100%",
  };

  const userCardHoverStyle = {
    transform: "translateY(-5px)",
    boxShadow: "0 8px 25px rgba(0, 0, 0, 0.12)",
  };

  // Button styles
  const primaryButtonStyle = {
    background: "var(--submit-btn-color)",
    border: "none",
    borderRadius: "8px",
    fontWeight: "600",
  };

  const outlineButtonStyle = {
    borderColor: "#667eea",
    color: "#667eea",
    borderRadius: "8px",
    fontWeight: "500",
  };

  // Verify admin access
  const verifyAdminAccess = async () => {
    if (email !== "samikhan7816@gmail.com") {
      setError("Admin email is required");
      return false;
    }

    setLoading(true);
    setError("");

    try {
      if (email === "samikhan7816@gmail.com") {
        setIsAuthenticated(true);
        fetchUsers();
        return true;
      } else {
        setError("Invalid admin email");
        return false;
      }
    } catch (err) {
      setError("Failed to verify admin access");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Fetch users with pagination and search
  const fetchUsers = async (page = 1, search = "") => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${api}/auth/admin/users?page=${page}&limit=12&search=${search}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        setUsers(response.data.users);
        setPagination(response.data.pagination);
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      if (err.response?.status === 403) {
        setError("Admin access required");
        setIsAuthenticated(false);
      } else {
        setError("Failed to fetch users");
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchUsers(1, searchTerm);
  };

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchUsers(page, searchTerm);
  };

  // Handle password update
  const handlePasswordUpdate = async () => {
    if (!newPassword || newPassword.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    setUpdateLoading(true);
    try {
      const response = await axios.patch(
        `${api}/auth/admin/users/${selectedUser._id}/password`,
        { newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setError("");
        setShowPasswordModal(false);
        setNewPassword("");
        setSelectedUser(null);
        alert("Password updated successfully!");
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      setError("Failed to update password");
    } finally {
      setUpdateLoading(false);
    }
  };

  // Render pagination items
  const renderPagination = () => {
    if (!pagination.totalPages || pagination.totalPages <= 1) return null;

    let items = [];
    for (let number = 1; number <= pagination.totalPages; number++) {
      items.push(
        <Pagination.Item
          key={number}
          active={number === currentPage}
          onClick={() => handlePageChange(number)}
          style={{
            margin: "0 4px",
            borderRadius: "8px",
            border: "none",
            fontWeight: number === currentPage ? "600" : "400",
          }}
        >
          {number}
        </Pagination.Item>
      );
    }

    return (
      <Pagination className="justify-content-center mt-4">
        <Pagination.Prev
          disabled={!pagination.hasPrev}
          onClick={() => handlePageChange(currentPage - 1)}
          style={{ borderRadius: "8px", margin: "0 4px" }}
        />
        {items}
        <Pagination.Next
          disabled={!pagination.hasNext}
          onClick={() => handlePageChange(currentPage + 1)}
          style={{ borderRadius: "8px", margin: "0 4px" }}
        />
      </Pagination>
    );
  };

  if (!isAuthenticated) {
    return (
      <Container fluid style={containerStyle}>
        <Row className="justify-content-center align-items-center min-vh-100">
          <Col md={6} lg={4}>
            <Card style={cardStyle}>
              <Card.Body className="text-center p-4">
                <div
                  style={{
                    fontSize: "3rem",
                    color: "var(--submit-btn-color)",
                    marginBottom: "1.5rem",
                  }}
                >
                  <FaShieldAlt />
                </div>
                <h4 className="mb-4" style={{ color: "#2c3e50" }}>
                  Admin Authentication
                </h4>

                {error && (
                  <Alert variant="danger" className="mb-3">
                    {error}
                  </Alert>
                )}

                <Form
                  onSubmit={(e) => {
                    e.preventDefault();
                    verifyAdminAccess();
                  }}
                >
                  <Form.Group className="mb-3">
                    <Form.Label style={{ fontWeight: "500" }}>
                      Admin Email
                    </Form.Label>
                    <Form.Control
                      type="email"
                      placeholder="Enter admin email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      style={{ borderRadius: "8px" }}
                    />
                  </Form.Group>

                  <Button
                    // variant="primary"
                    type="submit"
                    disabled={loading}
                    className="w-100"
                    style={primaryButtonStyle}
                  >
                    {loading ? (
                      <Spinner animation="border" size="sm" />
                    ) : (
                      "Verify Access"
                    )}
                  </Button>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f8f9fa" }}>
      {/* Navigation Header */}
      <div style={headerStyle}>
        <Container>
          <Row className="align-items-center">
            <Col>
              <h4 className="mb-0">
                <FaUsers className="me-2" />
                Admin Dashboard
              </h4>
            </Col>
            <Col xs="auto">
              <Button
                variant="outline-light"
                size="sm"
                onClick={() => setIsAuthenticated(false)}
                style={{ borderRadius: "8px" }}
              >
                <FaSignOutAlt className="me-1" />
                Logout
              </Button>
            </Col>
          </Row>
        </Container>
      </div>

      <Container className="py-4">
        {/* Header */}
        <Row className="mb-4">
          <Col>
            <div className="d-flex justify-content-between align-items-center">
              <h2 style={{ color: "#2c3e50", fontWeight: "600" }}>
                User Management
              </h2>
              <Badge
                bg="primary"
                style={{
                  fontSize: "1rem",
                  padding: "0.5rem 1rem",
                  borderRadius: "20px",
                }}
              >
                {pagination.totalUsers} Users
              </Badge>
            </div>
          </Col>
        </Row>

        {/* Search Bar */}
        <Row className="mb-4">
          <Col md={8} lg={6}>
            <Form onSubmit={handleSearch}>
              <InputGroup>
                <Form.Control
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ borderRadius: "8px 0 0 8px" }}
                />
                <Button
                  variant="primary"
                  type="submit"
                  style={{ ...primaryButtonStyle, borderRadius: "0 8px 8px 0" }}
                >
                  <FaSearch />
                </Button>
              </InputGroup>
            </Form>
          </Col>
        </Row>

        {/* Error Alert */}
        {error && (
          <Row className="mb-3">
            <Col>
              <Alert
                variant="danger"
                dismissible
                onClose={() => setError("")}
                style={{ borderRadius: "8px" }}
              >
                {error}
              </Alert>
            </Col>
          </Row>
        )}

        {/* Users Grid */}
        <Row>
          {loading ? (
            <Col className="text-center py-5">
              <Spinner animation="border" role="status" variant="primary">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
            </Col>
          ) : users.length === 0 ? (
            <Col className="text-center py-5">
              <div style={{ color: "#6c757d", fontSize: "1.1rem" }}>
                <FaUsers size={48} className="mb-3" />
                <p>No users found</p>
              </div>
            </Col>
          ) : (
            users.map((user) => (
              <Col key={user._id} md={6} lg={4} xl={3} className="mb-4">
                <Card
                  style={userCardStyle}
                  className="h-100"
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform =
                      userCardHoverStyle.transform;
                    e.currentTarget.style.boxShadow =
                      userCardHoverStyle.boxShadow;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "";
                    e.currentTarget.style.boxShadow = userCardStyle.boxShadow;
                  }}
                >
                  <Card.Body className="p-3">
                    <div className="d-flex align-items-center mb-3">
                      <div
                        style={{
                          width: "50px",
                          height: "50px",
                          borderRadius: "50%",
                          background:
                            "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "white",
                          fontSize: "1.2rem",
                          marginRight: "1rem",
                        }}
                      >
                        {user.profile?.picture ? (
                          <img
                            src={user.profile.picture}
                            alt={user.name}
                            style={{
                              width: "100%",
                              height: "100%",
                              borderRadius: "50%",
                              objectFit: "cover",
                            }}
                          />
                        ) : (
                          <FaUser />
                        )}
                      </div>
                      <div style={{ flex: 1 }}>
                        <h6
                          className="mb-0"
                          style={{ color: "#2c3e50", fontWeight: "600" }}
                        >
                          {user.name}
                        </h6>
                        <small style={{ color: "#6c757d", fontSize: "0.8rem" }}>
                          {user.email}
                        </small>
                      </div>
                      {user.isGoogleUser && (
                        <Badge bg="success" style={{ fontSize: "0.7rem" }}>
                          <FaGoogle /> Google
                        </Badge>
                      )}
                    </div>

                    <div
                      style={{
                        borderTop: "1px solid #e9ecef",
                        paddingTop: "1rem",
                      }}
                    >
                      <div className="d-flex align-items-center mb-2">
                        <FaCalendar
                          style={{ color: "#6c757d", marginRight: "0.5rem" }}
                        />
                        <small style={{ color: "#6c757d" }}>
                          Joined:{" "}
                          {new Date(user.createdAt).toLocaleDateString()}
                        </small>
                      </div>

                      {user.lastLogin && (
                        <div className="d-flex align-items-center mb-2">
                          <small style={{ color: "#6c757d" }}>
                            Last login:{" "}
                            {new Date(user.lastLogin).toLocaleString()}
                          </small>
                        </div>
                      )}
                      {!user.isGoogleUser && (
                        <>
                          <div className="user-detail-item">
                            <small style={{ color: "#6c757d" }}>
                              passwordChangedAt:{" "}
                              {user?.passwordChangedAt
                                ? new Date(
                                    user.passwordChangedAt
                                  ).toLocaleString()
                                : "N/A"}
                            </small>
                          </div>
                          <div className="user-detail-item">
                            <small style={{ color: "#6c757d" }}>
                              passwordResetAttempts:{" "}
                              {user?.passwordResetAttempts ?? 0}
                            </small>
                          </div>
                          <div className="user-detail-item">
                            <small style={{ color: "#6c757d" }}>
                              passwordVersion: {user?.passwordVersion ?? 0}
                            </small>
                          </div>
                          <div className="user-detail-item">
                            <small style={{ color: "#6c757d" }}>
                              sendEmailsOnForgetPass:{" "}
                              {user?.sendEmailsOnForgetPass ?? 0}
                            </small>
                          </div>
                        </>
                      )}
                    </div>

                    {!user.isGoogleUser && (
                      <Button
                        variant="outline-dark"
                        size="sm"
                        className="w-100 mt-3"
                        onClick={() => {
                          setSelectedUser(user);
                          setShowPasswordModal(true);
                        }}
                        style={outlineButtonStyle}
                      >
                        <FaKey className="me-2" />
                        Update Password
                      </Button>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            ))
          )}
        </Row>

        {/* Pagination */}
        {renderPagination()}

        {/* Update Password Modal */}
        <Modal
          show={showPasswordModal}
          onHide={() => setShowPasswordModal(false)}
          centered
        >
          <Modal.Header
            closeButton
            style={{ border: "none", padding: "1.5rem" }}
          >
            <Modal.Title style={{ color: "#2c3e50", fontWeight: "600" }}>
              <FaKey className="me-2" />
              Update Password for {selectedUser?.name}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body style={{ padding: "1.5rem" }}>
            <Form.Group>
              <Form.Label style={{ fontWeight: "500" }}>
                New Password
              </Form.Label>
              <InputGroup>
                <Form.Control
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  style={{ borderRadius: "8px 0 0 8px" }}
                />
                <Button
                  variant="outline-secondary"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ borderRadius: "0 8px 8px 0" }}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </Button>
              </InputGroup>
              <Form.Text style={{ color: "#6c757d", fontSize: "0.8rem" }}>
                Password must be at least 8 characters long
              </Form.Text>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer style={{ border: "none", padding: "1rem 1.5rem" }}>
            <Button
              variant="secondary"
              onClick={() => setShowPasswordModal(false)}
              style={{ borderRadius: "8px" }}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handlePasswordUpdate}
              disabled={updateLoading || newPassword.length < 8}
              style={{ ...primaryButtonStyle, borderRadius: "8px" }}
            >
              {updateLoading ? (
                <Spinner animation="border" size="sm" />
              ) : (
                "Update Password"
              )}
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </div>
  );
};

export default AdminUserManagement;
