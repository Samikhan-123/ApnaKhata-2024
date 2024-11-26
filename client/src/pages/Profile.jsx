// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
  Spinner,
  Button,
  Container,
  Row,
  Col,
  Card,
  Alert,
  Modal,
  Table,
  Badge,
} from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { FaEdit, FaTrash } from 'react-icons/fa';
import Layout from '../components/Layout';

function Profile() {
  const [user, setUser] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState(null);

  const navigate = useNavigate();
  const { token, user: authUser, setAuth } = useAuth();

  const fetchProfileAndExpenses = useCallback(async () => {
    try {
      const response = await axios.get(`/api/auth/profile/${authUser?._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUser(response.data.user);
      setExpenses(response.data.expenses);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          'Error fetching profile or expenses. Please try again later.'
      );
      console.error('Error fetching profile or expenses:', error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!token) {
      setAuth({ user: null, token: '' });
      navigate('/login');
    } else {
      fetchProfileAndExpenses();
    }
  }, [token, fetchProfileAndExpenses, setAuth, navigate]);

  const handleDelete = async () => {
    try {
      await axios.delete(`/api/expenses/${expenseToDelete._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setExpenses((prevExpenses) =>
        prevExpenses.filter((expense) => expense._id !== expenseToDelete._id)
      );
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error('Error deleting expense:', error);
      setError('Error deleting expense. Please try again.');
    }
  };

  const handleDeleteConfirm = (expense) => {
    setExpenseToDelete(expense);
    setShowDeleteConfirm(true);
  };

  const handleEdit = (id) => {
    navigate(`/profile/edit-expense/${id}`);
  };

  if (loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: '100vh' }}
      >
        <Spinner animation="border" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert dismissible variant="danger" onClose={() => setError(null)}>
        {error}
      </Alert>
    );
  }

  return (
    <Layout title="Profile - ApnaKhata">
      <Container className="my-4 register-page vw-auto vh-100">
        <Row className="justify-content-center">
          <Col lg={10} xs={12}>
            <Card className="mb-4 shadow-lg border-light">
              <Card.Body>
                <Card.Title as="h2" className="text-center mb-4 text-success">
                  Profile
                </Card.Title>
                {user && (
                  <Row>
                    <Col md={6}>
                      <p>
                        <strong>Name:</strong> {user.name}
                      </p>
                      <p>
                        <strong>Email:</strong> {user.email}
                      </p>
                      {/* Uncomment to show profile picture */}
                      {/* {user.profile && user.profile.picture && (
                        <img src={user.profile.picture} alt="Profile" className="img-thumbnail" style={{ width: '150px', height: '150px' }} />
                      )} */}
                      {/* Uncomment to show locale */}
                      {/* <p><strong>Locale:</strong> {user.profile?.locale || 'N/A'}</p> */}
                      <p>
                        <strong>User Type:</strong>{' '}
                        {user.isGoogleUser ? 'Google User' : 'Local User'}
                      </p>
                    </Col>
                  </Row>
                )}
              </Card.Body>
            </Card>

            <Card className="shadow-lg border-light mb-5">
              <Card.Body>
                <Card.Title as="h3" className="mb-4 text-center text-primary">
                  Your Expenses
                </Card.Title>
                {expenses.length > 0 ? (
                  <Table striped bordered hover responsive variant="light">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Amount (Rs)</th>
                        <th>Date</th>
                        <th>Description</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {expenses.map((expense, index) => (
                        <tr key={expense._id}>
                          <td>{index + 1}</td>
                          <td>
                            <Badge
                              bg={expense.amount > 1000 ? 'danger' : 'success'}
                            >
                              {expense.amount}
                            </Badge>
                          </td>
                          <td>
                            {new Date(expense.date).toLocaleString('en-GB', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: 'numeric',
                              minute: '2-digit',
                              hour12: true,
                            })}
                          </td>
                          <td>{expense.description}</td>
                          <td className="d-flex gap-sm-2">
                            <Button
                              variant="outline-warning"
                              size="sm"
                              onClick={() => handleEdit(expense._id)}
                              className="me-2"
                            >
                              <FaEdit /> Edit
                            </Button>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => handleDeleteConfirm(expense)}
                            >
                              <FaTrash /> Delete
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                ) : (
                  <Alert variant="info">No expenses found.</Alert>
                )}
              </Card.Body>
            </Card>
          </Col>

          {/* Delete Confirmation Modal */}
          <Modal
            show={showDeleteConfirm}
            onHide={() => setShowDeleteConfirm(false)}
          >
            <Modal.Header closeButton>
              <Modal.Title>Confirm Deletion</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              Are you sure you want to delete this expense:
              <strong>{expenseToDelete?.description}</strong>?
            </Modal.Body>
            <Modal.Footer>
              <Button
                variant="secondary"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </Button>
              <Button variant="danger" onClick={handleDelete}>
                Delete
              </Button>
            </Modal.Footer>
          </Modal>
        </Row>

        {/* Uncomment if you want to show personal expenses */}
        {/*<hr /><br /><Card><PersonalExpenses /></Card>*/}
      </Container>
    </Layout>
  );
}

export default Profile;
