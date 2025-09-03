/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import {
  Form,
  Button,
  Alert,
  Container,
  Row,
  Col,
  Card,
  Spinner,
} from "react-bootstrap";
import { useFormik } from "formik";
import * as Yup from "yup";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import Layout from "../components/Layout";
import { toast } from "react-toastify"; // Import toast from react-toastify

const EditExpense = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [currentReceipt, setCurrentReceipt] = useState(""); // Store receipt URL or filename

  const categories = [
    "Food & Dining",
    "Shopping",
    "Transportation",
    "Bills & Utilities",
    "Entertainment",
    "Health & Fitness",
    "Travel",
    "Education",
    "Personal Care",
    "Others",
  ];

  const paymentMethods = [
    "Cash",
    "Credit Card",
    "Debit Card",
    "JazzCash",
    "EasyPaisa",
    "Other",
  ];

  const validationSchema = Yup.object().shape({
    description: Yup.string()
      .required("Description is required")
      .min(5, "Description must be at least 5 characters long")
      .max(100, "Description cannot exceed 100 characters"),
    amount: Yup.number()
      .required("Amount is required")
      .min(0, "Amount must be a positive number"),
    date: Yup.date().nullable().required("Date is required"),
    category: Yup.string().required("Category is required"),
    paymentMethod: Yup.string().required("Payment method is required"),
    tags: Yup.string()
      .required("Tags are required")
      .matches(
        /^[a-zA-Z0-9,\s]*$/,
        "Tags can only contain letters, numbers, and commas"
      )
      .nullable(),
    receipt: Yup.mixed()
      .nullable()
      .test("fileSize", "File size too large, max allowed 1MB", (value) => {
        if (!value) return true;
        return value.size <= 1 * 1024 * 1024; // 1MB limit
      })
      .test("fileType", "Unsupported file type", (value) => {
        if (!value) return true;
        return ["image/jpeg", "image/png", "application/pdf"].includes(
          value.type
        );
      }),
  });

  const formik = useFormik({
    enableReinitialize: true, // Allow form to reinitialize when initialValues change
    initialValues: {
      description: "",
      amount: "",
      date: "",
      category: "",
      paymentMethod: "",
      tags: "",
      receipt: null, // Initialize receipt as null
    },
    validationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      setError("");
      setSuccess("");

      const submitData = new FormData();
      Object.keys(values).forEach((key) => {
        if (key === "receipt" && values.receipt instanceof File) {
          submitData.append(key, values[key]);
        } else {
          submitData.append(key, values[key]);
        }
      });

      try {
        await axios.put(`/api/expenses/${id}`, submitData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
        setSuccess("Expense updated successfully!");

        toast.success("Expense updated successfully!"); // Use toast for success message
        setTimeout(() => navigate("/expenses"), 500);
      } catch (err) {
        toast.error(err.response?.data?.message || "Failed to update expense"); // Use toast for error message
        setError(err.response?.data?.message || "Failed to update expense");
      } finally {
        setLoading(false);
      }
    },
  });

  useEffect(() => {
    const fetchExpense = async () => {
      try {
        const { data } = await axios.get(`/api/expenses/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (data?.success) {
          const expense = data.expense;

          // Format date to ISO string for date input
          const formattedDate = expense.date
            ? new Date(expense.date).toISOString().split("T")[0]
            : "";

          formik.setValues({
            description: expense.description || "",
            amount: expense.amount || "",
            date: formattedDate,
            category: expense.category || "",
            paymentMethod: expense.paymentMethod || "",
            tags: expense.tags?.join(", ") || "",
            // notes: expense.notes || '',
            receipt: expense.receipt?.originalName || null, // Keep receipt null for file upload
          });

          setCurrentReceipt(expense.receipt?.originalName || ""); // Set the receipt file or URL
        }
      } catch (err) {
        toast.error(err.response?.data?.message || "Something went wrong"); // Use toast for error message
        setError(err.response?.data?.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchExpense();
  }, [id, token]);

  // if (loading) {
  //   return (
  //     <Layout title="Edit Expense - ApnaKhata">
  //       <Container className="d-flex justify-content-center align-items-center">
  //         <div className="text-center py-5 min-vh-100">
  //           <Spinner animation="border" variant="primary" />
  //           <p>Loading data...</p>
  //         </div>
  //       </Container>
  //     </Layout>
  //   );
  // }

  return (
    <Layout title="Edit Expense - ApnaKhata">
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col md={8} lg={8}>
            <Card>
              <Card.Header>
                <h4 className="mb-0">Edit Expense</h4>
              </Card.Header>
              <Card.Body>
                {error && (
                  <Alert
                    variant="danger"
                    dismissible
                    onClose={() => setError("")}
                  >
                    {error}
                  </Alert>
                )}
                {success && (
                  <Alert
                    variant="success"
                    dismissible
                    onClose={() => setSuccess("")}
                  >
                    {success}
                  </Alert>
                )}

                <Form onSubmit={formik.handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label>Amount *</Form.Label>
                    <Form.Control
                      type="number"
                      name="amount"
                      value={formik.values.amount}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      placeholder="Enter amount"
                      isInvalid={formik.touched.amount && formik.errors.amount}
                    />
                    <Form.Control.Feedback type="invalid">
                      {formik.errors.amount}
                    </Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Description *</Form.Label>
                    <Form.Control
                      as="textarea"
                      name="description"
                      value={formik.values.description}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      placeholder="Enter description"
                      isInvalid={
                        formik.touched.description && formik.errors.description
                      }
                    />
                    <Form.Control.Feedback type="invalid">
                      {formik.errors.description}
                    </Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Category *</Form.Label>
                    <Form.Select
                      name="category"
                      value={formik.values.category}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      isInvalid={
                        formik.touched.category && formik.errors.category
                      }
                    >
                      <option value="">Select Category</option>
                      {categories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">
                      {formik.errors.category}
                    </Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Payment Method *</Form.Label>
                    <Form.Select
                      name="paymentMethod"
                      value={formik.values.paymentMethod}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      isInvalid={
                        formik.touched.paymentMethod &&
                        formik.errors.paymentMethod
                      }
                    >
                      <option value="">Select Payment Method </option>
                      {paymentMethods.map((method) => (
                        <option key={method} value={method}>
                          {method}
                        </option>
                      ))}
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">
                      {formik.errors.paymentMethod}
                    </Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Date *</Form.Label>
                    <Form.Control
                      type="date"
                      name="date"
                      value={formik.values.date}
                      onChange={(e) =>
                        formik.setFieldValue("date", e.target.value || "")
                      }
                      onBlur={() => formik.setFieldTouched("date", true, true)}
                      isInvalid={formik.touched.date && formik.errors.date}
                    />
                    <Form.Control.Feedback type="invalid">
                      {formik.errors.date}
                    </Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Tags *</Form.Label>
                    <Form.Control
                      type="text"
                      name="tags"
                      value={formik.values.tags}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      placeholder="Enter tags e.g personal,family (comma separated)"
                      isInvalid={formik.touched.tags && formik.errors.tags}
                    />
                    <Form.Control.Feedback type="invalid">
                      {formik.errors.tags}
                    </Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Receipt (optional)</Form.Label>
                    {currentReceipt && (
                      <div className="mb-2">
                        current:{" "}
                        {currentReceipt || <span>No receipt uploaded</span>}
                      </div>
                    )}
                    <p className="text-muted">
                      {currentReceipt
                        ? "If a new receipt is uploaded, it will replace the current one"
                        : "no receipt found for this expense"}
                    </p>
                    <Form.Control
                      type="file"
                      onChange={(e) =>
                        formik.setFieldValue("receipt", e.target.files[0])
                      }
                      accept="image/*,.pdf"
                    />
                    {formik.values.receipt && formik.values.receipt.name && (
                      <div className="mt-2">
                        <small>
                          Selected file: {formik.values.receipt.name}
                        </small>
                      </div>
                    )}
                  </Form.Group>

                  
                  <div className="d-grid gap-2">
                    <Button
                      style={{
                        backgroundColor: "var(--submit-btn-color)",
                        border: "none",
                      }}
                      type="submit"
                      disabled={loading}
                    >
                      {loading ? "Saving..." : "Save Changes"}
                    </Button>
                    <Button
                      variant="outline-secondary"
                      onClick={() => navigate("/expenses")}
                    >
                      Cancel
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </Layout>
  );
};

export default EditExpense;
