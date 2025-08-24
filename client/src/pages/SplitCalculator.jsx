import React, { useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Alert,
  Badge,
} from "react-bootstrap";
import {
  FaUsers,
  FaMoneyBillWave,
  FaCalculator,
  FaUndo,
  FaShare,
} from "react-icons/fa";

const SplitCalculator = () => {
  const [billAmount, setBillAmount] = useState("");
  const [numberOfPeople, setNumberOfPeople] = useState("");
  const [results, setResults] = useState(null);

  const calculateSplit = () => {
    if (!billAmount || !numberOfPeople) return;

    const bill = parseFloat(billAmount);
    const people = parseInt(numberOfPeople);
    const perPerson = bill / people;

    setResults({
      total: bill,
      perPerson,
    });
  };

  const resetCalculator = () => {
    setBillAmount("");
    setNumberOfPeople("");
    setResults(null);
  };

  return (
    <Container className="split-calculator-container py-5">
      <Row className="justify-content-center">
        <Col lg={8}>
          <div className="text-center mb-5">
            <h1 className="display-5 fw-bold mb-3">
              <FaCalculator className="me-2 text-primary" />
              Simple Split Calculator
            </h1>
            <p className="lead text-muted">
              Easily split bills among friends, family, or colleagues
            </p>
          </div>

          <Row>
            {/* Input Section */}
            <Col md={6} className="mb-4">
              <Card className="h-100 input-card">
                <Card.Header className="bg-primary text-white">
                  <h5 className="mb-0">
                    <FaMoneyBillWave className="me-2" />
                    Bill Details
                  </h5>
                </Card.Header>
                <Card.Body>
                  <Form>
                    <Form.Group className="mb-4">
                      <Form.Label className="fw-semibold">
                        Total Bill Amount (₨)
                      </Form.Label>
                      <Form.Control
                        type="number"
                        placeholder="Enter amount"
                        value={billAmount}
                        onChange={(e) => setBillAmount(e.target.value)}
                        className="input-field"
                      />
                    </Form.Group>

                    <Form.Group className="mb-4">
                      <Form.Label className="fw-semibold">
                        <FaUsers className="me-2" />
                        Number of People
                      </Form.Label>
                      <Form.Control
                        type="number"
                        placeholder="How many people?"
                        value={numberOfPeople}
                        onChange={(e) => setNumberOfPeople(e.target.value)}
                        min="1"
                        className="input-field"
                      />
                    </Form.Group>

                    <div className="d-grid gap-2">
                      <Button
                        variant="primary"
                        size="lg"
                        onClick={calculateSplit}
                        disabled={!billAmount || !numberOfPeople}
                        className="calculate-btn"
                      >
                        <FaCalculator className="me-2" />
                        Calculate Split
                      </Button>
                      <Button
                        variant="outline-secondary"
                        onClick={resetCalculator}
                        className="reset-btn"
                      >
                        <FaUndo className="me-2" />
                        Reset
                      </Button>
                    </div>
                  </Form>
                </Card.Body>
              </Card>
            </Col>

            {/* Results Section */}
            <Col md={6}>
              <Card className="h-100 results-card">
                <Card.Header className="bg-success text-white">
                  <h5 className="mb-0">
                    <FaShare className="me-2" />
                    Split Results
                  </h5>
                </Card.Header>
                <Card.Body>
                  {results ? (
                    <div className="results-container">
                      <div className="text-center mb-4">
                        <div className="total-amount display-4 fw-bold text-success">
                          {results.perPerson.toFixed(2)} ₨
                        </div>
                        <p className="text-muted">per person</p>
                      </div>

                      <div className="results-details">
                        <div className="d-flex justify-content-between py-2 border-bottom">
                          <span>Total Bill:</span>
                          <span className="fw-semibold">
                            {results.total.toFixed(2)} ₨
                          </span>
                        </div>
                        <div className="d-flex justify-content-between py-2 border-bottom">
                          <span>Each Person Pays:</span>
                          <span className="fw-semibold text-primary">
                            {results.perPerson.toFixed(2)} ₨
                          </span>
                        </div>
                      </div>

                     
                    </div>
                  ) : (
                    <div className="text-center py-5">
                      <div className="placeholder-icon text-muted mb-3">
                        <FaCalculator size={48} />
                      </div>
                      <h5 className="text-muted">Calculate to see results</h5>
                      <p className="text-muted">
                        Enter your bill details and click calculate to see how
                        to split the bill
                      </p>
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Col>
      </Row>
    </Container>
  );
};

export default SplitCalculator;

