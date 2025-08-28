import { NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Container,
  Row,
  Col,
  Card,
  Badge,
} from "react-bootstrap";
import {
  FaRegListAlt,
  FaChartLine,
  FaMoneyBillWave,
  FaMobileAlt,
  FaShieldAlt,
  FaSync,
  FaRocket,
  FaUsers,
  FaAward,
  FaGooglePlay,
  FaAppStore,
} from "react-icons/fa";
import Layout from "../components/Layout";
import "../pages/styles/Home.css"; // We'll create this for additional styling

function Home() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
    const userToken = localStorage.getItem("token");
    if (userToken) {
      setIsLoggedIn(true);
    }
  }, []);

  const handleGetStarted = () => {
    if (isLoggedIn) {
      navigate("/expenses");
    } else {
      navigate("/register");
    }
  };

  // const handleViewDemo = () => {
  //   navigate("/demo");
  // };

  const features = [
    {
      icon: <FaMoneyBillWave size={40} />,
      title: "Expense Tracking",
      description:
        "Track your daily expenses with detailed categories and tags",
      color: "primary",
    },
    {
      icon: <FaChartLine size={40} />,
      title: "Advanced Analytics",
      description:
        "Visualize your spending patterns with interactive charts and reports",
      color: "success",
    },
    {
      icon: <FaMobileAlt size={40} />,
      title: "Mobile Friendly",
      description: "Access your expenses from any device, anywhere, anytime",
      color: "info",
    },
    {
      icon: <FaShieldAlt size={40} />,
      title: "Secure & Private",
      description:
        "Your financial data is encrypted and protected with top-level security",
      color: "warning",
    },
    {
      icon: <FaSync size={40} />,
      title: "Auto Sync",
      description: "Automatic synchronization across all your devices",
      color: "danger",
    },
    {
      icon: <FaRocket size={40} />,
      title: "Fast & Reliable",
      description: "Lightning-fast performance with 99.9% uptime guarantee",
      color: "secondary",
    },
  ];

  const stats = [
    { number: "10,000+", label: "Active Users" },
    { number: "₨2.5M+", label: "Expenses Tracked" },
    { number: "4.8/5", label: "User Rating" },
    { number: "24/7", label: "Support" },
  ];

  return (
    <Layout title="ApnaKhata - Smart Expense Tracker & Financial Manager">
      {/* Hero Section */}
      <section className="hero-section">
        {/* <div className="hero-background">
          <div className="hero-overlay"></div>
        </div> */}
        <Container>
          <Row className="min-vh-100 align-items-center">
            <Col lg={8} className="mx-auto text-center text-white">
              <Badge bg="light" text="dark" className="mb-3 px-3 py-2">
                <FaAward className="me-2" /> Most Trusted Expense Tracker
              </Badge>

              <h1 className="display-3 fw-bold mb-4">
                Take Control of Your
                <span className="text-gradient"> Financial Future</span>
              </h1>

              <p className="lead mb-5 fs-4">
                Track expenses, analyze spending, and achieve your financial goals
                with ease.
              </p>

              {showAlert && (
                <Alert
                  variant="warning"
                  dismissible
                  onClose={() => setShowAlert(false)}
                  className="mb-4"
                >
                  Please
                  <NavLink to="/login" className="alert-link">
                    login
                  </NavLink>
                  to access your expense dashboard.
                </Alert>
              )}

              <div className="hero-buttons d-flex flex-wrap gap-3 justify-content-center">
                <Button
                  style={{
                    backgroundColor: "var(--submit-btn-color)",
                    border: "none",
                  }}
                  size="lg"
                  className="btn-dashboard  px-4 py-3 fw-semibold shadow-lg"
                  onClick={handleGetStarted}
                >
                  <FaRocket className="me-2" />
                  {isLoggedIn ? "Go to Dashboard" : "Get Started Free"}
                </Button>

                {/* <Button
                  variant="outline-light"
                  size="lg"
                  className="px-4 py-3 fw-semibold"
                  onClick={handleViewDemo}
                >
                  <FaRegListAlt className="me-2" />
                  View Live Demo
                </Button> */}
              </div>

              <div className="mt-5">
                <div className="d-flex flex-wrap justify-content-center gap-4 mb-4">
                  {stats.map((stat, index) => (
                    <div key={index} className="text-center">
                      <h3 className="fw-bold text-warning mb-1">
                        {stat.number}
                      </h3>
                      <small className="text-light opacity-75">
                        {stat.label}
                      </small>
                    </div>
                  ))}
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Features Section */}
      <section className="py-5 bg-light">
        <Container>
          <Row className="text-center mb-5">
            <Col lg={8} className="mx-auto">
              <Badge bg="primary" className="mb-3 px-3 py-2">
                Why Choose Us
              </Badge>
              <h2 className="display-5 fw-bold mb-4">
                Powerful Features for Smart Money Management
              </h2>
              <p className="lead text-muted">
                Everything you need to take control of your finances in one
                beautiful platform
              </p>
            </Col>
          </Row>

          <Row className="g-4">
            {features.map((feature, index) => (
              <Col lg={4} md={6} key={index}>
                <Card className="feature-card h-100 border-0 shadow-sm">
                  <Card.Body className="text-center p-4">
                    <div className={`feature-icon mb-4 text-${feature.color}`}>
                      {feature.icon}
                    </div>
                    <h5 className="fw-bold mb-3">{feature.title}</h5>
                    <p className="text-muted mb-0">{feature.description}</p>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* How It Works Section */}
      <section className="py-5">
        <Container>
          <Row className="text-center mb-5">
            <Col lg={8} className="mx-auto">
              <Badge bg="success" className="mb-3 px-3 py-2">
                Simple Steps
              </Badge>
              <h2 className="display-5 fw-bold mb-4">How ApnaKhata Works</h2>
            </Col>
          </Row>

          <Row className="g-4">
            <Col lg={3} md={6}>
              <div className="text-center">
                <div className="step-number">1</div>
                <h5 className="fw-bold mb-3">Sign Up</h5>
                <p className="text-muted">
                  Create your free account in seconds
                </p>
              </div>
            </Col>
            <Col lg={3} md={6}>
              <div className="text-center">
                <div className="step-number">2</div>
                <h5 className="fw-bold mb-3">Add Expenses</h5>
                <p className="text-muted">Record your daily expenses easily</p>
              </div>
            </Col>
            <Col lg={3} md={6}>
              <div className="text-center">
                <div className="step-number">3</div>
                <h5 className="fw-bold mb-3">Analyze</h5>
                <p className="text-muted">Get insights from smart analytics</p>
              </div>
            </Col>
            <Col lg={3} md={6}>
              <div className="text-center">
                <div className="step-number">4</div>
                <h5 className="fw-bold mb-3">Save Money</h5>
                <p className="text-muted">
                  Achieve your financial goals faster
                </p>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* CTA Section */}
      <section className="py-5 CTA-Section text-white">
        <Container>
          <Row className="text-center">
            <Col lg={8} className="mx-auto">
              <h2 className="display-5 fw-bold mb-4">
                Ready to Transform Your Financial Life?
              </h2>
              <p className="lead mb-4">
                Join thousands of users who are already saving money and
                achieving their financial goals
              </p>
              <Button
                size="lg"
                variant="light"
                className="px-5 py-3 fw-semibold"
                onClick={handleGetStarted}
              >
                Start Your Journey Today
              </Button>

              <div className="mt-4">
                <small className="opacity-75">
                  No credit card required • Free forever plan available
                </small>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Footer CTA */}
      {/* <section className="py-4 bg-dark text-white">
        <Container>
          <Row className="align-items-center">
            <Col md={8}>
              <h6 className="mb-0">
                Get the mobile app for on-the-go expense tracking
              </h6>
            </Col>
            <Col md={4} className="text-md-end">
              <div className="d-flex gap-2 justify-content-md-end">
                <Button
                  size="sm"
                  variant="outline-light"
                  className="d-flex align-items-center"
                >
                  <FaGooglePlay className="me-2" />
                  Play Store
                </Button>
                <Button
                  size="sm"
                  variant="outline-light"
                  className="d-flex align-items-center"
                >
                  <FaAppStore className="me-2" />
                  App Store
                </Button>
              </div>
            </Col>
          </Row>
        </Container>
      </section> */}
    </Layout>
  );
}

export default Home;
