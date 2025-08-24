import { useState } from "react";
import { Button, Form, Col, Row, Breadcrumb, Alert } from "react-bootstrap";
import { NavLink } from "react-router-dom";
import axios from "axios";
import Layout from "../components/Layout";
import "./styles/forms.css"; // Import the unified CSS

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [alert, setAlert] = useState({ message: "", type: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setAlert({ message: "", type: "" });
    setEmail("");

    try {
      const response = await axios.post("/api/auth/forgot-password", { email });
      setAlert({
        message: response.data.message || "Reset link sent successfully!",
        type: "success",
      });
    } catch (err) {
      if (err.response?.status === 429) {
        setAlert({
          message:
            err.response.data.message ||
            "Too many password reset attempts from this IP, please try again after an hour",
          type: "danger",
        });
      } else {
        setAlert({
          message: err.response.data.message || "Something went wrong",
          type: "danger",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="Forget Password - ApnaKhata">
      <div className="container forgot-pass vw-100 vh-100 mt-5">
        <Row className="justify-content-center p-4">
          <Col
            xl={8}
            lg={6}
            md={8}
            sm={10}
            xs={12}
            className="glass-form-container"
          >
            <Breadcrumb className="glass-breadcrumb">
              <Breadcrumb.Item href="#">Home</Breadcrumb.Item>
              <Breadcrumb.Item active>Forgot Password</Breadcrumb.Item>
            </Breadcrumb>
            <h2 className="text-center mb-4">Forgot Password</h2>

            {alert.message && (
              <Alert variant={alert.type} dismissible className="glass-alert">
                {alert.message}
              </Alert>
            )}

            <Form onSubmit={handleSubmit} className="glass-form">
              <Form.Group className="mb-3" controlId="formBasicEmail">
                <Form.Label>Registered Email address</Form.Label>
                <Form.Control
                  type="email"
                  placeholder="Enter your registered email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </Form.Group>

              <Button
                type="submit"
                className="w-100 glass-btn"
                disabled={loading}
              >
                {loading ? "Sending..." : "Send Reset Link"}
              </Button>
            </Form>

            <div className="text-center mt-3">
              <p>
                Remembered your password?
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

export default ForgotPasswordPage;
