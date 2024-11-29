import React, { useEffect, useState, useCallback } from 'react';
import {
  Container,
  Row,
  Col,
  Button,
  Alert,
  Spinner,
  Card,
  Modal,
  Pagination,
  Tabs,
  Tab,
  Form,
  InputGroup,
} from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import axios from 'axios';
import { FaFilter, FaPlus, FaCalculator, FaSync } from 'react-icons/fa';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import Layout from '../components/Layout';
import ExpenseCard from '../pages/ExpenseTable';
import Filters from '../pages/Filters';
import Analytics from '../pages/Analytics';

const ViewData = () => {
  const navigate = useNavigate();
  const { token } = useAuth();

  // Initialize all state variables with safe defaults
  const [expenses, setExpenses] = useState([]);
  const [allExpenses, setAllExpenses] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSplitModal, setShowSplitModal] = useState(false);
  const [participants, setParticipants] = useState(1);
  const [splitAmount, setSplitAmount] = useState(0);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [goToPage, setGoToPage] = useState('');

  // Pagination state with safe defaults
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    itemsPerPage: 20,
    totalRecords: 0,
  });

  // Filters state with safe defaults
  const [filters, setFilters] = useState({
    category: 'all',
    startDate: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
    endDate: format(endOfMonth(new Date()), 'yyyy-MM-dd'),
    minAmount: '',
    maxAmount: '',
    searchTerm: '',
    paymentMethod: 'all',
    tags: '',
  });

  // Safe calculation helper
  const calculateTotal = useCallback((expenseArray) => {
    // Ensure expenseArray is defined and an array
    if (!Array.isArray(expenseArray) || expenseArray.length === 0) return 0;
    return expenseArray.reduce((acc, curr) => {
      const amount = Number(curr?.amount) || 0;
      return acc + amount;
    }, 0);
  }, []);

  // Fetch expenses with comprehensive error handling
  const fetchExpensesData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const queryParams = new URLSearchParams();

      // Add pagination params with safety checks
      queryParams.append('page', pagination?.currentPage || 1);
      queryParams.append('itemsPerPage', pagination?.itemsPerPage || 20);

      // Add filters with safety checks
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== 'all') {
          if (key === 'tags') {
            queryParams.append('tags', value.trim());
          } else {
            queryParams.append(key, value);
          }
        }
      });

      // Parallel API calls with error handling
      const [expensesResponse, allExpensesResponse] = await Promise.all([
        axios.get(`/api/expenses?${queryParams.toString()}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get('/api/expenses/all', {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      // Set states with safety checks
      setExpenses(expensesResponse.data?.expenses || []);
      setPagination((prev) => ({
        ...prev,
        totalPages: expensesResponse.data?.pagination?.totalPages || 1,
        totalRecords: expensesResponse.data?.pagination?.totalRecords || 0,
        currentPage: expensesResponse.data?.pagination?.currentPage || 1,
      }));
      setAllExpenses(allExpensesResponse.data?.expenses || []);
      setTotalAmount(allExpensesResponse.data?.totalAmount || 0);
    } catch (err) {
      console.error('Error fetching expenses:', err);
      setError(err.response?.data?.message || 'Failed to fetch expenses');
      // Reset to safe defaults on error
      setExpenses([]);
      setAllExpenses([]);
      setTotalAmount(0);
    } finally {
      setLoading(false);
    }
  }, [filters, pagination?.currentPage, pagination?.itemsPerPage, token]);

  useEffect(() => {
    fetchExpensesData();
  }, [fetchExpensesData]);

  // Handlers with error handling
  const handleDeleteClick = useCallback((expense) => {
    setSelectedExpense(expense);
    setShowDeleteModal(true);
  }, []);

  const handleDelete = async () => {
    try {
      setError('');
      if (!selectedExpense?._id) {
        throw new Error('No expense selected for deletion');
      }

      await axios.delete(`/api/expenses/${selectedExpense._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setSuccess('Expense deleted successfully');
      setShowDeleteModal(false);
      await fetchExpensesData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete expense');
    }
  };

  const handleFilterChange = useCallback((updatedFilters) => {
    setFilters(updatedFilters);
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  }, []);

  const handlePageChange = useCallback(
    (newPage) => {
      if (!pagination) return;
      if (newPage < 1 || newPage > (pagination.totalPages || 1)) return;
      setPagination((prev) => ({ ...prev, currentPage: newPage }));
      setGoToPage('');
    },
    [pagination]
  );

  const calculateSplit = useCallback(() => {
    const total = calculateTotal(expenses);
    setSplitAmount(participants > 0 ? total / participants : 0);
  }, [expenses, participants, calculateTotal]);

  // Loading state
  if (loading) {
    return (
      <Layout>
        <div className="text-center py-5 d-flex flex-column align-items-center min-vh-100">
          <Spinner animation="border" variant="primary" />
          <p>Loading expenses...</p>
        </div>
      </Layout>
    );
  }

  // Main render
  return (
    <Layout>
      <Container fluid className="py-4">
        {/* Header Section */}
        <Row className="mb-4 align-items-center">
          <Col>
            <h1>Expenses</h1>
          </Col>
          <Col xs="auto">
            <div className="d-flex gap-2">
              <Button
                variant="outline-primary"
                onClick={() => setShowFilters(!showFilters)}
              >
                <FaFilter className="me-2" />
                {showFilters ? 'Hide Filters' : 'Show Filters'}
              </Button>
              <Button variant="primary" onClick={() => navigate('/create')}>
                <FaPlus className="me-2" />
                Add Expense
              </Button>
            </div>
          </Col>
        </Row>

        {/* Filters Section */}
        {showFilters && (
          <Row className="mb-4">
            <Col>
              <Filters
                filters={filters}
                onFilterChange={handleFilterChange}
                totalRecords={pagination?.totalRecords || 0}
              />
            </Col>
          </Row>
        )}

        {/* Alerts */}
        {error && (
          <Alert variant="danger" onClose={() => setError('')} dismissible>
            <div className="d-flex align-items-center">
              {error}
              <Button
                variant="danger"
                size="sm"
                onClick={() => window.location.reload()}
                className="ms-3"
              >
                <FaSync className="me-2" />
                Refresh
              </Button>
            </div>
          </Alert>
        )}
        {success && (
          <Alert variant="success" onClose={() => setSuccess('')} dismissible>
            {success}
          </Alert>
        )}

        {/* Content Section */}
        <Card className="mb-4">
          <Card.Body>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <Card.Title className="mb-0">
                  Total Expenses (All Time)
                </Card.Title>
                <h3 className="mt-2">
                  {new Intl.NumberFormat('en-PK', {
                    style: 'currency',
                    currency: 'PKR',
                  }).format(totalAmount || 0)}
                </h3>
              </div>
              <div className="text-end">
                <Card.Text className="text-muted mb-0">
                  Total Records (All Time)
                </Card.Text>
                <h4 className="mt-2">
                  {Array.isArray(allExpenses) ? allExpenses.length : 0}
                </h4>
              </div>
            </div>
          </Card.Body>
        </Card>

        <Tabs defaultActiveKey="list" id="expense-tabs" className="mb-4">
          <Tab eventKey="list" title="Expenses">
            <ExpenseCard
              expenses={Array.isArray(expenses) ? expenses : []}
              onDeleteClick={handleDeleteClick}
            />
          </Tab>
          <Tab eventKey="analytics" title="Analytics">
            <Analytics
              expenses={Array.isArray(allExpenses) ? allExpenses : []}
            />
          </Tab>
        </Tabs>

        {/* Split Calculator Button */}
        <div
          style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            zIndex: 1000,
          }}
        >
          <Button
            variant="primary"
            size="lg"
            className="rounded-circle shadow"
            onClick={() => setShowSplitModal(true)}
          >
            <FaCalculator />
          </Button>
        </div>

        {/* Split Calculator Modal */}
        <Modal
          show={showSplitModal}
          onHide={() => setShowSplitModal(false)}
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title>Split Calculator</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <h5>
              Total Expenses:{' '}
              {new Intl.NumberFormat('en-PK', {
                style: 'currency',
                currency: 'PKR',
              }).format(calculateTotal(expenses))}
            </h5>
            <Form.Group className="mb-3">
              <Form.Label>Number of Participants</Form.Label>
              <Form.Control
                type="number"
                min="1"
                value={participants}
                onChange={(e) =>
                  setParticipants(Math.max(1, Number(e.target.value) || 1))
                }
              />
            </Form.Group>
            <h5>
              Split Amount:{' '}
              {new Intl.NumberFormat('en-PK', {
                style: 'currency',
                currency: 'PKR',
              }).format(splitAmount || 0)}
            </h5>
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="primary"
              onClick={calculateSplit}
              disabled={!Array.isArray(expenses) || expenses.length === 0}
            >
              Calculate
            </Button>
            <Button
              variant="secondary"
              onClick={() => setShowSplitModal(false)}
            >
              Close
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal
          show={showDeleteModal}
          onHide={() => setShowDeleteModal(false)}
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title>Confirm Delete</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            Are you sure you want to delete this expense?
            {selectedExpense && (
              <div className="mt-3">
                <strong>{selectedExpense.category}</strong>
                <br />
                Amount:{' '}
                {new Intl.NumberFormat('en-PK', {
                  style: 'currency',
                  currency: 'PKR',
                }).format(selectedExpense.amount || 0)}
              </div>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={() => setShowDeleteModal(false)}
            >
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              Delete
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </Layout>
  );
};

export default ViewData;
