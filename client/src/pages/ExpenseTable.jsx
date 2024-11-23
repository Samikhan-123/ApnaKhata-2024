import React, { useState } from 'react';
import {
  Button,
  Modal,
  Alert,
  Badge,
  Card,
  Col,
  Row,
  Form,
} from 'react-bootstrap';
import {
  FaEdit,
  FaTrash,
  FaEye,
  FaFileDownload,
  FaCalculator,
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const ExpenseCard = ({ expenses, onDeleteClick }) => {
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [showSplitModal, setShowSplitModal] = useState(false);
  const [participants, setParticipants] = useState(1);
  const [splitAmount, setSplitAmount] = useState(0);
  const navigate = useNavigate();

  const formatCurrency = (amount) => {
    if (!amount) return '0';
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
    }).format(amount);
  };

  const handleViewReceipt = (receipt) => {
    if (!receipt) return;

    const receiptUrl = `${import.meta.env.VITE_API_BASE_URL}/uploads/receipts/${receipt.filename}`;
    setSelectedReceipt({
      url: receiptUrl,
      contentType: receipt.mimetype,
      filename: receipt.filename,
    });
    setShowReceiptModal(true);
  };

  const calculateSplit = () => {
    const total = expenses.reduce((acc, curr) => acc + (curr.amount || 0), 0);
    setSplitAmount(participants > 0 ? total / participants : 0);
  };

  const totalExpenses = expenses.reduce(
    (acc, curr) => acc + (curr.amount || 0),
    0
  );

  const internalStyles = {
    cardHeader: {
      fontSize: '1.2rem',
      fontWeight: 'bold',
      color: '#4A4A4A',
    },
    cardBody: {
      fontSize: '1rem',
      color: '#636363',
    },
    cardFooter: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: '10px',
    },
    badge: {
      fontSize: '0.9rem',
    },
  };

  return (
    <div className="col-lg-10 mx-auto d-flex flex-column min-vh-100">
      <div className="flex-grow-1">
        {/* <div className="d-flex justify-content-between align-items-center mb-3">
          <h5>Total Expenses: {formatCurrency(totalExpenses)}</h5>
          <h5>Total Records: {expenses.length || 'No records found'}</h5>
        </div> */}

        <Row className="g-3">
          {expenses.length > 0 ? (
            expenses.map((expense, index) => (
              <Col md={6} lg={6} sm={12} key={expense.id}>
                <Card className="shadow-lg h-100 border-0">
                  <Card.Header
                    style={internalStyles.cardHeader}
                    className="bg-light"
                  >
                    <div className="d-flex justify-content-between align-items-center">
                      <span>
                        {`${index + 1}. ${expense.category || 'Category not specified'}`}
                      </span>
                      <Badge bg="success" style={internalStyles.badge}>
                        {formatCurrency(expense.amount)}
                      </Badge>
                    </div>
                  </Card.Header>
                  <Card.Body style={internalStyles.cardBody}>
                    <Card.Text>
                      <strong>Description : </strong>
                      {expense.description || 'Description not available'}
                    </Card.Text>
                    <Card.Text>
                      <strong>Date : </strong>
                      {new Date(expense.date).toLocaleDateString('en-GB')}
                    </Card.Text>
                    <Card.Text>
                      <strong>Payment Method : </strong>
                      {expense.paymentMethod || 'Payment method not specified'}
                    </Card.Text>
                    <Card.Text>
                      <strong>Tags : </strong>
                      {expense.tags ? (
                        expense.tags.length > 1 ? (
                          expense.tags.join(' , ')
                        ) : (
                          expense.tags
                        )
                      ) : (
                        <Badge bg="warning">No Tags</Badge>
                      )}
                    </Card.Text>
                    <Card.Text>
                      <strong>Notes : </strong> {expense.notes || 'No Notes'}
                    </Card.Text>
                  </Card.Body>
                  <Card.Footer
                    className="bg-light"
                    style={internalStyles.cardFooter}
                  >
                    {expense.receipt ? (
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => handleViewReceipt(expense.receipt)}
                      >
                        <FaEye /> View Receipt
                      </Button>
                    ) : (
                      <Badge bg="secondary" style={internalStyles.badge}>
                        No Receipt
                      </Badge>
                    )}
                    <div>
                      <Button
                        variant="primary"
                        size="sm"
                        className="me-2"
                        onClick={() => navigate(`/edit-expense/${expense.id}`)}
                      >
                        <FaEdit />
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => onDeleteClick(expense)}
                      >
                        <FaTrash />
                      </Button>
                    </div>
                  </Card.Footer>
                </Card>
              </Col>
            ))
          ) : (
            <Alert variant="info" className="text-center">
              No expenses found.
            </Alert>
          )}
        </Row>
      </div>

      {/* Receipt Modal */}
      <Modal
        show={showReceiptModal}
        onHide={() => setShowReceiptModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Receipt</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedReceipt?.url ? (
            selectedReceipt.contentType.includes('image') ? (
              <img
                src={selectedReceipt.url}
                alt="Receipt"
                style={{ width: '100%', height: 'auto' }}
              />
            ) : (
              <iframe
                src={selectedReceipt.url}
                title="Receipt"
                style={{ width: '100%', height: '500px' }}
              />
            )
          ) : (
            <Alert variant="info">No receipt available</Alert>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="outline-primary"
            onClick={() => window.open(selectedReceipt.url, '_blank')}
            disabled={!selectedReceipt?.url}
          >
            <FaFileDownload /> Open
          </Button>
          <Button
            variant="secondary"
            onClick={() => setShowReceiptModal(false)}
          >
            Close
          </Button>
        </Modal.Footer>
      </Modal>

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
          <h5>Total Expenses: {formatCurrency(totalExpenses)}</h5>
          <Form.Group className="mb-3">
            <Form.Label>Number of Participants</Form.Label>
            <Form.Control
              type="number"
              min="1"
              value={participants}
              onChange={(e) => setParticipants(e.target.value)}
            />
          </Form.Group>
          <h5>Split Amount: {formatCurrency(splitAmount)}</h5>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={calculateSplit}>
            Recalculate
          </Button>
          <Button variant="secondary" onClick={() => setShowSplitModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ExpenseCard;
