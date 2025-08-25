import React, { useState } from "react";
import { Formik } from "formik";
import * as Yup from "yup";
import {
  Button,
  Form,
  Col,
  Row,
  Breadcrumb,
  Alert,
  InputGroup,
} from "react-bootstrap";
import { useNavigate, NavLink } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";
import axios from "axios";
import Layout from "../components/Layout";
import "./styles/forms.css"; // Import the unified CSS

 const LoginPage = () => {
  const [passwordShown, setPasswordShown] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const { login, user } = useAuth();
  const navigate = useNavigate();

  const togglePasswordVisibility = () => {
    setPasswordShown((prev) => !prev);
  };

  // Yup validation schema
  const validationSchema = Yup.object().shape({
    email: Yup.string()
      .email("Invalid email address")
      .required("Email is required"),
    password: Yup.string().required("Password is required"),
  });

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
        err.response?.data?.message ||
          "An error occurred during Google login"
      );
    }
  };

  return (
    <Layout title="Login - ApnaKhata">
      <div className="login-page">
        <Row className="w-100 justify-content-center align-items-center min-vh-100">
          <Col lg={6} md={8} sm={10} xs={10} className="glass-form-container">
            <Breadcrumb className="glass-breadcrumb mb-3">
              <Breadcrumb.Item href="#">Home</Breadcrumb.Item>
              <Breadcrumb.Item active>Login</Breadcrumb.Item>
            </Breadcrumb>
            <h2 className="text-center mb-4">Login</h2>

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

            {showSuccessAlert && (
              <Alert
                variant="success"
                dismissible
                onClose={() => setShowSuccessAlert(false)}
                className="glass-alert"
              >
                Login successful...
              </Alert>
            )}

            <Formik
              initialValues={{ email: "", password: "" }}
              validationSchema={validationSchema}
              onSubmit={async (values, { setSubmitting, resetForm }) => {
                setLoading(true);
                setError("");
                setShowSuccessAlert(false);
                try {
                  const response = await axios.post("/api/auth/login", values);
                  if (response.data.success) {
                    const { user: loggedInUser, token } = response.data;
                    login(loggedInUser, token);
                    setShowSuccessAlert(true);
                    setTimeout(() => {
                      navigate("/expenses");
                    }, 1000);
                  } else {
                    setError(response.data.message || "Invalid credentials");
                  }
                } catch (err) {
                  setError(
                    err.response?.data?.message ||
                      "Something went wrong with server"
                  );
                } finally {
                  setLoading(false);
                  setSubmitting(false);
                }
              }}
            >
              {({
                values,
                errors,
                touched,
                handleChange,
                handleBlur,
                handleSubmit,
                isSubmitting,
              }) => (
                <Form onSubmit={handleSubmit} className="glass-form">
                  <Form.Group className="mb-3" controlId="formBasicEmail">
                    <Form.Label>Email address</Form.Label>
                    <Form.Control
                      type="email"
                      name="email"
                      placeholder="Enter email"
                      value={values.email}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      isInvalid={touched.email && !!errors.email}
                      required
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.email}
                    </Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group className="mb-3" controlId="formBasicPassword">
                    <Form.Label>Password</Form.Label>
                    <InputGroup>
                      <Form.Control
                        type={passwordShown ? "text" : "password"}
                        name="password"
                        placeholder="Password"
                        value={values.password}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        isInvalid={touched.password && !!errors.password}
                      />
                      <Button
                        variant={
                          passwordShown ? "secondary" : "outline-secondary"
                        }
                        onClick={togglePasswordVisibility}
                        type="button"
                        aria-label={
                          passwordShown ? "Hide password" : "Show password"
                        }
                        style={{ marginLeft: "8px", minWidth: "70px" }}
                      >
                        {passwordShown ? "Hide" : "Show"}
                      </Button>
                    </InputGroup>
                    <Form.Control.Feedback type="invalid">
                      {errors.password}
                    </Form.Control.Feedback>
                  </Form.Group>

                  <div className="mb-3 text-end">
                    <NavLink to="/forgot-password" className="glass-link">
                      Forgot Password?
                    </NavLink>
                  </div>

                  <Button
                    type="submit"
                    className="w-100 glass-btn"
                    disabled={loading || isSubmitting}
                    style={{
                      backgroundColor: "var(--submit-btn-color)",
                      border: "none",
                    }}
                  >
                    {loading ? "Logging in..." : "Login"}
                  </Button>
                </Form>
              )}
            </Formik>

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
                Not registered?
                <NavLink to="/register" className="glass-link ms-1">
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

