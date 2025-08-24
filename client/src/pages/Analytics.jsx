import React, { useMemo } from "react";
import { Card, Row, Col, Button, Badge, ProgressBar } from "react-bootstrap";
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
  Filler,
} from "chart.js";
import {
  FaChartLine,
  FaMoneyBillWave,
  FaCalendarAlt,
  FaCreditCard,
  FaTags,
  FaArrowUp,
  FaDatabase,
} from "react-icons/fa";
import "../pages/styles/Anatytics.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  Title,
  Filler
);

const Analytics = ({
  expenses = [],
  totalRecordsAllTime = 0,
  totalAmountAllTime = 0,
}) => {
  const [timeRange, setTimeRange] = React.useState("monthly");

  const formatCurrency = (value) =>
    new Intl.NumberFormat("en-PK", {
      style: "currency",
      currency: "PKR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value || 0);

  const analyticsData = useMemo(() => {
    if (expenses.length === 0) {
      return {
        totalExpenses: 0,
        totalTransactions: 0,
        monthlyAverage: 0,
        totalMonths: 0,
        monthlyBreakdown: {},
        highestExpense: 0,
        lowestExpense: 0,
        averageExpensePerTransaction: 0,
        categoryTotals: {},
        paymentMethodTotals: {},
        mostExpensiveCategory: "",
        topExpenses: [],
      };
    }

    const monthlyBreakdown = expenses.reduce((acc, expense) => {
      const month = new Date(expense.date).toISOString().slice(0, 7);
      acc[month] = (acc[month] || 0) + expense.amount;
      return acc;
    }, {});

    const totalMonths = Object.keys(monthlyBreakdown).length;
    const totalExpenses = expenses.reduce(
      (sum, expense) => sum + expense.amount,
      0
    );
    const totalTransactions = expenses.length;
    const monthlyAverage = totalMonths > 0 ? totalExpenses / totalMonths : 0;
    const highestExpense = Math.max(...expenses.map((e) => e.amount));
    const lowestExpense = Math.min(...expenses.map((e) => e.amount));
    const averageExpensePerTransaction =
      totalTransactions > 0 ? totalExpenses / totalTransactions : 0;

    const categoryTotals = expenses.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
      return acc;
    }, {});

    const mostExpensiveCategory =
      Object.keys(categoryTotals).length > 0
        ? Object.keys(categoryTotals).reduce((a, b) =>
            categoryTotals[a] > categoryTotals[b] ? a : b
          )
        : "";

    const paymentMethodTotals = expenses.reduce((acc, expense) => {
      acc[expense.paymentMethod] =
        (acc[expense.paymentMethod] || 0) + expense.amount;
      return acc;
    }, {});

    const topExpenses = [...expenses]
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);

    return {
      totalExpenses,
      totalTransactions,
      monthlyAverage,
      totalMonths,
      monthlyBreakdown,
      highestExpense,
      lowestExpense,
      averageExpensePerTransaction,
      categoryTotals,
      paymentMethodTotals,
      mostExpensiveCategory,
      topExpenses,
    };
  }, [expenses]);

  const chartData = useMemo(() => {
    const { monthlyBreakdown, categoryTotals, paymentMethodTotals } =
      analyticsData;

    const monthlyTrendData = {
      labels: Object.keys(monthlyBreakdown).map((month) => {
        const date = new Date(month);
        return date.toLocaleDateString("en-US", {
          month: "short",
          year: "numeric",
        });
      }),
      datasets: [
        {
          label: "Monthly Expenses",
          data: Object.values(monthlyBreakdown),
          backgroundColor: "rgba(102, 126, 234, 0.7)",
          borderColor: "rgba(102, 126, 234, 1)",
          borderWidth: 2,
          borderRadius: 8,
          maxBarThickness: 40,
        },
      ],
    };

    const categoryColors = [
      "rgba(102, 126, 234, 0.8)",
      "rgba(255, 99, 132, 0.8)",
      "rgba(54, 162, 235, 0.8)",
      "rgba(255, 206, 86, 0.8)",
      "rgba(75, 192, 192, 0.8)",
      "rgba(153, 102, 255, 0.8)",
      "rgba(255, 159, 64, 0.8)",
      "rgba(199, 199, 199, 0.8)",
      "rgba(83, 102, 255, 0.8)",
      "rgba(40, 159, 64, 0.8)",
    ];

    const categoryData = {
      labels: Object.keys(categoryTotals),
      datasets: [
        {
          data: Object.values(categoryTotals),
          backgroundColor: categoryColors.slice(
            0,
            Object.keys(categoryTotals).length
          ),
          borderWidth: 2,
          borderColor: "#fff",
          hoverOffset: 12,
        },
      ],
    };

    const paymentData = {
      labels: Object.keys(paymentMethodTotals),
      datasets: [
        {
          data: Object.values(paymentMethodTotals),
          backgroundColor: [
            "rgba(102, 126, 234, 0.8)",
            "rgba(255, 99, 132, 0.8)",
            "rgba(54, 162, 235, 0.8)",
            "rgba(75, 192, 192, 0.8)",
            "rgba(153, 102, 255, 0.8)",
          ].slice(0, Object.keys(paymentMethodTotals).length),
          borderWidth: 2,
          borderColor: "#fff",
          hoverOffset: 12,
        },
      ],
    };

    return {
      monthlyTrendData,
      categoryData,
      paymentData,
    };
  }, [analyticsData]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          padding: 20,
          usePointStyle: true,
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        callbacks: {
          label: (context) =>
            `${context.label}: ${formatCurrency(context.raw)}`,
        },
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleFont: { size: 14 },
        bodyFont: { size: 13 },
        padding: 12,
        cornerRadius: 6,
        displayColors: true,
        boxPadding: 5,
      },
    },
  };

  const barChartOptions = {
    ...chartOptions,
    indexAxis: "x",
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: "rgba(0, 0, 0, 0.05)",
        },
        ticks: {
          callback: (value) => formatCurrency(value),
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
    plugins: {
      ...chartOptions.plugins,
      legend: {
        display: false,
      },
    },
  };

  return (
    <div className="analytics-container">
      {/* Header with controls */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">
            <FaChartLine className="me-2 text-primary" />
            Expense Analytics
          </h2>
          <p className="text-muted mb-0">
            {totalRecordsAllTime} total transactions •{" "}
            {formatCurrency(totalAmountAllTime)} total amount
          </p>
        </div>
        <Button
          variant="outline-primary"
          size="sm"
          onClick={() => window.location.reload()}
        >
          Refresh
        </Button>
      </div>

      {/* Summary Cards */}
      <Row className="g-3 mb-4">
        <Col md={3} sm={6}>
          <Card className="summary-card h-100 shadow-sm">
            <Card.Body className="text-center">
              <div className="summary-icon bg-primary">
                <FaMoneyBillWave />
              </div>
              <h5 className="text-muted mt-3">Total Expenses</h5>
              <h3 className="text-primary mb-2">
                {formatCurrency(totalAmountAllTime)}
              </h3>
              <small className="text-muted">
                {totalRecordsAllTime} transactions
              </small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} sm={6}>
          <Card className="summary-card h-100 shadow-sm">
            <Card.Body className="text-center">
              <div className="summary-icon bg-success">
                <FaCalendarAlt />
              </div>
              <h5 className="text-muted mt-3">Monthly Average</h5>
              <h3 className="text-success mb-2">
                {formatCurrency(analyticsData.monthlyAverage)}
              </h3>
              <small className="text-muted">
                {analyticsData.totalMonths} months
              </small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} sm={6}>
          <Card className="summary-card h-100 shadow-sm">
            <Card.Body className="text-center">
              <div className="summary-icon bg-warning">
                <FaArrowUp />
              </div>
              <h5 className="text-muted mt-3">Highest Expense</h5>
              <h3 className="text-warning mb-2">
                {formatCurrency(analyticsData.highestExpense)}
              </h3>
              <small className="text-muted">Single transaction</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} sm={6}>
          <Card className="summary-card h-100 shadow-sm">
            <Card.Body className="text-center">
              <div className="summary-icon bg-info">
                <FaCreditCard />
              </div>
              <h5 className="text-muted mt-3">Avg per Transaction</h5>
              <h3 className="text-info mb-2">
                {formatCurrency(analyticsData.averageExpensePerTransaction)}
              </h3>
              <small className="text-muted">Across all expenses</small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Charts Section */}
      <Row className="g-4">
        {/* Expense Trend Chart (Bar) */}
        <Col xl={8} lg={7}>
          <Card className="chart-card shadow-sm">
            <Card.Header className="d-flex justify-content-between align-items-center bg-white border-0 pt-3">
              <h5 className="mb-0">
                <FaChartLine className="me-2 text-primary" />
                Spending Trend
              </h5>
              <Button
                size="sm"
                variant="outline-primary"
                onClick={() =>
                  setTimeRange(
                    timeRange === "monthly" ? "quarterly" : "monthly"
                  )
                }
              >
                {timeRange === "monthly" ? "Quarterly View" : "Monthly View"}
              </Button>
            </Card.Header>
            <Card.Body className="pt-0">
              <div style={{ height: "300px" }}>
                <Bar
                  data={chartData.monthlyTrendData}
                  options={barChartOptions}
                />
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Category Distribution */}
        <Col xl={4} lg={5}>
          <Card className="chart-card shadow-sm">
            <Card.Header className="bg-white border-0 pt-3">
              <h5 className="mb-0">
                <FaTags className="me-2 text-primary" />
                Category Distribution
              </h5>
            </Card.Header>
            <Card.Body>
              <div style={{ height: "250px" }}>
                <Doughnut
                  data={chartData.categoryData}
                  options={chartOptions}
                />
              </div>
              {analyticsData.mostExpensiveCategory && (
                <div className="mt-3 p-3 bg-light rounded">
                  <h6 className="text-muted mb-2">Top Spending Category</h6>
                  <div className="d-flex align-items-center justify-content-between">
                    <Badge bg="primary" className="px-2 py-1">
                      {analyticsData.mostExpensiveCategory}
                    </Badge>
                    <span className="fw-bold">
                      {formatCurrency(
                        analyticsData.categoryTotals[
                          analyticsData.mostExpensiveCategory
                        ]
                      )}
                    </span>
                  </div>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Payment Methods */}
        <Col md={6}>
          <Card className="chart-card shadow-sm">
            <Card.Header className="bg-white border-0 pt-3">
              <h5 className="mb-0">
                <FaCreditCard className="me-2 text-primary" />
                Payment Methods
              </h5>
            </Card.Header>
            <Card.Body>
              <div style={{ height: "250px" }}>
                <Pie data={chartData.paymentData} options={chartOptions} />
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Top Expenses */}
        <Col md={6}>
          <Card className="chart-card shadow-sm">
            <Card.Header className="bg-white border-0 pt-3">
              <h5 className="mb-0">Top 5 Expenses</h5>
            </Card.Header>
            <Card.Body>
              <div className="top-expenses-list">
                {analyticsData.topExpenses.map((expense, index) => (
                  <div
                    key={expense._id || index}
                    className="expense-item mb-3 p-3 bg-light rounded"
                  >
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <span className="fw-medium text-truncate">
                        {expense.description || "No description"}
                      </span>
                      <span className="fw-bold text-primary">
                        {formatCurrency(expense.amount)}
                      </span>
                    </div>
                    <div className="d-flex justify-content-between align-items-center">
                      <Badge bg="secondary" className="text-truncate">
                        {expense.category}
                      </Badge>
                      <small className="text-muted">
                        {new Date(expense.date).toLocaleDateString()}
                      </small>
                    </div>
                    <ProgressBar
                      now={
                        (expense.amount / analyticsData.highestExpense) * 100
                      }
                      variant="primary"
                      className="mt-2"
                      style={{ height: "6px" }}
                    />
                  </div>
                ))}
                {analyticsData.topExpenses.length === 0 && (
                  <div className="text-center text-muted py-4">
                    <FaDatabase size={32} className="mb-2 opacity-50" />
                    <p>No expenses to display</p>
                  </div>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Analytics;
