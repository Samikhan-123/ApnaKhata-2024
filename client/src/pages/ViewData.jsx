import React, { useEffect, useState, useCallback } from 'react';
import {
  Container,
  Row,
  Col,
  Button,
  Alert,
  Spinner,
  Card,
  Tabs,
  Tab,
 
} from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import axios from 'axios';
import { FaFilter, FaPlus, FaSync } from 'react-icons/fa';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import Layout from '../components/Layout';
import ExpenseCard from '../pages/ExpenseTable';
import Filters from '../pages/Filters';
import Analytics from '../pages/Analytics';
import { toast } from 'react-toastify'; // Import toast from react-toastify

const ViewData = () => {
  const navigate = useNavigate();
  const { token } = useAuth();

  // States
  const [expenses, setExpenses] = useState([]);
  const [allExpenses, setAllExpenses] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showFilters, setShowFilters] = useState(false);

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
  const fetchExpensesData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const queryParams = new URLSearchParams();
      queryParams.append('page', pagination.currentPage);
      queryParams.append('itemsPerPage', pagination.itemsPerPage);

      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== 'all') {
          if (key === 'tags') {
            queryParams.append('tags', value.trim());
          } else {
            queryParams.append(key, value);
          }
        }
      });

      const [expensesResponse, allExpensesResponse] = await Promise.all([
        axios.get(`/api/expenses?${queryParams.toString()}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get('/api/expenses/all', {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

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
      setExpenses([]);
      setAllExpenses([]);
      toast.error('Failed to fetch expenses'); // Display toast error message
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.currentPage, pagination.itemsPerPage, token]);

  useEffect(() => {
    fetchExpensesData();
  }, [fetchExpensesData]);

  // Handlers
  const handleFilterChange = useCallback((updatedFilters) => {
    setFilters(updatedFilters);
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  }, []);

  const handlePageChange = useCallback((newPage) => {
    setPagination((prev) => ({ ...prev, currentPage: newPage }));
  }, []);

  const handleDeleteSuccess = useCallback((deletedId) => {
    // Optimistically update both expenses lists
    setExpenses((prev) => prev.filter((exp) => exp._id !== deletedId));
    setAllExpenses((prev) => prev.filter((exp) => exp._id !== deletedId));
    toast.success('Expense deleted successfully!'); // Display toast success message

    // Recalculate total amount
    setAllExpenses((prev) => {
      const newTotal = prev.reduce((sum, exp) => sum + (exp.amount || 0), 0);
      setTotalAmount(newTotal);
      return prev;
    });
  }, []);

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

        {/* Summary Card */}
        <Card className="mb-4">
          <Card.Body>
            <div className="table-responsive">
              <table className="table table-bordered table-striped table-hover">
                <thead>
                  <tr>
                    <th scope="col">Category</th>
                    <th scope="col">Value</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Total Expenses (All Time)</td>
                    <td>{new Intl.NumberFormat('en-PK', {
                      style: 'currency',
                      currency: 'PKR',
                    }).format(totalAmount)}</td>
                  </tr>
                  <tr>
                    <td>Total Records (All Time)</td>
                    <td>{allExpenses.length}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Card.Body>
        </Card>

        {/* Content Tabs */}
        <Tabs defaultActiveKey="list" id="expense-tabs" className="mb-4">
          <Tab eventKey="list" title="Expenses">
            <ExpenseCard
              expenses={expenses}
              pagination={pagination}
              onPageChange={handlePageChange}
              onDeleteSuccess={handleDeleteSuccess}
              token={token} // Pass token directly to avoid context call
            />
          </Tab>
          <Tab eventKey="analytics" title="Analytics">
            <Analytics expenses={allExpenses} />
          </Tab>
        </Tabs>
      </Container>

    </Layout>
  );
};

export default ViewData;
