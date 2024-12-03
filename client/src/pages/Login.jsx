/* eslint-disable no-unused-vars */
// LoginPage.js
import React, { useState } from "react";
import { Button, Form, Col, Row, Breadcrumb, Alert } from "react-bootstrap";
import { useNavigate, NavLink } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";
import axios from "axios";
import Layout from "../components/Layout";
import toast from "react-hot-toast";
import "./styles/Login.css";

const LoginPage = () => {
  const [passwordShown, setPasswordShown] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const { login, user } = useAuth(); // Use login and user from AuthContext
  const navigate = useNavigate();

  const togglePasswordVisibility = () => {
    setPasswordShown(!passwordShown);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setShowSuccessAlert(false);

    try {
      const response = await axios.post("/api/auth/login", { email, password });

      if (response.data.success) {
        const { user: loggedInUser, token } = response.data;
        login(loggedInUser, token); // Set user and token in context
        setShowSuccessAlert(true);
        // toast.success("Login successful!");

        // Redirect after login
        setTimeout(() => {
          navigate("/expenses");
        }, 1000);
      } else {
        setError(response.data.message || "Invalid credentials");
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "ohh! something went wrong with server"
      );
      // toast.error(err.response?.data?.message || "Login failed");
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
        login(googleUser, token); // Set user and token from Google login
        // toast.success("Google login successful!");
        navigate("/expenses");
      } else {
        setError(response.data.message || "Google login failed");
        // toast.error(response.data.message || "Google login failed");
      }
    } catch (err) {
      console.error("Google login error:", err);
      setError(
        err.response?.data?.message || "An error occurred during Google login"
      );
      // toast.error(err.response?.data?.message || "Google login failed");
    }
  };

  return (
    <Layout title="Login - ApnaKhata">
      <div className="login-page">
        <Row className=" justify-content-center align-items-center min-vh-100 ">
          <Col
            lg={6}
            md={8}
            sm={10}
            xs={10}
            className="bg-light rounded shadow-sm p-4"
          >
            <Breadcrumb className="mb-3">
              <Breadcrumb.Item href="#">Home</Breadcrumb.Item>
              <Breadcrumb.Item active>Login</Breadcrumb.Item>
            </Breadcrumb>
            <h2 className="text-center mb-4">Login</h2> 

            {error && (
              <Alert variant="danger" dismissible onClose={() => setError("")}>
                {error}
              </Alert>
            )}

            {showSuccessAlert && (
              <Alert
                variant="success"
                dismissible
                onClose={() => setShowSuccessAlert(false)}
              >
                Login successful...
              </Alert>
            )}

            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3" controlId="formBasicEmail">
                <Form.Label>Email address</Form.Label>
                <Form.Control
                  type="email"
                  placeholder="Enter email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="formBasicPassword">
                <Form.Label>Password</Form.Label>
                <div className="input-group">
                  <Form.Control
                    type={passwordShown ? "text" : "password"}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <Button
                    variant="outline-secondary"
                    onClick={togglePasswordVisibility}
                    aria-label={
                      passwordShown ? "Hide password" : "Show password"
                    }
                  >
                    {passwordShown ? "Hide" : "Show"}
                  </Button>
                </div>
              </Form.Group>

              <div className="mb-3 text-end">
                <NavLink to="/forgot-password" className="text-primary">
                  Forgot Password?
                </NavLink>
              </div>

              <Button
                variant="primary"
                type="submit"
                className="w-100"
                disabled={loading}
              >
                {loading ? "Logging in..." : "Login"}
              </Button>
            </Form>

            {/* Separator line with text */}
            <div className="my-3 text-center">
              <hr />
              <span className="text-muted">or</span>
              <hr />
            </div>

            {!user && (
              <GoogleOAuthProvider
                clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}
              >
                <GoogleLogin
                  className="w-100 google-button"
                  onSuccess={handleGoogleLogin}
                  onError={() => {
                    setError("Google login failed");
                    // toast.error("Google login failed");
                  }}
                />
              </GoogleOAuthProvider>
            )}

            <div className="text-center mt-3">
              <p>
                Not registered?
                <NavLink to="/register" className="text-primary">
                  Register here
                </NavLink>
              </p>
            </div>
          </Col>
        </Row>
      </div>
    </Layout>
  );
};

export default LoginPage;
