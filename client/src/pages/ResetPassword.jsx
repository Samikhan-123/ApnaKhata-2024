import { useState } from "react";
import {
  Button,
  Form,
  Col,
  Row,
  Breadcrumb,
  Alert,
  ListGroup,
  ProgressBar,
} from "react-bootstrap";
import { useNavigate, useParams, NavLink } from "react-router-dom";
import axios from "axios";
import Layout from "../components/Layout";
import "./styles/forms.css"; // Import the unified CSS

const ResetPasswordPage = () => {
  const [passwordShown, setPasswordShown] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [unmetRequirements, setUnmetRequirements] = useState([]);
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    strength: "",
    progress: 0,
    variant: "",
    message: "",
  });

  const navigate = useNavigate();
  const { resetToken } = useParams();

  const togglePasswordVisibility = () => setPasswordShown(!passwordShown);

  const checkPasswordStrength = (password) => {
    let strength = 0;

    if (password.length >= 8) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;

    let strengthLabel = "";
    let progress = 0;
    let variant = "";
    const message =
      "Password should contain at least one uppercase letter, one lowercase letter, one number, and one special character.";

    if (strength === 0 || strength === 1) {
      strengthLabel = "Weak";
      progress = 20;
      variant = "danger";
    } else if (strength === 2) {
      strengthLabel = "Fair";
      progress = 40;
      variant = "warning";
    } else if (strength === 3) {
      strengthLabel = "Good";
      progress = 60;
      variant = "info";
    } else if (strength === 4) {
      strengthLabel = "Strong";
      progress = 80;
      variant = "primary";
    } else if (strength === 5) {
      strengthLabel = "Very Strong";
      progress = 100;
      variant = "success";
    }

    return { strength: strengthLabel, progress, variant, message };
  };

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    const strengthInfo = checkPasswordStrength(newPassword);
    setPasswordStrength(strengthInfo);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setUnmetRequirements([]);
    setSuccessMessage("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        `/api/auth/reset-password/${resetToken}`,
        { password, confirmPassword }
      );
      if (response.data.success) {
        setSuccessMessage(
          "Password successfully reset! Redirecting to login..."
        );
        setTimeout(() => navigate("/login"), 2000);
      } else {
        setError(response.data.message);
        if (response.data.requirements) {
          setUnmetRequirements(response.data.requirements);
        }
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "An error occurred while resetting your password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="Reset Password - ApnaKhata">
      <div className="container vw-100 vh-100 mt-1">
        <Row className="justify-content-center p-4">
          <Col className="glass-form-container" lg={6} xs={12}>
            <Breadcrumb className="glass-breadcrumb">
              <Breadcrumb.Item href="#">Home</Breadcrumb.Item>
              <Breadcrumb.Item active>Reset Password</Breadcrumb.Item>
            </Breadcrumb>
            <h2 className="text-center mb-4">Reset Password</h2>

            {error && (
              <Alert
                variant="danger"
                dismissible
                onClose={() => setError("")}
                className="glass-alert"
              >
                {error}
                {unmetRequirements.length > 0 && (
                  <>
                    <br />
                    <strong>Please address the following requirements:</strong>
                    <ListGroup
                      variant="flush"
                      className="glass-list-group mt-2"
                    >
                      {unmetRequirements.map((req, index) => (
                        <ListGroup.Item
                          key={index}
                          className="glass-list-group-item px-0"
                        >
                          • {req}
                        </ListGroup.Item>
                      ))}
                    </ListGroup>
                  </>
                )}
              </Alert>
            )}

            {successMessage && (
              <Alert
                variant="success"
                dismissible
                onClose={() => setSuccessMessage("")}
                className="glass-alert"
              >
                {successMessage}
              </Alert>
            )}

            <Form onSubmit={handleSubmit} className="glass-form">
              <Form.Group className="mb-3">
                <Form.Label>New Password</Form.Label>
                <div className="glass-input-group">
                  <Form.Control
                    type={passwordShown ? "text" : "password"}
                    placeholder="Enter new password"
                    value={password}
                    onChange={handlePasswordChange}
                    required
                  />
                  <Button
                    variant="outline-secondary"
                    onClick={togglePasswordVisibility}
                  >
                    {passwordShown ? "Hide" : "Show"}
                  </Button>
                </div>
              </Form.Group>

              {password && (
                <>
                  <div className="password-strength-text mb-2">
                    {passwordStrength.message}
                  </div>
                  <ProgressBar
                    striped
                    variant={passwordStrength.variant}
                    now={passwordStrength.progress}
                    label={passwordStrength.strength}
                    className="glass-progress mb-3"
                  />
                </>
              )}

              <Form.Group className="mb-3">
                <Form.Label>Confirm New Password</Form.Label>
                <div className="glass-input-group">
                  <Form.Control
                    type={passwordShown ? "text" : "password"}
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                  <Button
                    variant="outline-secondary"
                    onClick={togglePasswordVisibility}
                  >
                    {passwordShown ? "Hide" : "Show"}
                  </Button>
                </div>
              </Form.Group>

              <Button
                variant="primary"
                type="submit"
                className="w-100 glass-btn"
                disabled={loading}
              >
                {loading ? "Resetting Password..." : "Reset Password"}
              </Button>
            </Form>

            <div className="text-center mt-3">
              <p>
                Remembered your password?{" "}
                <NavLink to="/login" className="glass-link ms-1">
                  Login here
                </NavLink>
              </p>
            </div>
          </Col>
        </Row>
      </div>
    </Layout>
  );
};

export default ResetPasswordPage;
