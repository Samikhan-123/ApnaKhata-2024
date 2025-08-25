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
 
} from "react-bootstrap";
import { useNavigate, useParams, NavLink } from "react-router-dom";
import axios from "axios";
import Layout from "../components/Layout";
import "./styles/forms.css"; // Import the unified CSS

const ResetPasswordPage = () => {
  const [passwordShown, setPasswordShown] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { resetToken } = useParams();

  const togglePasswordVisibility = () => setPasswordShown((prev) => !prev);

  // Yup validation schema
  const validationSchema = Yup.object().shape({
    password: Yup.string()
      .min(8, "Password must be at least 8 characters")
      .matches(/[A-Z]/, "Must contain an uppercase letter")
      .matches(/[a-z]/, "Must contain a lowercase letter")
      .matches(/[0-9]/, "Must contain a number")
      .matches(/[^A-Za-z0-9]/, "Must contain a special character")
      .required("Password is required"),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("password"), null], "Passwords must match")
      .required("Confirm password is required"),
  });

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

            <Formik
              initialValues={{ password: "", confirmPassword: "" }}
              validationSchema={validationSchema}
              onSubmit={async (values, { setSubmitting }) => {
                setLoading(true);
                setError("");
                setSuccessMessage("");
                try {
                  const response = await axios.post(
                    `/api/auth/reset-password/${resetToken}`,
                    values
                  );
                  if (response.data.success) {
                    setSuccessMessage(
                      "Password successfully reset! Redirecting to login..."
                    );
                    setTimeout(() => navigate("/login"), 2000);
                  } else {
                    setError(response.data.message);
                  }
                } catch (err) {
                  setError(
                    err.response?.data?.message ||
                      "An error occurred while resetting your password."
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
                  <Form.Group className="mb-3">
                    <Form.Label>New Password</Form.Label>
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <Button
                        variant={
                          passwordShown ? "secondary" : "outline-secondary"
                        }
                        onClick={togglePasswordVisibility}
                        type="button"
                        aria-label={
                          passwordShown ? "Hide password" : "Show password"
                        }
                        style={{ marginRight: "8px", minWidth: "70px" }}
                      >
                        {passwordShown ? "Hide" : "Show"}
                      </Button>
                      <Form.Control
                        type={passwordShown ? "text" : "password"}
                        name="password"
                        placeholder="Enter new password"
                        value={values.password}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        isInvalid={touched.password && !!errors.password}
                        required
                        autoComplete="new-password"
                        style={{ flex: 1 }}
                      />
                    </div>
                    <Form.Control.Feedback type="invalid">
                      {errors.password}
                    </Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Confirm New Password</Form.Label>
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <Button
                        variant={
                          passwordShown ? "secondary" : "outline-secondary"
                        }
                        onClick={togglePasswordVisibility}
                        type="button"
                        aria-label={
                          passwordShown ? "Hide password" : "Show password"
                        }
                        style={{ marginRight: "8px", minWidth: "70px" }}
                      >
                        {passwordShown ? "Hide" : "Show"}
                      </Button>
                      <Form.Control
                        type={passwordShown ? "text" : "password"}
                        name="confirmPassword"
                        placeholder="Confirm new password"
                        value={values.confirmPassword}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        isInvalid={
                          touched.confirmPassword && !!errors.confirmPassword
                        }
                        required
                        autoComplete="new-password"
                        style={{ flex: 1 }}
                      />
                    </div>
                    <Form.Control.Feedback type="invalid">
                      {errors.confirmPassword}
                    </Form.Control.Feedback>
                  </Form.Group>

                  <Button
                    style={{
                      backgroundColor: "var(--submit-btn-color)",
                      border: "none",
                    }}
                    type="submit"
                    className="w-100 glass-btn"
                    disabled={loading || isSubmitting}
                  >
                    {loading ? "Resetting Password..." : "Reset Password"}
                  </Button>
                </Form>
              )}
            </Formik>

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

