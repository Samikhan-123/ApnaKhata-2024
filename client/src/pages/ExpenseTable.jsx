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
  Spinner,
} from 'react-bootstrap';
import {
  FaEdit,
  FaTrash,
  FaEye,
  FaFileDownload,
  FaCalculator,
  FaPrint,
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../auth/AuthContext';

const ExpenseCard = ({ expenses, onDeleteClick }) => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [showSplitModal, setShowSplitModal] = useState(false);
  const [participants, setParticipants] = useState(1);
  const [splitAmount, setSplitAmount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const formatCurrency = (amount) => {
    if (!amount) return '0';
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
    }).format(amount);
  };

  const handleViewReceipt = async (receipt) => {
    if (!receipt) return;

    setLoading(true);
    setError('');

    try {
      const response = await axios.get(
        `/api/expenses/receipt/${receipt.filename}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          responseType: 'blob',
        }
      );

      const blob = new Blob([response.data], { type: receipt.mimetype });
      const receiptUrl = URL.createObjectURL(blob);

      setSelectedReceipt({
        url: receiptUrl,
        contentType: receipt.mimetype,
        filename: receipt.filename,
        blob: blob,
      });

      setShowReceiptModal(true);
    } catch (error) {
      console.error('Error fetching receipt:', error);
      setError('Failed to load receipt. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseReceiptModal = () => {
    if (selectedReceipt?.url) {
      URL.revokeObjectURL(selectedReceipt.url);
    }
    setSelectedReceipt(null);
    setShowReceiptModal(false);
    setError('');
  };

  const handleDownloadReceipt = async () => {
    if (!selectedReceipt) return;

    const link = document.createElement('a');
    link.href = selectedReceipt.url;
    link.download = selectedReceipt.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintReceipt = () => {
    if (!selectedReceipt?.url) return;

    const printWindow = window.open(selectedReceipt.url, '_blank');
    printWindow.onload = () => {
      printWindow.print();
    };
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
        <Row className="g-3">
          {expenses.length > 0 ? (
            expenses.map((expense, index) => (
              <Col md={6} lg={6} sm={12} key={expense._id}>
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
                      <strong>Description: </strong>
                      {expense.description || 'Description not available'}
                    </Card.Text>
                    <Card.Text>
                      <strong>Date: </strong>
                      {new Date(expense.date).toLocaleDateString('en-GB')}
                    </Card.Text>
                    <Card.Text>
                      <strong>Payment Method: </strong>
                      {expense.paymentMethod || 'Payment method not specified'}
                    </Card.Text>
                    <Card.Text>
                      <strong>Tags: </strong>
                      {expense.tags && expense.tags.length > 0
                        ? expense.tags.join(', ')
                        : 'No tags'}
                    </Card.Text>
                    {expense.notes && (
                      <Card.Text>
                        <strong>Notes: </strong>
                        {expense.notes}
                      </Card.Text>
                    )}
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
                        onClick={() => navigate(`/edit-expense/${expense._id}`)}
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
        onHide={handleCloseReceiptModal}
        centered
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Receipt</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {loading ? (
            <div className="text-center py-4">
              <Spinner animation="border" variant="primary" />
              <p className="mt-2">Loading receipt...</p>
            </div>
          ) : error ? (
            <Alert variant="danger">{error}</Alert>
          ) : selectedReceipt?.url ? (
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
                sandbox="allow-same-origin"
              />
            )
          ) : (
            <Alert variant="info">No receipt available</Alert>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="outline-primary"
            onClick={handleDownloadReceipt}
            disabled={!selectedReceipt?.url || loading}
          >
            <FaFileDownload /> Download
          </Button>
          <Button
            variant="outline-secondary"
            onClick={handlePrintReceipt}
            disabled={!selectedReceipt?.url || loading}
          >
            <FaPrint /> Print
          </Button>
          <Button variant="secondary" onClick={handleCloseReceiptModal}>
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
              onChange={(e) => setParticipants(Number(e.target.value))}
            />
          </Form.Group>
          <h5>Split Amount: {formatCurrency(splitAmount)}</h5>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={calculateSplit}>
            Calculate
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
