import React, { useState, useCallback } from 'react';
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
import PaginationComponent from '../pages/Pagination';

const ExpenseCard = ({ expenses = [], pagination, onPageChange }) => {
  const { token } = useAuth();
  const navigate = useNavigate();
  
  // State variables
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [showSplitModal, setShowSplitModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [participants, setParticipants] = useState(1);
  const [splitAmount, setSplitAmount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [goToPage, setGoToPage] = useState('');

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
    }).format(amount || 0);
  };

  // Delete handling
  const handleDeleteClick = useCallback((expense) => {
    setSelectedExpense(expense);
    setShowDeleteModal(true);
  }, []);

  const handleDelete = async () => {
    try {
      setError('');
      await axios.delete(`/api/expenses/${selectedExpense._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setShowDeleteModal(false);
      // Trigger refetch in parent component
      if (onPageChange) {
        onPageChange(pagination.currentPage);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete expense');
    }
  };

  // Receipt handling
  const handleViewReceipt = async (receipt) => {
    if (!receipt) return;
    setLoading(true);
    setError('');

    try {
      const response = await axios.get(
        `/api/expenses/receipt/${receipt.filename}`,
        {
          headers: { Authorization: `Bearer ${token}` },
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

  const handleDownloadReceipt = () => {
    if (!selectedReceipt?.url) return;
    const link = document.createElement('a');
    link.href = selectedReceipt.url;
    link.download = `receipt-${new Date().toLocaleDateString('en-GB')}`;
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

  // Split calculator
  const calculateSplit = () => {
    const total = expenses.reduce((acc, curr) => acc + (curr.amount || 0), 0);
    setSplitAmount(participants > 0 ? total / participants : 0);
  };

  return (
    <div className="col-lg-10 mx-auto d-flex flex-column min-vh-100">
      {/* Pagination at top */}
      <PaginationComponent
        pagination={pagination}
        onPageChange={onPageChange}
        goToPage={goToPage}
        setGoToPage={setGoToPage}
      />

      {/* Expense Cards */}
      <div className="flex-grow-1">
        <Row className="g-3">
          {expenses.length > 0 ? (
            expenses.map((expense, index) => (
              <Col md={6} lg={6} sm={12} key={expense._id}>
                <Card className="shadow-lg h-100 border-0">
                  <Card.Header className="bg-light">
                    <div className="d-flex justify-content-between align-items-center">
                      <span>
                        {`${index + 1}. ${expense.category || 'Category not specified'}`}
                      </span>
                      <Badge bg="success">
                        {formatCurrency(expense.amount)}
                      </Badge>
                    </div>
                  </Card.Header>
                  <Card.Body>
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
                  <Card.Footer className="bg-light">
                    <div className="d-flex justify-content-between align-items-center">
                      {expense.receipt ? (
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() => handleViewReceipt(expense.receipt)}
                        >
                          <FaEye /> View Receipt
                        </Button>
                      ) : (
                        <Badge bg="secondary">No Receipt</Badge>
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
                          onClick={() => handleDeleteClick(expense)}
                        >
                          <FaTrash />
                        </Button>
                      </div>
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

      {/* Pagination at bottom */}
      <PaginationComponent
        pagination={pagination}
        onPageChange={onPageChange}
        goToPage={goToPage}
        setGoToPage={setGoToPage}
      />

      {/* Split Calculator Button */}
      <div
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          zIndex: 1000,
        }}
      >
        <Button
          variant="primary"
          size="lg"
          className="rounded-circle shadow"
          onClick={() => setShowSplitModal(true)}
        >
          <FaCalculator />
        </Button>
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
          <h5>Total Expenses: {formatCurrency(expenses.reduce((acc, curr) => acc + (curr.amount || 0), 0))}</h5>
          <Form.Group className="mb-3">
            <Form.Label>Number of Participants</Form.Label>
            <Form.Control
              type="number"
              min="1"
              value={participants}
              onChange={(e) => setParticipants(Math.max(1, Number(e.target.value) || 1))}
            />
          </Form.Group>
          <h5>Split Amount: {formatCurrency(splitAmount)}</h5>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="primary"
            onClick={calculateSplit}
            disabled={!expenses.length}
          >
            Calculate
          </Button>
          <Button variant="secondary" onClick={() => setShowSplitModal(false)}>
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
              Amount: {formatCurrency(selectedExpense.amount)}
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
    </div>
  );
};

export default ExpenseCard;