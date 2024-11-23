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
import { FaFilter, FaFileExport, FaPlus, FaCalculator } from 'react-icons/fa';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import Layout from '../components/Layout';
import ExpenseCard from '../pages/ExpenseTable'; // Ensure correct path
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

  // Pagination State
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    itemsPerPage: 20,
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
  });

  // Fetch Expenses
  const fetchExpenses = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const {
        startDate,
        endDate,
        category,
        paymentMethod,
        searchTerm,
        minAmount,
        maxAmount,
      } = filters;

      const response = await axios.get('/api/expenses', {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          startDate,
          endDate,
          category: category === 'all' ? '' : category,
          paymentMethod: paymentMethod === 'all' ? '' : paymentMethod,
          search: searchTerm,
          minAmount: minAmount || undefined,
          maxAmount: maxAmount || undefined,
        },
      });

      setExpenses(response.data.expenses);
      console.log("expenses",response.data.expenses);
      setPagination((prev) => ({
        ...prev,
        totalPages: Math.ceil(
          response.data.expenses.length / prev.itemsPerPage
        ),
      }));
    } catch (err) {
      setError(err.response?.data?.message || 'something went wrong.');
    } finally {
      setLoading(false);
    }
  }, [filters, token]);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses, pagination.currentPage]);

  // Handlers
  const handleDeleteClick = (expense) => {
    setSelectedExpense(expense);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`/api/expenses/${selectedExpense.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess('Expense deleted successfully.');
      setShowDeleteModal(false);
      fetchExpenses();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete expense.');
    }
  };

  const handleFilterChange = (updatedFilters) => {
    setFilters(updatedFilters);
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;
    setPagination((prev) => ({ ...prev, currentPage: newPage }));
    setGoToPage(''); // Clear the input field
  };

  const calculateSplit = () => {
    const total = expenses.reduce((acc, curr) => acc + curr.amount, 0);
    setSplitAmount(participants > 0 ? total / participants : 0);
  };

  // Get Paginated Data
  const paginatedExpenses = expenses.slice(
    (pagination.currentPage - 1) * pagination.itemsPerPage,
    pagination.currentPage * pagination.itemsPerPage
  );

  // Calculate Totals
  const totalExpenses = expenses.reduce(
    (acc, expense) => acc + expense.amount,
    0
  );

  // Render Pagination with Dynamic Visibility and Go To Page
  // Render Pagination with Dynamic Visibility, Ellipsis, and Go To Page
  const renderPagination = () => {
    const { currentPage, totalPages } = pagination;

    // Hide pagination if only one page
    if (totalPages <= 1) return null;

    const pages = [];
    const maxVisiblePages = 5; // Max visible pages in pagination

    for (let page = 1; page <= totalPages; page++) {
      // Show the first page, last page, and currentPage ± 1 range
      if (
        page === 1 ||
        page === totalPages ||
        (page >= currentPage - 1 && page <= currentPage + 1)
      ) {
        pages.push(
          <Pagination.Item
            key={page}
            active={currentPage === page}
            onClick={() => handlePageChange(page)}
          >
            {page}
          </Pagination.Item>
        );
      } else if (page === currentPage - 2 || page === currentPage + 2) {
        // Add ellipsis for skipped ranges
        pages.push(<Pagination.Ellipsis key={`ellipsis-${page}`} disabled />);
      }
    }

    return (
      <>
        <Pagination className="justify-content-center mt-5">
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
        <div className="text-center mt-3 mb-5">
          <InputGroup className="w-25 mx-auto">
            <Form.Control
              type="number"
              placeholder="Go to page..."
              value={goToPage}
              onChange={(e) => setGoToPage(e.target.value)}
            />
            <Button
              variant="primary"
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
      </>
    );
  };

  return (
    <Layout>
      <Container fluid className="py-4 min-vh-100">
        {/* Header */}
        <Row className="mb-4">
          <Col>
            <Card className="shadow-sm bg-light">
              <Card.Body className="d-flex justify-content-between align-items-center">
                <h4 className="mb-0 d-none  d-md-block"> ApnaKhata Expense Tracker</h4>
                <div className="d-flex flex-wrap justify-content-end">
                  <Button
                    variant="outline-primary"
                    className="me-2 me-md-3 mb-2 mb-md-0"
                    onClick={() => setShowFilters(!showFilters)}
                  >
                    <FaFilter className="me-1" />
                    <span className=" d-md-inline">Filters</span>
                  </Button>
                  <Button
                    variant="outline-success"
                    className="me-2 me-md-3 mb-2 mb-md-0"
                    onClick={() => navigate('/create')}
                  >
                    <FaPlus className="me-1" />
                    <span className=" d-md-inline">Add Expense</span>
                  </Button>
                  {/* <Button variant="outline-dark">
                    <FaFileExport className="me-1" />
                    <span className="d-none d-md-inline">Export</span>
                  </Button> */}
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Filters Section */}
        {showFilters && (
          <Row className="mb-4">
            <Col>
              <Filters
                filters={filters}
                onFilterChange={handleFilterChange}
                totalRecords={expenses.length}
              />
            </Col>
          </Row>
        )}

        {/* Content Section */}
        {error && (
          <Alert dismissible variant="danger">
            {error}
          </Alert>
        )}
        {success && (
          <Alert dismissible variant="success">
            {success}
          </Alert>
        )}
        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" />
            <p>Loading data...</p>
          </div>
        ) : (
          <>
            <Card className="mb-3">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center">
                  <Card.Title>
                    Total Expenses:
                    {new Intl.NumberFormat('en-PK', {
                      style: 'currency',
                      currency: 'PKR',
                    }).format(totalExpenses)}
                  </Card.Title>
                  <Card.Text>Total Records: {expenses.length}</Card.Text>
                </div>
              </Card.Body>
            </Card>
            {renderPagination()}

            <h2 className="my-5 mx-auto text-center ">
              Manage Expenses
            </h2>
            <Tabs defaultActiveKey="list" id="expense-tabs" className="mb-3">
              <Tab eventKey="list" title="Expenses">
                <ExpenseCard
                  expenses={paginatedExpenses}
                  onDeleteClick={handleDeleteClick}
                />
              </Tab>
              <Tab eventKey="analytics" title="Analytics">
                <Analytics expenses={expenses} />
              </Tab>
            </Tabs>
            {renderPagination()}
          </>
        )}

        {/* Floating Split Calculator */}
        <div
          style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            zIndex: '1000',
          }}
        >
          <Button
            variant="primary"
            size="lg"
            className="rounded-circle"
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
              Recalculate
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
                Amount: {selectedExpense.amount}
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
