import { useState } from "react";
import {
  Button,
  Form,
  Col,
  Row,
  Breadcrumb,
  Alert,
  ProgressBar,
} from "react-bootstrap";
import axios from "axios";
import { NavLink, useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { useAuth } from "../auth/AuthContext";
import "./styles/forms.css"; // Import the unified CSS

const RegisterPage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordShown, setPasswordShown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { login, user } = useAuth();
  const [passwordStrength, setPasswordStrength] = useState({
    strength: "",
    progress: 0,
    variant: "",
    message: "",
  });

  const navigate = useNavigate();

  const togglePasswordVisibility = () => {
    setPasswordShown(!passwordShown);
  };

  const validateForm = () => {
    if (!name || !email || !password) {
      setError("Please fill in all required fields.");
      return false;
    }

    const nameRegex = /^[a-zA-Z\s]{1,50}$/;
    if (!nameRegex.test(name)) {
      setError("Please enter a valid name with alphabets and spaces.");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      return false;
    }

    return true;
  };

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

    if (!validateForm()) return;

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await axios.post("/api/auth/register", {
        name,
        email,
        password,
      });

      if (response.status === 201) {
        setSuccess("Registration successful! ");
        setName("");
        setEmail("");
        setPassword("");

        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        setError("Registration failed. Please try again.");
      }
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "An error occurred during registration."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async (credentialResponse) => {
    try {
      const response = await axios.post("/api/auth/google-login", {
        tokenId: credentialResponse.credential,
      });

      if (response.data.success) {
        const { user: googleUser, token } = response.data;
        login(googleUser, token);
        navigate("/expenses");
      } else {
        setError(response.data.message || "Google login failed");
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "An error occurred during Google login"
      );
    }
  };

  return (
    <Layout title="Register Now - ApnaKhata">
      <div className="register-page">
        <Row className="justify-content-center align-items-center min-vh-100">
          <Col lg={6} md={8} sm={10} xs={12} className="glass-form-container">
            <Breadcrumb className="glass-breadcrumb mb-3">
              <Breadcrumb.Item href="#">Home</Breadcrumb.Item>
              <Breadcrumb.Item active>Register</Breadcrumb.Item>
            </Breadcrumb>
            <h2 className="text-center mb-4">Register</h2>

            {error && (
              <Alert
                variant="danger"
                dismissible
                onClose={() => setError("")}
                className="glass-alert"
              >
                {error}
              </Alert>
            )}
            {success && (
              <Alert
                variant="success"
                dismissible
                onClose={() => setSuccess("")}
                className="glass-alert"
              >
                {success}
              </Alert>
            )}

            <Form onSubmit={handleSubmit} className="glass-form">
              <Form.Group className="mb-3" controlId="formBasicName">
                <Form.Label>Name</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="formBasicEmail">
                <Form.Label>Email address</Form.Label>
                <Form.Control
                  type="email"
                  placeholder="Enter email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="formBasicPassword">
                <Form.Label>Password</Form.Label>
                <div className="glass-input-group">
                  <Form.Control
                    type={passwordShown ? "text" : "password"}
                    placeholder="Password"
                    value={password}
                    onChange={handlePasswordChange}
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

              <Button
                type="submit"
                className="w-100 glass-btn"
                disabled={loading}
              >
                {loading ? "Registering..." : "Register"}
              </Button>

              <div className="glass-separator">
                <span>or</span>
              </div>

              {!user && (
                <GoogleOAuthProvider
                  clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}
                >
                  <GoogleLogin
                    className="w-100 glass-google-btn"
                    onSuccess={handleGoogleLogin}
                    onError={() => {
                      setError("Google login failed");
                    }}
                  />
                </GoogleOAuthProvider>
              )}

              <div className="text-center mt-3">
                <p>
                  Already registered?
                  <NavLink to="/login" className="glass-link ms-1">
                    Please login here
                  </NavLink>
                </p>
              </div>
            </Form>
          </Col>
        </Row>
      </div>
    </Layout>
  );
};

export default RegisterPage;
