import { useState } from "react";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import {
  Button,
  Col,
  Row,
  Breadcrumb,
  Alert,
  InputGroup,
} from "react-bootstrap";
import { useNavigate, useParams, NavLink } from "react-router-dom";
import axios from "axios";
import Layout from "../components/Layout";
import "./styles/forms.css";

const ResetPasswordPage = () => {
  const [passwordShown, setPasswordShown] = useState(false);
  const [confirmPasswordShown, setConfirmPasswordShown] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { resetToken } = useParams();
  const api = import.meta.env.VITE_API_BASE_URL;

  // Toggle password visibility
  const togglePasswordVisibility = () => setPasswordShown((prev) => !prev);
  const toggleConfirmPasswordVisibility = () =>
    setConfirmPasswordShown((prev) => !prev);

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

  // Handle form submission
  const handleSubmit = async (
    values,
    { resetForm, setSubmitting, setFieldTouched }
  ) => {
    setLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      const response = await axios.post(
        `${api}/auth/reset-password/${resetToken}`,
        values
      );

      if (response.data.success) {
        setSuccessMessage("Password successfully reset! Please log in again.");
        resetForm(); // Reset the form fields
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      if (err.response?.data?.error) {
        setError(
          err.response.data.error.map((error) => error.message).join(", ")
        );
      } else {
        setError(
          err.response?.data?.message ||
            "An error occurred while resetting your password."
        );
      }
    } finally {
      setLoading(false);
      setSubmitting(false);
      setFieldTouched("password", true);
      setFieldTouched("confirmPassword", true);
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

            {/* Error Alert */}
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

            {/* Success Alert */}
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

            {/* Password Requirements */}
            <Alert className="text-center" variant="info" dismissible>
              Note: Password must contain at least 8 characters, one uppercase
              letter, one lowercase letter, one number and one special
              character.
            </Alert>

            {/* Formik Form */}
            <Formik
              initialValues={{ password: "", confirmPassword: "" }}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
            >
              {({ errors, touched, isSubmitting, isValid, dirty }) => (
                <Form className="glass-form">
                  {/* Password Field */}
                  <div className="mb-3">
                    <label htmlFor="password" className="form-label">
                      New Password
                    </label>
                    <InputGroup>
                      <Field
                        name="password"
                        type={passwordShown ? "text" : "password"}
                        className={`form-control ${touched.password && errors.password ? "is-invalid" : ""}`}
                        placeholder="Enter new password"
                      />
                      <Button
                        variant="outline-secondary"
                        onClick={togglePasswordVisibility}
                        type="button"
                        aria-label={
                          passwordShown ? "Hide password" : "Show password"
                        }
                      >
                        {passwordShown ? "Hide" : "Show"}
                      </Button>
                      {touched.password && errors.password && (
                        <div className="invalid-feedback d-block">
                          {errors.password}
                        </div>
                      )}
                    </InputGroup>
                  </div>

                  {/* Confirm Password Field */}
                  <div className="mb-3">
                    <label htmlFor="confirmPassword" className="form-label">
                      Confirm New Password
                    </label>
                    <InputGroup>
                      <Field
                        name="confirmPassword"
                        type={confirmPasswordShown ? "text" : "password"}
                        className={`form-control ${touched.confirmPassword && errors.confirmPassword ? "is-invalid" : ""}`}
                        placeholder="Confirm new password"
                      />
                      <Button
                        variant="outline-secondary"
                        onClick={toggleConfirmPasswordVisibility}
                        type="button"
                        aria-label={
                          confirmPasswordShown
                            ? "Hide password"
                            : "Show password"
                        }
                      >
                        {confirmPasswordShown ? "Hide" : "Show"}
                      </Button>
                      {touched.confirmPassword && errors.confirmPassword && (
                        <div className="invalid-feedback d-block">
                          {errors.confirmPassword}
                        </div>
                      )}
                    </InputGroup>
                  </div>

                  {/* Submit Button */}
                  <Button
                    style={{
                      backgroundColor: "var(--submit-btn-color)",
                      border: "none",
                    }}
                    type="submit"
                    className="w-100 glass-btn"
                    disabled={loading || isSubmitting || !isValid || !dirty}
                  >
                    {loading ? "Resetting Password..." : "Reset Password"}
                  </Button>
                </Form>
              )}
            </Formik>

            {/* Login Link */}
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
