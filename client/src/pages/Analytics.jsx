import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Badge,
  Spinner,
  Alert,
  ProgressBar,
  Table,
} from "react-bootstrap";
import { Bar, Pie, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  Title,
} from "chart.js";
import {
  FaChartLine,
  FaMoneyBillWave,
  FaCalendarAlt,
  FaCreditCard,
  FaSync,
  FaArrowUp,
  FaArrowDown,
  FaCrown,
} from "react-icons/fa";
import axios from "axios";
import "../pages/styles/Analytics.css";
import { useAuth } from "../auth/AuthContext";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  Title
);

const Analytics = () => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { token } = useAuth();
  const api = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(`${api}/expenses/analytics`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setAnalyticsData(response.data.analyticsData);
      } else {
        setError(response.data.message || "Failed to fetch analytics data");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Error loading analytics");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) =>
    new Intl.NumberFormat("en-PK", {
      style: "currency",
      currency: "PKR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value || 0);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-PK", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatMonthYear = (monthString) => {
    const [year, month] = monthString.split("-");
    return new Date(year, month - 1).toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  };

  const refreshData = () => {
    fetchAnalyticsData();
  };

  if (loading) {
    return (
      <Container className="analytics-container">
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3">Loading analytics data...</p>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="analytics-container">
        <Alert variant="danger" className="text-center">
          <p>{error}</p>
          <Button variant="primary" onClick={refreshData}>
            <FaSync className="me-2" />
            Try Again
          </Button>
        </Alert>
      </Container>
    );
  }

  if (!analyticsData || analyticsData.totalTransactions === 0) {
    return (
      <Container className="analytics-container">
        <div className="text-center py-5">
          <div className="analytics-empty">
            <FaChartLine size={48} className="text-muted mb-3" />
            <h4>No Analytics Data</h4>
            <p className="text-muted">
              No expenses found. Start adding expenses to see analytics.
            </p>
            <Button variant="primary" onClick={refreshData}>
              Refresh Data
            </Button>
          </div>
        </div>
      </Container>
    );
  }

  // Prepare chart data
  const monthlyTrendData = {
    labels: Object.keys(analyticsData.monthlyBreakdown).map((month) =>
      formatMonthYear(month)
    ),
    datasets: [
      {
        label: "Monthly Spending",
        data: Object.values(analyticsData.monthlyBreakdown),
        backgroundColor: "rgba(102, 126, 234, 0.8)",
        borderColor: "rgba(102, 126, 234, 1)",
        borderWidth: 2,
        borderRadius: 8,
      },
    ],
  };

  const categoryData = {
    labels: Object.keys(analyticsData.categoryDistribution),
    datasets: [
      {
        data: Object.values(analyticsData.categoryDistribution),
        backgroundColor: [
          "rgba(102, 126, 234, 0.8)",
          "rgba(255, 99, 132, 0.8)",
          "rgba(54, 162, 235, 0.8)",
          "rgba(255, 206, 86, 0.8)",
          "rgba(75, 192, 192, 0.8)",
          "rgba(153, 102, 255, 0.8)",
        ],
        borderWidth: 2,
        borderColor: "#fff",
      },
    ],
  };

  const paymentMethodData = {
    labels: Object.keys(analyticsData.paymentMethods),
    datasets: [
      {
        data: Object.values(analyticsData.paymentMethods),
        backgroundColor: [
          "rgba(102, 126, 234, 0.8)",
          "rgba(255, 99, 132, 0.8)",
          "rgba(54, 162, 235, 0.8)",
          "rgba(255, 206, 86, 0.8)",
        ],
        borderWidth: 2,
        borderColor: "#fff",
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          padding: 20,
          usePointStyle: true,
        },
      },
      tooltip: {
        callbacks: {
          label: (context) =>
            `${context.label}: ${formatCurrency(context.raw)}`,
        },
      },
    },
  };

  const barChartOptions = {
    ...chartOptions,
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: "rgba(0, 0, 0, 0.05)" },
        ticks: {
          callback: (value) => formatCurrency(value),
        },
      },
      x: {
        grid: { display: false },
        ticks: {
          maxRotation: 45,
          minRotation: 45,
        },
      },
    },
  };

  return (
    <Container fluid className="analytics-container">
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <div className="analytics-header">
            <div className="d-flex justify-content-between align-items-center flex-wrap">
              <div>
                <h1>
                  <FaChartLine className="me-2" />
                  Expense Analytics
                </h1>
                <p className="text-muted">
                  {analyticsData.totalTransactions} transactions •{" "}
                  {formatCurrency(analyticsData.totalExpenses)} total
                </p>
              </div>
              <Button variant="outline-primary" onClick={refreshData}>
                <FaSync /> Refresh
              </Button>
            </div>
          </div>
        </Col>
      </Row>

      {/* Summary Cards */}
      <Row className="g-4 mb-4">
        <Col md={3} sm={6}>
          <Card className="analytics-card">
            <Card.Body className="text-center">
              <div className="card-icon total-expenses">
                <FaMoneyBillWave />
              </div>
              <h3>{formatCurrency(analyticsData.totalExpenses)}</h3>
              <p className="text-muted">Total Expenses</p>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3} sm={6}>
          <Card className="analytics-card">
            <Card.Body className="text-center">
              <div className="card-icon monthly-avg">
                <FaCalendarAlt />
              </div>
              <h3>{formatCurrency(analyticsData.monthlyAverage)}</h3>
              <p className="text-muted">Monthly Average</p>
              <small>{analyticsData.totalMonths} months</small>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3} sm={6}>
          <Card className="analytics-card">
            <Card.Body className="text-center">
              <div className="card-icon avg-transaction">
                <FaCreditCard />
              </div>
              <h3>{formatCurrency(analyticsData.averagePerTransaction)}</h3>
              <p className="text-muted">Avg per Transaction</p>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3} sm={6}>
          <Card className="analytics-card">
            <Card.Body className="text-center">
              <div className="card-icon highest-expense">
                <FaArrowUp />
              </div>
              <h3>{formatCurrency(analyticsData.highestExpense.amount)}</h3>
              <p className="text-muted">
                Highest Expense{" "}
                <Badge bg="secondary">
                  {analyticsData.highestExpense.category}
                </Badge>
              </p>
              <small>{formatDate(analyticsData.highestExpense.date)}</small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Lowest Expense Card (if exists) */}
      {analyticsData.lowestExpense.amount > 0 &&
        analyticsData.lowestExpense.amount < Infinity && (
          <Row className="mb-4">
            <Col md={6} className="mx-auto">
              <Card className="analytics-card">
                <Card.Body className="text-center">
                  <div className="card-icon lowest-expense">
                    <FaArrowDown />
                  </div>
                  <h3>{formatCurrency(analyticsData.lowestExpense.amount)}</h3>
                  <p className="text-muted">
                    Lowest Expense{" "}
                    <Badge bg="secondary">
                      {analyticsData.lowestExpense.category}
                    </Badge>
                  </p>
                  <small>{formatDate(analyticsData.lowestExpense.date)}</small>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        )}

      {/* Charts Section */}
      <Row className="g-4">
        {/* Spending Trend */}
        <Col xl={8} lg={7}>
          <Card className="chart-card">
            <Card.Header>
              <h5>Monthly Spending Trend</h5>
            </Card.Header>
            <Card.Body>
              <div className="chart-container">
                <Bar data={monthlyTrendData} options={barChartOptions} />
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Category Distribution */}
        <Col xl={4} lg={5}>
          <Card className="chart-card">
            <Card.Header>
              <h5>Category Distribution</h5>
            </Card.Header>
            <Card.Body>
              <div className="chart-container">
                <Doughnut data={categoryData} options={chartOptions} />
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Payment Methods */}
        <Col lg={6}>
          <Card className="chart-card">
            <Card.Header>
              <h5>Payment Methods</h5>
            </Card.Header>
            <Card.Body>
              <div className="chart-container">
                <Pie data={paymentMethodData} options={chartOptions} />
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Top Expenses */}
        <Col lg={6}>
          <Card className="chart-card">
            <Card.Header>
              <h5>Top 3 Highest Expenses</h5>
            </Card.Header>
            <Card.Body>
              <div className="top-expenses">
                {analyticsData.topExpenses.map((expense, index) => (
                  <div key={index} className="expense-item">
                    <div className="expense-rank">
                      <FaCrown
                        className={
                          index === 0 ? "text-warning" : "text-secondary"
                        }
                      />
                      <span>#{index + 1}</span>
                    </div>
                    <div className="expense-details">
                      <h6>{expense.description || "No description"}</h6>
                      <div className="expense-meta">
                        <Badge bg="secondary">{expense.category}</Badge>
                        <span>{formatDate(expense.date)}</span>
                      </div>
                    </div>
                    <div className="expense-amount-analytics">
                      {formatCurrency(expense.amount)}
                    </div>
                  </div>
                ))}
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Monthly Breakdown Table */}
        <Col lg={12}>
          <Card className="chart-card">
            <Card.Header>
              <h5>Monthly Breakdown</h5>
            </Card.Header>
            <Card.Body>
              <div className="table-responsive">
                <Table striped bordered hover>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Year</th>
                      <th>Month</th>
                      <th>Amount</th>
                      <th>Percentage of Total</th>
                      <th>Progress</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(analyticsData.monthlyBreakdown).map(
                      ([month, amount], index) => {
                        const date = new Date(month);
                        const year = date.getFullYear();
                        const monthLabel = new Intl.DateTimeFormat("en-US", {
                          month: "long",
                        }).format(date);
                        return (
                          <tr key={month}>
                            <td>{index + 1}</td>
                            <td>{year}</td>
                            <td>{monthLabel}</td>
                            <td>{formatCurrency(amount)}</td>
                            <td>
                              {analyticsData.totalExpenses > 0
                                ? `${Math.round(
                                    (amount / analyticsData.totalExpenses) * 100
                                  )}%`
                                : "0%"}
                            </td>
                            <td>
                              <ProgressBar
                                now={
                                  analyticsData.totalExpenses > 0
                                    ? (amount / analyticsData.totalExpenses) *
                                      100
                                    : 0
                                }
                                variant="success"
                                style={{ height: "20px" }}
                                label={`${Math.round(
                                  (amount / analyticsData.totalExpenses) * 100
                                )}%`}
                              />
                            </td>
                          </tr>
                        );
                      }
                    )}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Analytics;
