import React, { useEffect, useState, useCallback } from "react";
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
  Pagination,
  Badge,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import axios from "axios";
import {
  FaFilter,
  FaPlus,
  FaSync,
  FaChartLine,
  FaCalculator,
  FaTimes,
  FaTasks,
} from "react-icons/fa";
import Layout from "../components/Layout";
import ExpenseCard from "../pages/ExpenseCard";
import Filters from "../pages/Filters";
import Analytics from "../pages/Analytics";
import "../pages/styles/ViewData.css";
import SplitCalculator from "./SplitCalculator";
import TaskManager from "./TaskManagement";

const ITEMS_PER_PAGE = 12;

const ViewData = () => {
  const navigate = useNavigate();
  const { token } = useAuth();

  // State management
  const [expenses, setExpenses] = useState([]);
  const [totalRecordsAllTime, setTotalRecordsAllTime] = useState(0);
  const [totalAmountAllTime, setTotalAmountAllTime] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filterLoading, setFilterLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showFilters, setShowFilters] = useState(true);

  // Pagination state
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    itemsPerPage: ITEMS_PER_PAGE,
    totalRecords: 0, // This will now be filtered records count
  });

  // Filters state
  const [filters, setFilters] = useState({
    category: "all",
    startDate: "",
    endDate: "",
    searchTerm: "",
    paymentMethod: "all",
    minAmount: "",
    maxAmount: "",
    tags: "",
  });

  // Fetch expenses with optional filters
  const fetchExpenses = useCallback(
    async (page = 1, limit = ITEMS_PER_PAGE, filterParams = filters) => {
      try {
        setLoading(true);
        setError("");

        // Prepare params for API call
        const params = {
          page,
          limit,
        };

        // Add filters to params if they're not default values
        if (filterParams.category !== "all") {
          params.category = filterParams.category;
        }

        if (filterParams.paymentMethod !== "all") {
          params.paymentMethod = filterParams.paymentMethod;
        }

        params.startDate = filterParams.startDate ? filterParams.startDate : undefined;
        params.endDate = filterParams.endDate ? filterParams.endDate : undefined;

        if (filterParams.searchTerm) {
          params.searchTerm = filterParams.searchTerm;
        }

        if (filterParams.minAmount) {
          params.minAmount = filterParams.minAmount;
        }

        if (filterParams.maxAmount) {
          params.maxAmount = filterParams.maxAmount;
        }

        if (filterParams.tags) {
          params.tags = filterParams.tags;
        }

        const response = await axios.get("/api/expenses", {
          headers: { Authorization: `Bearer ${token}` },
          params,
        });
        console.log("data",response.data)

        const expensesData = response.data?.expenses || [];
        const totalRecords = response.data?.totalRecords || 0; // All-time total records
        const totalAmount = response.data?.totalAmount || 0; // All-time total amount
        const filteredTotalRecords = response.data?.filteredTotalRecords || 0; // Filtered records count
        const filteredTotalAmount = response.data?.filteredTotalAmount || 0; // Filtered total amount
        const totalPages = Math.ceil(filteredTotalRecords / limit);
   

        setExpenses(expensesData);
        setPagination({
          currentPage: page,
          totalPages,
          itemsPerPage: limit,
          totalRecords: filteredTotalRecords, // This is now filtered records count
        });

        // Set all-time totals (unchanged by filters)
        setTotalRecordsAllTime(totalRecords);
        setTotalAmountAllTime(totalAmount);
      } catch (err) {
        // console.error("Error fetching expenses:", err);
        setError(err.response?.data?.message || "Failed to fetch expenses");
      } finally {
        setLoading(false);
      }
    },
    [token, filters]
  );

  useEffect(() => {
    fetchExpenses(1, ITEMS_PER_PAGE, filters);
  }, [fetchExpenses]);

  // Handle filter changes
  const handleFilterChange = useCallback(
    (updatedFilters) => {
      setFilterLoading(true);
      setFilters(updatedFilters);

      // Reset to first page when filters change
      fetchExpenses(1, ITEMS_PER_PAGE, updatedFilters).then(() => {
        setFilterLoading(false);
      });
    },
    [fetchExpenses]
  );

  const handlePageChange = useCallback(
    (newPage) => {
      fetchExpenses(newPage, ITEMS_PER_PAGE, filters);
    },
    [fetchExpenses, filters]
  );

  const handleDeleteSuccess = useCallback(
    (deletedId) => {
      // Update expense list
      setExpenses((prev) => prev.filter((exp) => exp._id !== deletedId));

      // Update total records and amount (all time)
      setTotalRecordsAllTime((prev) => prev - 1);
      const deletedAmount =
        expenses.find((exp) => exp._id === deletedId)?.amount || 0;
      setTotalAmountAllTime((prev) => prev - deletedAmount);

      // Update pagination (filtered records)
      setPagination((prev) => ({
        ...prev,
        totalRecords: prev.totalRecords - 1,
      }));

      // If we're on a page that might now be empty, go back one page
      // if (expenses.length === 1 && pagination.currentPage > 1) {
      //   fetchExpenses(pagination.currentPage - 1, ITEMS_PER_PAGE, filters);
      // } else {
      //   // Otherwise, refresh the current page
      //   fetchExpenses(pagination.currentPage, ITEMS_PER_PAGE, filters);
      // }

    },
    [expenses, pagination.currentPage, fetchExpenses, filters]
  );

  // Check if any filters are active
  const hasActiveFilters = () => {
    return (
      filters.category !== "all" ||
      filters.paymentMethod !== "all" ||
      filters.startDate ||
      filters.endDate ||
      filters.searchTerm ||
      filters.minAmount ||
      filters.maxAmount ||
      filters.tags
    );
  };

  if (loading) {
    return (
      <Layout>
        <div className="text-center py-5 d-flex flex-column align-items-center min-vh-100">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2">Loading expenses...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Container fluid className="py-4 view-data-container">
        {/* Header Section */}
        <Row className="mb-4 align-items-center">
          <Col>
            <h1 className="page-title">Expense Manager</h1>
            <p className="text-muted">
              Track and analyze your spending patterns
            </p>
          </Col>
          <Col xs="auto">
            <div className="d-flex gap-2">
              <Button
                variant={showFilters ? "dark" : "outline-dark"}
                onClick={() => setShowFilters(!showFilters)}
                className="d-flex align-items-center"
              >
                <FaFilter className="me-2" />
                {showFilters ? "Hide Filters" : "Show Filters"}
              </Button>
              <Button
                variant="secondary"
                onClick={() => navigate("/create")}
                className="d-flex align-items-center"
              >
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
                loading={filterLoading}
                expenses={expenses}
              />
            </Col>
          </Row>
        )}
        {hasActiveFilters() && (
          <Row className="mb-4">
            <Col className="d-flex justify-content-end">
              <Button
                variant="outline-secondary"
                onClick={() => {
                  // Reset filters to default values
                  const defaultFilters = {
                    category: "all",
                    startDate: "",
                    endDate: "",
                    searchTerm: "",
                    paymentMethod: "all",
                    minAmount: "",
                    maxAmount: "",
                    tags: "",
                  };
                  handleFilterChange(defaultFilters);
                }}
                className="d-flex align-items-center"
              >
                <FaTimes className="me-2" />
                Reset Filters
              </Button>
            </Col>
          </Row>
        )}

        {/* Alerts */ }
        {error && (
          <Alert
            variant="danger"
            onClose={() => setError("")}
            dismissible
            className="mb-4"
          >
            <div className="d-flex align-items-center justify-content-between">
              <span>{error}</span>
              <Button
                variant="outline-danger"
                size="sm"
                onClick={() =>
                  fetchExpenses(pagination.currentPage, ITEMS_PER_PAGE, filters)
                }
                className="ms-3"
              >
                <FaSync className="me-2" />
                Retry
              </Button>
            </div>
          </Alert>
        )}

        {success && (
          <Alert
            variant="success"
            onClose={() => setSuccess("")}
            dismissible
            className="mb-4"
          >
            {success}
          </Alert>
        )}

        {/* Summary Cards */}
        <Row className="mb-4">
          <Col md={6} lg={3} className="mb-3">
            <Card className="summary-card h-100">
              <Card.Body className="text-center">
                <h6 className="text-muted">Total Expenses (All Time)</h6>
                <h3 className="text-primary mb-0">
                  {new Intl.NumberFormat("en-PK", {
                    style: "currency",
                    currency: "PKR",
                  }).format(totalAmountAllTime)}
                </h3>
                <small className="text-muted total-records-text">
                  {totalRecordsAllTime} total records
                </small>
              </Card.Body>
            </Card>
          </Col>
          <Col md={6} lg={3} className="mb-3">
            <Card className="summary-card h-100">
              <Card.Body className="text-center">
                <h6 className="text-muted">Filtered Amount</h6>
                <h3 className="text-success mb-0">
                  {hasActiveFilters()
                    ? new Intl.NumberFormat("en-PK", {
                        style: "currency",
                        currency: "PKR",
                      }).format(
                        pagination.totalRecords > 0
                          ? expenses.reduce(
                              (sum, exp) => sum + (exp.amount || 0),
                              0
                            )
                          : 0
                      )
                    : "-"}
                </h3>
                <small className="text-muted">
                  {hasActiveFilters()
                    ? `${pagination.totalRecords} matching records`
                    : "No filters applied"}
                </small>
              </Card.Body>
            </Card>
          </Col>
          {/* <Col md={6} lg={3} className="mb-3">
            <Card className="summary-card h-100">
              <Card.Body className="text-center">
                <h6 className="text-muted">Total Records (All Time)</h6>
                <h3 className="text-info mb-0">{totalRecordsAllTime}</h3>
                <small className="text-muted">
                  All expenses in your account
                </small>
              </Card.Body>
            </Card>
          </Col> */}
          {/* <Col md={6} lg={3} className="mb-3">
            <Card className="summary-card h-100">
              <Card.Body className="text-center">
                <h6 className="text-muted">Filtered Records</h6>
                <h3 className="text-warning mb-0">
                  {hasActiveFilters() ? pagination.totalRecords : "-"}
                </h3>
                <small className="text-muted">
                  {hasActiveFilters()
                    ? "Matching current filters"
                    : "Apply filters to see results"}
                </small>
              </Card.Body>
            </Card>
          </Col> */}
        </Row>

        {/* Content Tabs */}
        <Tabs
          defaultActiveKey="list"
          id="expense-tabs"
          className="mb-4 custom-tabs"
        >
          <Tab
            eventKey="list"
            title={
              <span className="d-flex align-items-center text-dark">
                <FaFilter className="me-1" /> Expenses List
                {pagination.totalRecords > 0 && (
                  <Badge bg="primary" className="ms-2">
                    {pagination.totalRecords}
                  </Badge>
                )}
              </span>
            }
          >
            {filterLoading ? (
              <div className="text-center py-4">
                <Spinner animation="border" variant="primary" />
                <p className="mt-2">Applying filters...</p>
              </div>
            ) : (
              <>
                <ExpenseCard
                  expenses={expenses}
                  pagination={pagination}
                  onPageChange={handlePageChange}
                  onDeleteSuccess={handleDeleteSuccess}
                  token={token}
                />
                {pagination.totalPages > 1 && (
                  <div className="d-flex justify-content-center mt-4">
                    <Pagination>
                      <Pagination.First
                        disabled={pagination.currentPage === 1}
                        onClick={() => handlePageChange(1)}
                      />
                      <Pagination.Prev
                        disabled={pagination.currentPage === 1}
                        onClick={() =>
                          handlePageChange(pagination.currentPage - 1)
                        }
                      />
                      {Array.from(
                        { length: pagination.totalPages },
                        (_, i) => i + 1
                      )
                        .filter(
                          (page) =>
                            page === 1 ||
                            page === pagination.totalPages ||
                            Math.abs(page - pagination.currentPage) <= 2
                        )
                        .map((page, index, array) => {
                          const showEllipsis =
                            index > 0 && page - array[index - 1] > 1;
                          return (
                            <React.Fragment key={page}>
                              {showEllipsis && <Pagination.Ellipsis />}
                              <Pagination.Item
                                active={page === pagination.currentPage}
                                onClick={() => handlePageChange(page)}
                              >
                                {page}
                              </Pagination.Item>
                            </React.Fragment>
                          );
                        })}
                      <Pagination.Next
                        disabled={
                          pagination.currentPage === pagination.totalPages
                        }
                        onClick={() =>
                          handlePageChange(pagination.currentPage + 1)
                        }
                      />
                      <Pagination.Last
                        disabled={
                          pagination.currentPage === pagination.totalPages
                        }
                        onClick={() => handlePageChange(pagination.totalPages)}
                      />
                    </Pagination>
                  </div>
                )}
              </>
            )}
          </Tab>
          <Tab
            className="analytics-tab"
            eventKey="analytics"
            title={
              <span className="d-flex align-items-center text-dark">
                <FaChartLine className="me-1 " /> Analytics
              </span>
            }
          >
            <Analytics
              expenses={expenses}
              totalRecordsAllTime={totalRecordsAllTime}
              totalAmountAllTime={totalAmountAllTime}
            />
          </Tab>
          <Tab
            className="task-manager-tab"
            eventKey="task-manager"
            title={
              <span className="d-flex align-items-center text-dark">
                <FaTasks className="me-1" /> Task Manager
              </span>
            }
          >
            <TaskManager />
          </Tab>

          <Tab
            eventKey="split-calculator"
            title={
              <span className="d-flex align-items-center text-dark">
                <FaCalculator className="me-1" /> Split Calculator
              </span>
            }
          >
            <SplitCalculator />
          </Tab>
        </Tabs>
      </Container>
    </Layout>
  );
};

export default ViewData;

