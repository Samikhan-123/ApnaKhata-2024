import { useState } from "react";
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
import axios from "axios";
import { NavLink, useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { useAuth } from "../auth/AuthContext";
import "./styles/forms.css"; // Import the unified CSS

const RegisterPage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const api = import.meta.env.VITE_API_BASE_URL;

  // Yup validation schema
  const validationSchema = Yup.object().shape({
    name: Yup.string()
      .min(3, "Name must be at least 3 characters")
      .max(15, "Name must be at most 15 characters")
      .matches(
        /^[a-zA-Z0-9\s]+$/,
        "Name can only contain letters, numbers, and spaces"
      )
      .required("Name is required"),
    email: Yup.string()
      .email("Invalid email address")
      .required("Email is required"),
    password: Yup.string()
      .min(8, "Password must be at least 8 characters")
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*(),.?":{}|<>\-_/+\-=\[\]]).{8,}$/,
        "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
      )
      .required("Password is required"),
  });

  const handleGoogleLogin = async (credentialResponse) => {
    try {
      const response = await axios.post(`${api}/auth/google-login`, {
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
        <Row className="w-100 justify-content-center align-items-center min-vh-100">
          <Col lg={6} md={8} sm={10} xs={12} className="glass-form-container">
            <Breadcrumb className="glass-breadcrumb mb-3">
              <Breadcrumb.Item href="/">Home</Breadcrumb.Item>
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

            <Formik
              initialValues={{ name: "", email: "", password: "" }}
              validationSchema={validationSchema}
              onSubmit={async (values, { setSubmitting, resetForm }) => {
                setLoading(true);
                setError("");
                setSuccess("");
                try {
                  const response = await axios.post(
                    `${api}/auth/register`,
                    values
                  );
                  if (response.status === 201) {
                    setSuccess("Registration successful! ");
                    resetForm();
                    setTimeout(() => {
                      navigate("/login");
                    }, 1500);
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
                setFieldValue,
              }) => (
                <Form onSubmit={handleSubmit} className="glass-form">
                  <Form.Group className="mb-3" controlId="formBasicName">
                    <Form.Label>Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="name"
                      placeholder="Enter your name"
                      value={values.name}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      isInvalid={touched.name && !!errors.name}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.name}
                    </Form.Control.Feedback>
                  </Form.Group>

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
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.email}
                    </Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group className="mb-3" controlId="formBasicPassword">
                    <Form.Label>Password</Form.Label>
                    <InputGroup>
                      <Form.Control
                        type={showPassword ? "text" : "password"}
                        name="password"
                        placeholder="Password"
                        value={values.password}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        isInvalid={touched.password && !!errors.password}
                      />
                      <Button
                        variant={
                          showPassword ? "secondary" : "outline-secondary"
                        }
                        onClick={() => setShowPassword((prev) => !prev)}
                        type="button"
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
                        }
                        style={{ marginLeft: "8px", minWidth: "70px" }}
                      >
                        {showPassword ? "Hide" : "Show"}
                      </Button>
                      <Form.Control.Feedback type="invalid">
                        {errors.password}
                      </Form.Control.Feedback>
                    </InputGroup>
                  </Form.Group>

                  <Button
                    type="submit"
                    className="w-100 glass-btn"
                    disabled={loading || isSubmitting}
                    style={{ backgroundColor: 'var(--submit-btn-color)', border: 'none' }} 
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
              )}
            </Formik>
          </Col>
        </Row>
      </div>
    </Layout>
  );
};

export default RegisterPage;
