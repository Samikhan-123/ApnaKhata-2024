/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import {
  Form,
  Button,
  Alert,
  Container,
  Row,
  Col,
  Card,
  Spinner,
} from 'react-bootstrap';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import Layout from '../components/Layout';
import { toast } from 'react-toastify'; // Import toastify
const PostExpenses = () => {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const categories = [
    'Food & Dining',
    'Shopping',
    'Transportation',
    'Bills & Utilities',
    'Entertainment',
    'Health & Fitness',
    'Travel',
    'Education',
    'Personal Care',
    'Others',
  ];
  const paymentMethods = [
    'Cash',
    'Credit Card',
    'Debit Card',
    'JazzCash',
    'EasyPaisa',
    'Other',
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
    category: Yup.string()
      .required("Category is required")
      .oneOf(categories, "Invalid category"),
    paymentMethod: Yup.string()
      .required("Payment method is required")
      .oneOf(paymentMethods, "Invalid payment method"),
    tags: Yup.string()
      .required("Tags are required")
      .min(2, "Tags must be at least 2 characters long")
      .max(30, "Tags cannot exceed 30 characters")
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
      .test("fileType", "Unsupported file type, only jpeg/png/pdf allowed", (value) => {
        if (!value) return true;
        return ["image/jpeg", "image/png", "application/pdf"].includes(
          value.type
        );
      }),
  });
  const formik = useFormik({
    initialValues: {
      description: '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      category: '',
      paymentMethod: '',
      tags: '',
      receipt: null,
    },
    validationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      setError('');
      setSuccess('');

      const submitData = new FormData();
      Object.keys(values).forEach((key) => {
        if (key === 'receipt' && values.receipt instanceof File) {
          submitData.append(key, values[key]);
        } else {
          submitData.append(key, values[key]);
        }
      });
      try {
        await axios.post(`/api/expenses/add`, submitData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        });

        setSuccess('Expense added successfully!');
        toast.success('Expense added successfully!'); // Show toast success message

        setTimeout(() => navigate('/expenses'), 500);
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to add expense'); // Show toast error message

        setError(err.response?.data?.message || 'Failed to add expense');
      } finally {
        setLoading(false);
      }
    },
  });
  return (
    <Layout title="Add Expense - ApnaKhata">
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col md={8} lg={8}>
            <Card>
              <Card.Header>
                <h4 className="mb-0">Add New Expense</h4>
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
                  {/* Amount */}
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
                  {/* Description */}
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
                  {/* Category */}
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
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">
                      {formik.errors.category}
                    </Form.Control.Feedback>
                  </Form.Group>
                  {/* Payment Method */}
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
                      <option value="">Select Payment Method</option>
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
                  {/* Date */}
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

                  {/* Tags */}
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
                  {/* Receipt Upload */}
                  <Form.Group className="mb-3">
                    <Form.Label>Receipt (optional)</Form.Label>
                    <Form.Control
                      type="file"
                      onChange={(e) =>
                        formik.setFieldValue("receipt", e.target.files[0])
                      }
                      isInvalid={
                        formik.touched.receipt && formik.errors.receipt
                      }
                      accept="image/*,.pdf"
                    />
                    <Form.Control.Feedback type="invalid">
                      {formik.errors.receipt}
                    </Form.Control.Feedback>
                    {formik.values.receipt && (
                      <small className="text-muted">
                        Selected file: {formik.values.receipt.name}
                      </small>
                    )}
                  </Form.Group>
                  <div className="d-grid gap-2 py-4">
                    <Button
                      style={{
                        backgroundColor: "var(--submit-btn-color)",
                        borderColor: "var(--home-primary-color)",
                      }}
                      type="submit"
                      disabled={loading || !formik.isValid}
                    >
                      {loading ? (
                        <>
                          <Spinner
                            as="span"
                            animation="border"
                            size="sm"
                            role="status"
                            aria-hidden="true"
                            className="me-2"
                          />
                          Submitting...
                        </>
                      ) : (
                        "Submit Expense"
                      )}
                    </Button>
                    <Button
                      variant="outline-secondary"
                      onClick={() => navigate(-1)}
                      disabled={loading}
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
export default PostExpenses;
