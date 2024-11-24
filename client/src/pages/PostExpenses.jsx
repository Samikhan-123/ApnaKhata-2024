import React, { useState } from 'react';
import {
  Form,
  Button,
  Alert,
  Container,
  Row,
  Col,
  Card,
} from 'react-bootstrap';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import Layout from '../components/Layout';

const PostExpenses = () => {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // // get current loacl time
  // const getCurrentLocalDatetime = () => {
  //   const now = new Date();
  //   const offset = now.getTimezoneOffset() * 60000; // Get the offset in milliseconds
  //   const localISOTime = new Date(now.getTime() - offset).toISOString();
  //   return localISOTime.slice(0, 16); // Extract 'YYYY-MM-DDTHH:mm'
  // };


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
      .required('Description is required')
      .max(200, 'Description cannot exceed 200 characters'),
    amount: Yup.number()
      .required('Amount is required')
      .min(0, 'Amount must be a positive number'),
    date: Yup.date().nullable().required('Date is required'),
    category: Yup.string().required('Category is required'),
    paymentMethod: Yup.string().required('Payment method is required'),
    tags: Yup.string().required('Tags are required')
      .matches(
        /^[a-zA-Z0-9,\s]*$/,
        'Tags can only contain letters, numbers, and commas'
      )
      .nullable(),
    notes: Yup.string().nullable(), 
  });

  const formik = useFormik({
    initialValues: {
      description: '',
      amount: '',
      date: new Date().toISOString().split('T')[0], // Automatically prefilled with local date
      category: '',
      paymentMethod: '',
      tags: '',
      notes: '',
      receipt: null,
    },
    validationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      setError('');
      setSuccess('');

      try {
        const formData = new FormData();

        // Append all form fields
        Object.keys(values).forEach((key) => {
          if (key === 'receipt' && values[key]) {
            formData.append('receipt', values[key]);
          } else if (key !== 'receipt') {
            formData.append(key, values[key]);
          }
        });

        const response = await axios.post('/api/expenses/add', formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        });

        if (response.data.success) {
          setSuccess('Expense added successfully!');
          setTimeout(() => navigate('/expenses'), 1500);
        }
        else {
          return response.data.message;
        }
      } catch (err) {
        console.error('Error adding expense:', err);
        setError(
          err.response?.data?.message || err.message || 'Failed to add expense'
        );
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
                    onClose={() => setError('')}
                  >
                    {error}
                  </Alert>
                )}
                {success && (
                  <Alert
                    variant="success"
                    dismissible
                    onClose={() => setSuccess('')}
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

                  {/* Date */}
                  <Form.Group className="mb-3">
                    <Form.Label>Date *</Form.Label>
                    <Form.Control
                      type="date"
                      name="date"
                      value={formik.values.date}
                      onChange={(e) =>
                        formik.setFieldValue('date', e.target.value || '')
                      }
                      onBlur={() => formik.setFieldTouched('date', true, true)}
                      isInvalid={formik.touched.date && formik.errors.date}
                    />
                    <Form.Control.Feedback type="invalid">
                      {formik.errors.date}
                    </Form.Control.Feedback>
                  </Form.Group>

                  
                  {/* Receipt Upload */}
                  <Form.Group className="mb-3">
                    <Form.Label>Receipt (optional)</Form.Label>
                    <Form.Control
                      type="file"
                      onChange={(e) =>
                        formik.setFieldValue('receipt', e.target.files[0])
                      }
                      accept="image/*,.pdf"
                    />
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

                  {/* Notes */}
                  <Form.Group className="mb-3">
                    <Form.Label>Notes (optional)</Form.Label>
                    <Form.Control
                      as="textarea"
                      name="notes"
                      value={formik.values.notes}
                      onChange={formik.handleChange}
                      placeholder="Add any notes (optional)"
                    />
                  </Form.Group>

                  <div className="d-grid gap-2">
                    <Button variant="primary" type="submit" disabled={loading}>
                      {loading ? 'Adding...' : 'Add Expense'}
                    </Button>
                    <Button
                      variant="outline-secondary"
                      onClick={() => navigate('/expenses')}
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
