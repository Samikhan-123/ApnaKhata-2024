/* eslint-disable no-unused-vars */
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

  // States
  const [expenses, setExpenses] = useState([]);
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
  const [allExpenses, setAllExpenses] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);

  // Pagination State
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    itemsPerPage: 20,
    totalRecords: 0,
  });

  // Filters State
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

  // Fetch Expenses
  const fetchExpenses = useCallback(async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();

      // Add pagination params
      queryParams.append('page', pagination.currentPage);
      queryParams.append('itemsPerPage', pagination.itemsPerPage);

      // Add filters to query params
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== 'all') {
          if (key === 'tags') {
            queryParams.append('tags', value.trim());
          } else {
            queryParams.append(key, value);
          }
        }
      });

      const response = await axios.get(
        `/api/expenses?${queryParams.toString()}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setExpenses(response.data.expenses);
      setPagination((prev) => ({
        ...prev,
        totalPages: response.data.pagination.totalPages,
        totalRecords: response.data.pagination.totalRecords,
        currentPage: response.data.pagination.currentPage,
      }));
    } catch (err) {
      setError(err.response?.data?.message || 'something went wrong');
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.currentPage, pagination.itemsPerPage, token]);

  // Add function to fetch all expenses
  const fetchAllExpenses = useCallback(async () => {
    try {
      const response = await axios.get('/api/expenses/all', {
        headers: { Authorization: `Bearer ${token}` },
      });

      setAllExpenses(response.data.expenses);
      setTotalAmount(response.data.totalAmount);
    } catch (err) {
      console.error('Error fetching all expenses:', err);
    }
  }, [token]);

  // Update useEffect to fetch both filtered and unfiltered data
  useEffect(() => {
    fetchExpenses();
    fetchAllExpenses();
  }, [fetchExpenses, fetchAllExpenses]);

  // Handlers
  const handleDeleteClick = (expense) => {
    setSelectedExpense(expense);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`/api/expenses/${selectedExpense._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess('Expense deleted successfully');
      setShowDeleteModal(false);
      fetchExpenses();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete expense');
    }
  };

  const handleFilterChange = (updatedFilters) => {
    setFilters(updatedFilters);
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;
    setPagination((prev) => ({ ...prev, currentPage: newPage }));
    setGoToPage('');
  };

  const calculateSplit = () => {
    const total = expenses.reduce((acc, curr) => acc + curr.amount, 0);
    setSplitAmount(participants > 0 ? total / participants : 0);
  };

  // Calculate Totals
  const totalExpenses = expenses.reduce(
    (acc, expense) => acc + expense.amount,
    0
  );

  // Render Pagination
  const renderPagination = () => {
    const { currentPage, totalPages, totalRecords } = pagination;

    if (totalRecords === 0 || totalPages <= 1) return null;

    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // First page
    if (startPage > 1) {
      pages.push(
        <Pagination.Item key={1} onClick={() => handlePageChange(1)}>
          1
        </Pagination.Item>
      );
      if (startPage > 2) {
        pages.push(<Pagination.Ellipsis key="ellipsis-start" />);
      }
    }

    // Visible pages
    for (let page = startPage; page <= endPage; page++) {
      pages.push(
        <Pagination.Item
          key={page}
          active={currentPage === page}
          onClick={() => handlePageChange(page)}
        >
          {page}
        </Pagination.Item>
      );
    }

    // Last page
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(<Pagination.Ellipsis key="ellipsis-end" />);
      }
      pages.push(
        <Pagination.Item
          key={totalPages}
          onClick={() => handlePageChange(totalPages)}
        >
          {totalPages}
        </Pagination.Item>
      );
    }

    return (
      <div className="d-flex flex-column align-items-center mt-4">
        <Pagination>
          <Pagination.First
            disabled={currentPage === 1}
            onClick={() => handlePageChange(1)}
          />
          <Pagination.Prev
            disabled={currentPage === 1}
            onClick={() => handlePageChange(currentPage - 1)}
          />
          {pages}
          <Pagination.Next
            disabled={currentPage === totalPages}
            onClick={() => handlePageChange(currentPage + 1)}
          />
          <Pagination.Last
            disabled={currentPage === totalPages}
            onClick={() => handlePageChange(totalPages)}
          />
        </Pagination>

        <div className="d-flex align-items-center my-3">
          <small className="text-muted me-3">
            Page {currentPage} of {totalPages} ({totalRecords} total records)
          </small>
          <InputGroup size="sm" style={{ width: 'auto' }}>
            <Form.Control
              type="number"
              min="1"
              max={totalPages}
              value={goToPage}
              onChange={(e) => setGoToPage(e.target.value)}
              placeholder="Go to page"
              style={{ width: '100px' }}
            />
            <Button
              variant="outline-secondary"
              onClick={() => handlePageChange(Number(goToPage))}
              disabled={
                !goToPage ||
                isNaN(goToPage) ||
                goToPage < 1 ||
                goToPage > totalPages
              }
            >
              Go
            </Button>
          </InputGroup>
        </div>
      </div>
    );
  };

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
                totalRecords={pagination.totalRecords}
              />
            </Col>
          </Row>
        )}

        {/* Alerts */}
        {error && (
          <Alert variant="danger" onClose={() => setError('')} dismissible>
            <div className="d-flex align-items-center">
              {error}
              &nbsp;&nbsp;&nbsp;
              <Button variant="danger" size="sm" onClick={() => window.location.reload()} className="ml-5">
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
        {loading ? (
          <div className="text-center py-5 d-flex flex-column align-items-center min-vh-100">
            <Spinner animation="border" variant="primary" />
            <p>Loading expenses...</p>
          </div>
        ) : (
          <>
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
                      }).format(totalAmount)}
                    </h3>
                  </div>
                  <div className="text-end">
                    <Card.Text className="text-muted mb-0">
                      Total Records (All Time)
                    </Card.Text>
                    <h4 className="mt-2">{allExpenses.length}</h4>
                  </div>
                </div>
              </Card.Body>
            </Card>

            {renderPagination()}

            <Tabs defaultActiveKey="list" id="expense-tabs" className="mb-4">
              <Tab eventKey="list" title="Expenses">
                <ExpenseCard
                  expenses={expenses}
                  onDeleteClick={handleDeleteClick}
                />
              </Tab>
              <Tab eventKey="analytics" title="Analytics">
                <Analytics expenses={allExpenses} />
              </Tab>
            </Tabs>

            {renderPagination()}
          </>
        )}

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
              }).format(totalExpenses)}
            </h5>
            <Form.Group className="mb-3">
              <Form.Label>Number of Participants</Form.Label>
              <Form.Control
                type="number"
                min="1"
                value={participants}
                onChange={(e) => setParticipants(e.target.value)}
              />
            </Form.Group>
            <h5>
              Split Amount:{' '}
              {new Intl.NumberFormat('en-PK', {
                style: 'currency',
                currency: 'PKR',
              }).format(splitAmount)}
            </h5>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="primary" onClick={calculateSplit}>
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
                }).format(selectedExpense.amount)}
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
