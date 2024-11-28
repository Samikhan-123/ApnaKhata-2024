import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Spinner } from 'react-bootstrap';
import { Line, Pie, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import axios from 'axios';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend
);

const Analytics = ({ token }) => {
  const [totalExpensesData, setTotalExpensesData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch all data for analytics
  useEffect(() => {
    const fetchAllExpenses = async () => {
      try {
        const response = await axios.get('/api/expenses');
        setTotalExpensesData(response.data.expenses);
      } catch (error) {
        console.error('Error fetching all expenses:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllExpenses();
  }, [token]);

  if (loading) {
    return (
      <div className="text-center py-5 justify-content-center align-items-center min-vh-100 ">
        <Spinner animation="border" variant="primary" />
        <p>Loading analytics...</p>
      </div>
    );
  }

  // Helper to format currency
  const formatCurrency = (value) =>
    new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
    }).format(value);

  // Simplified Monthly Average Calculation
  const calculateMonthlyAverage = (expenses) => {
    if (expenses.length === 0) return { average: 0, totalMonths: 0 };

    const monthlyExpenses = expenses.reduce((acc, expense) => {
      const month = new Date(expense.date).toISOString().slice(0, 7); // Get "YYYY-MM" format
      acc[month] = (acc[month] || 0) + expense.amount;
      return acc;
    }, {});

    const totalMonths = Object.keys(monthlyExpenses).length;
    const totalExpenses = Object.values(monthlyExpenses).reduce(
      (sum, value) => sum + value,
      0
    );

    return { average: totalExpenses / totalMonths, totalMonths };
  };

  // Summary Metrics
  const totalExpenses = totalExpensesData.reduce(
    (sum, expense) => sum + expense.amount,
    0
  );

  const totalTransactions = totalExpensesData.length;

  const { average: monthlyAverage, totalMonths } =
    calculateMonthlyAverage(totalExpensesData);

  const highestExpense =
    totalExpensesData.length > 0
      ? Math.max(...totalExpensesData.map((e) => e.amount))
      : 0;

  const averageExpensePerTransaction =
    totalTransactions > 0 ? totalExpenses / totalTransactions : 0;

  const categoryTotals = totalExpensesData.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {});

  const mostExpensiveCategory = Object.keys(categoryTotals).reduce(
    (a, b) => (categoryTotals[a] > categoryTotals[b] ? a : b),
    ''
  );

  const paymentMethodTotals = totalExpensesData.reduce((acc, expense) => {
    acc[expense.paymentMethod] =
      (acc[expense.paymentMethod] || 0) + expense.amount;
    return acc;
  }, {});

  // Chart: Expenses Trend (Line Chart)
  const trendData = {
    labels: totalExpensesData.map((expense) =>
      new Date(expense.date).toLocaleDateString('en-GB')
    ),
    datasets: [
      {
        label: 'Expenses Trend',
        data: totalExpensesData.map((expense) => expense.amount),
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        fill: false,
        tension: 0.4,
      },
    ],
  };

  // Chart: Category Distribution (Pie Chart)
  const categoryData = {
    labels: Object.keys(categoryTotals),
    datasets: [
      {
        data: Object.values(categoryTotals),
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)',
        ],
      },
    ],
  };

  // Chart: Payment Method Distribution (Doughnut Chart)
  const paymentData = {
    labels: Object.keys(paymentMethodTotals),
    datasets: [
      {
        data: Object.values(paymentMethodTotals),
        backgroundColor: [
          'rgba(75, 192, 192, 0.6)',
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
        ],
      },
    ],
  };

  // Chart options for consistent styling
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
      },
      tooltip: {
        callbacks: {
          label: (context) =>
            `${context.label}: ${formatCurrency(context.raw)}`,
        },
      },
    },
  };
  

  return (
    <Row className="g-4">
      {/* Summary Cards */}
      <Col md={3}>
        <Card className="h-100">
          <Card.Body>
            <h6 className="text-muted">Total Expenses</h6>
            <h4 className="mb-0">{formatCurrency(totalExpenses)}</h4>
          </Card.Body>
        </Card>
      </Col>
      <Col md={3}>
        <Card className="h-100">
          <Card.Body>
            <h6 className="text-muted">Monthly Average</h6>
            <h4 className="mb-0">{formatCurrency(monthlyAverage)}</h4>
            <small className="text-muted">
              {totalMonths} month(s) included
            </small>
          </Card.Body>
        </Card>
      </Col>
      <Col md={3}>
        <Card className="h-100">
          <Card.Body>
            <h6 className="text-muted">Highest Expense</h6>
            <h4 className="mb-0">{formatCurrency(highestExpense)}</h4>
          </Card.Body>
        </Card>
      </Col>
      <Col md={3}>
        <Card className="h-100">
          <Card.Body>
            <h6 className="text-muted">Total Transactions</h6>
            <h4 className="mb-0">{totalTransactions}</h4>
            <small className="text-muted">
              Avg per transaction:
              {formatCurrency(averageExpensePerTransaction)}
            </small>
          </Card.Body>
        </Card>
      </Col>
      <Col md={3}>
        <Card className="h-100">
          <Card.Body>
            <h6 className="text-muted">Most Expensive Category</h6>
            <h4 className="mb-0">{mostExpensiveCategory} : {formatCurrency(categoryTotals[mostExpensiveCategory])}</h4>
          </Card.Body>
        </Card>
      </Col>

      {/* Charts Section */}
      <Col md={9}>
        <Card className="h-100">
          <Card.Body>
            <h5>Expenses Trend</h5>
            <div style={{ height: '300px' }}>
              <Line data={trendData} options={chartOptions} />
            </div>
          </Card.Body>
        </Card>
      </Col>
      <Col md={6}>
        <Card className="h-100">
          <Card.Body>
            <h5>Category Distribution</h5>
            <div style={{ height: '300px' }}>
              <Pie data={categoryData} options={chartOptions} />
            </div>
          </Card.Body>
        </Card>
      </Col>
      <Col md={6}>
        <Card className="h-100">
          <Card.Body>
            <h5>Payment Methods</h5>
            <div style={{ height: '300px' }}>
              <Doughnut data={paymentData} options={chartOptions} />
            </div>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

export default Analytics;
