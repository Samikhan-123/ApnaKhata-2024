import React, { useState, useCallback, useRef } from 'react';
import {
  Button,
  Modal,
  Alert,
  Badge,
  Card,
  Col,
  Row,
  Spinner,
} from 'react-bootstrap';
import {
  FaEdit,
  FaTrash,
  FaEye,
  FaFileDownload,
  FaPrint,
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import PaginationComponent from '../pages/Pagination';

const ExpenseCard = ({
  expenses = [],
  pagination,
  onPageChange,
  onDeleteSuccess,
  token,
}) => {
  const navigate = useNavigate();

  // State for modals and UI
  const [modalState, setModalState] = useState({
    showReceipt: false,
    showDelete: false,
    selectedExpense: null,
    selectedReceipt: null,
  });

  // Track delete operation state
  const [deleteState, setDeleteState] = useState({
    loading: false,
    error: null,
  });

  // Use ref to prevent race conditions during delete
  const deletingRef = useRef(false);

  // Function to format currency
  const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
    }).format(amount); // Corrected this line

  // Handle delete operation
  const handleDeleteClick = (expense) => {
    setModalState((prev) => ({
      ...prev,
      showDelete: true,
      selectedExpense: expense,
    }));
  };

  const handleDelete = async () => {
    if (deletingRef.current) return;

    const expenseToDelete = modalState.selectedExpense;
    if (!expenseToDelete?._id) return;
    deletingRef.current = true;
    setDeleteState({ loading: true, error: null });
    try {
      await axios.delete(`/api/expenses/${expenseToDelete._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Close modal first for better UX
      setModalState((prev) => ({
        ...prev,
        showDelete: false,
        selectedExpense: null,
      }));
      // Notify parent component
      onDeleteSuccess(expenseToDelete._id);
    } catch (err) {
      setDeleteState({
        loading: false,
        error: err.response?.data?.message || 'Failed to delete expense',
      });
    } finally {
      deletingRef.current = false;
      setDeleteState((prev) => ({ ...prev, loading: false }));
    }
  };

  const resetDeleteState = () => {
    setModalState((prev) => ({
      ...prev,
      showDelete: false,
      selectedExpense: null,
    }));
    setDeleteState({ loading: false, error: null });
  };

  const handleViewReceipt = async (receipt) => {
    if (!receipt) return;
    setDeleteState((prev) => ({ ...prev, loading: true, error: null }));
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
      setModalState((prev) => ({
        ...prev,
        selectedReceipt: {
          url: receiptUrl,
          contentType: receipt.mimetype,
          filename: receipt.filename,
          blob: blob,
        },
        showReceipt: true,
      }));
    } catch (error) {
      console.error('Error fetching receipt:', error);
      setDeleteState((prev) => ({
        ...prev,
        error: 'Failed to load receipt. Please try again later.',
      }));
    } finally {
      setDeleteState((prev) => ({ ...prev, loading: false }));
    }
  };

  const handleCloseReceiptModal = () => {
    if (modalState.selectedReceipt?.url) {
      URL.revokeObjectURL(modalState.selectedReceipt.url);
    }
    setModalState((prev) => ({
      ...prev,
      selectedReceipt: null,
      showReceipt: false,
    }));
    setDeleteState((prev) => ({ ...prev, error: null }));
  };

  const handleDownloadReceipt = () => {
    if (!modalState.selectedReceipt?.url) return;
    const link = document.createElement('a');
    link.href = modalState.selectedReceipt.url;
    link.download = `receipt-${new Date().toLocaleDateString('en-GB')}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintReceipt = () => {
    if (!modalState.selectedReceipt?.url) return;
    const printWindow = window.open(modalState.selectedReceipt.url, '_blank');
    printWindow.onload = () => {
      printWindow.print();
    };
  };

  return (
    <div className="col-lg-10 mx-auto d-flex flex-column min-vh-100">
      {/* Pagination at top */}
      <PaginationComponent
        pagination={pagination}
        onPageChange={onPageChange}
      />

      {/* Success and Error Alerts */}
      {deleteState.error && (
        <Alert
          variant="danger"
          dismissible
          onClose={() => setDeleteState((prev) => ({ ...prev, error: null }))}
        >
          {deleteState.error}
        </Alert>
      )}

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
                        {`${index + 1}. ${
                          expense.category || 'Category not specified'
                        }`}
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
                          onClick={() =>
                            navigate(`/edit-expense/${expense._id}`)
                          }
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
      />

      {/* Receipt Modal */}
      <Modal
        show={modalState.showReceipt}
        onHide={handleCloseReceiptModal}
        centered
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Receipt</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {deleteState.loading ? (
            <Spinner
              animation="border"
              variant="primary"
              className="d-block mx-auto"
            />
          ) : deleteState.error ? (
            <Alert variant="danger">{deleteState.error}</Alert>
          ) : modalState.selectedReceipt?.url ? (
            modalState.selectedReceipt.contentType.includes('image') ? (
              <img
                src={modalState.selectedReceipt.url}
                alt="receipt"
                className="img-fluid"
              />
            ) : (
              <div className="d-flex justify-content-center">
                <Button
                  variant="outline-primary"
                  onClick={handleDownloadReceipt}
                >
                  Download Receipt
                </Button>
                <Button
                  variant="outline-success"
                  className="ms-2"
                  onClick={handlePrintReceipt}
                >
                  Print Receipt
                </Button>
              </div>
            )
          ) : (
            <Alert variant="info">No receipt available.</Alert>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseReceiptModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={modalState.showDelete} onHide={resetDeleteState} centered>
        <Modal.Header closeButton>
          <Modal.Title>Delete Expense</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {deleteState.loading ? (
            <Spinner
              animation="border"
              variant="primary"
              className="d-block mx-auto"
            />
          ) : (
            <>
              <p>
                Are you sure you want to delete this expense? This action cannot
                be undone.
              </p>
              <p>
                Category: {modalState.selectedExpense?.category}
                <br />
                Amount: {modalState.selectedExpense?.amount}
              </p>
              {deleteState.error && (
                <Alert variant="danger">{deleteState.error}</Alert>
              )}
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={resetDeleteState}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleDelete}
            disabled={deleteState.loading}
          >
            {deleteState.loading ? 'Deleting...' : 'Delete'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ExpenseCard;
