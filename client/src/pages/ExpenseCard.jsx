// ExpenseCard.jsx - Cleaned and optimized
import React, { useState, useRef } from "react";
import {
  Button,
  Modal,
  Alert,
  Badge,
  Card,
  Col,
  Row,
  Spinner,
} from "react-bootstrap";
import {
  FaEdit,
  FaTrash,
  FaEye,
  FaFileDownload,
  FaPrint,
  FaReceipt,
  FaMoneyBillWave,
  FaCalendarAlt,
  FaCreditCard,
  FaTag,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../pages/styles/ExpenseCard.css"; 
const ExpenseCard = ({
  expenses = [],
  pagination = {},
  onDeleteSuccess,
  token,
}) => {
  const navigate = useNavigate();
  const deletingRef = useRef(false);

  // State management
  const [modalState, setModalState] = useState({
    showReceipt: false,
    showDelete: false,
    selectedExpense: null,
    selectedReceipt: null,
  });

  const [deleteState, setDeleteState] = useState({
    loading: false,
    error: null,
  });

  // Helper functions
  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-PK", {
      style: "currency",
      currency: "PKR",
    }).format(amount || 0);

  const getCategoryColor = (category) => {
    if (!category) return "secondary";

    const categoryColors = {
      food: "warning",
      transportation: "info",
      entertainment: "success",
      utilities: "primary",
      shopping: "danger",
      healthcare: "info",
      travel: "warning",
      education: "primary",
      other: "secondary",
    };

    return categoryColors[category.toLowerCase()] || "secondary";
  };

  // Event handlers
  const handleDeleteClick = (expense) => {
    setModalState((prev) => ({
      ...prev,
      showDelete: true,
      selectedExpense: expense,
    }));
  };

  const handleDelete = async () => {
    if (deletingRef.current || !modalState.selectedExpense?._id) return;

    deletingRef.current = true;
    setDeleteState({ loading: true, error: null });

    try {
      await axios.delete(`/api/expenses/${modalState.selectedExpense._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setModalState((prev) => ({
        ...prev,
        showDelete: false,
        selectedExpense: null,
      }));

      onDeleteSuccess(modalState.selectedExpense._id);
    } catch (err) {
      setDeleteState({
        loading: false,
        error: err.response?.data?.message || "Failed to delete expense",
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
          responseType: "blob",
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
      console.error("Error fetching receipt:", error);
      setDeleteState((prev) => ({
        ...prev,
        error: "Failed to load receipt. Please try again later.",
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

    const link = document.createElement("a");
    link.href = modalState.selectedReceipt.url;
    link.download = `receipt-${new Date().toLocaleDateString("en-GB")}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintReceipt = () => {
    if (!modalState.selectedReceipt?.url) return;

    const printWindow = window.open(modalState.selectedReceipt.url, "_blank");
    printWindow.onload = () => {
      printWindow.print();
    };
  };

  // Calculate item number for display
  const getItemNumber = (index) => {
    const currentPage = pagination.currentPage || 1;
    const itemsPerPage = pagination.itemsPerPage || pagination.perPage || 15;
    return index + 1 + (currentPage - 1) * itemsPerPage;
  };

  return (
    <div className="expense-card-container">
      {/* Error Alert */}
      {deleteState.error && (
        <Alert
          variant="danger"
          dismissible
          onClose={() => setDeleteState((prev) => ({ ...prev, error: null }))}
          className="mb-3 alert-custom"
        >
          <i className="fas fa-exclamation-circle me-2"></i>
          {deleteState.error}
        </Alert>
      )}

      {/* Expense Cards Grid */}
      <Row className="g-4">
        {expenses.length > 0 ? (
          expenses.map((expense, index) => (
            <Col
              md={6}
              lg={4}
              xl={3}
              className="mb-4"
              key={expense._id || index}
            >
              <Card className="expense-card h-100">
                {/* Ribbon with item number */}
                <div className="expense-card-ribbon">
                  <span>#{getItemNumber(index)}</span>
                </div>

                <Card.Header className="expense-card-header position-relative">
                  <div className="d-flex justify-content-between align-items-center">
                    <Badge
                      bg={getCategoryColor(expense.category)}
                      className="expense-category-badge"
                    >
                      {expense?.category || "Uncategorized"}
                    </Badge>
                    <div className="expense-amount">
                      {formatCurrency(expense?.amount)}
                    </div>
                  </div>
                </Card.Header>

                <Card.Body className="expense-card-body">
                  <div className="expense-description mb-3">
                    <h6 className="mb-1">
                      {expense.description || "No description available"}
                    </h6>
                  </div>

                  <div className="expense-details">
                    <div className="expense-detail-item">
                      <span className="detail-icon">
                        <FaCalendarAlt />
                      </span>
                      <span className="detail-value">
                        {new Date(expense.date).toLocaleDateString("en-GB", {
                          weekday: "short",
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>

                    <div className="expense-detail-item">
                      <span className="detail-icon">
                        <FaCreditCard />
                      </span>
                      <span className="detail-value">
                        {expense.paymentMethod || "Not specified"}
                      </span>
                    </div>

                    {expense.tags && expense.tags.length > 0 && (
                      <div className="expense-detail-item">
                        <span className="detail-icon">
                          <FaTag />
                        </span>
                        <div className="tags-container">
                          {expense.tags.slice(0, 3).map((tag, i) => (
                            <Badge
                              key={i}
                              bg="outline-primary"
                              className="tag-badge"
                            >
                              {tag}
                            </Badge>
                          ))}
                          {expense.tags.length > 3 && (
                            <Badge bg="light" text="dark" className="tag-badge">
                              +{expense.tags.length - 3}
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </Card.Body>

                <Card.Footer className="expense-card-footer">
                  <div className="d-flex justify-content-between align-items-center">
                    {expense.receipt ? (
                      <Button
                        variant="outline-primary"
                        size="sm"
                        className="receipt-btn"
                        onClick={() => handleViewReceipt(expense.receipt)}
                      >
                        <FaEye className="me-1" /> Receipt
                      </Button>
                    ) : (
                      <Badge
                        bg="light"
                        text="secondary"
                        className="no-receipt-badge"
                      >
                        <FaReceipt className="me-1" /> No Receipt
                      </Badge>
                    )}
                    <div className="action-buttons">
                      <Button
                        variant="outline-primary"
                        size="sm"
                        className="edit-btn me-2"
                        onClick={() => navigate(`/edit-expense/${expense._id}`)}
                        title="Edit expense"
                      >
                        <FaEdit />
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        className="delete-btn"
                        onClick={() => handleDeleteClick(expense)}
                        title="Delete expense"
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
          <Col xs={12} className="text-center py-5">
            <div className="no-expenses-placeholder">
              <div className="placeholder-icon">
                <FaMoneyBillWave />
              </div>
              <h4 className="mt-3">No expenses found</h4>
              <p className="text-muted">
                Try adjusting your filters or add a new expense
              </p>
            </div>
          </Col>
        )}
      </Row>

      {/* Receipt Modal */}
      <Modal
        show={modalState.showReceipt}
        onHide={handleCloseReceiptModal}
        centered
        size="lg"
        className="receipt-modal"
      >
        <Modal.Header closeButton className="modal-header-custom">
          <Modal.Title>
            <FaReceipt className="me-2" />
            Receipt Preview
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center p-4">
          {deleteState.loading ? (
            <div className="py-4">
              <Spinner animation="border" variant="primary" className="mb-3" />
              <p className="text-muted">Loading receipt...</p>
            </div>
          ) : (
            modalState.selectedReceipt?.url && (
              <div className="receipt-container">
                <img
                  src={modalState.selectedReceipt.url}
                  alt="Receipt"
                  className="receipt-image img-fluid rounded"
                />
              </div>
            )
          )}
        </Modal.Body>
        <Modal.Footer className="modal-footer-custom">
          {modalState.selectedReceipt?.url && (
            <>
              <Button
                variant="outline-secondary"
                onClick={handlePrintReceipt}
                disabled={deleteState.loading}
                className="d-flex align-items-center"
              >
                <FaPrint className="me-2" /> Print
              </Button>
              <Button
                variant="primary"
                onClick={handleDownloadReceipt}
                disabled={deleteState.loading}
                className="d-flex align-items-center"
              >
                <FaFileDownload className="me-2" /> Download
              </Button>
            </>
          )}
          <Button variant="outline-dark" onClick={handleCloseReceiptModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        show={modalState.showDelete}
        onHide={resetDeleteState}
        centered
        className="delete-modal"
      >
        <Modal.Header closeButton className="modal-header-custom">
          <Modal.Title>
            <FaTrash className="me-2 text-danger" />
            Confirm Deletion
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center py-4">
          <div className="delete-icon mb-3">
            <FaTrash />
          </div>
          <h5>Are you sure you want to delete this expense?</h5>
          <p className="text-muted">This action cannot be undone.</p>
        </Modal.Body>
        <Modal.Footer className="modal-footer-custom justify-content-center">
          <Button
            variant="outline-secondary"
            onClick={resetDeleteState}
            className="px-4"
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleDelete}
            disabled={deleteState.loading}
            className="px-4 d-flex align-items-center"
          >
            {deleteState.loading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Deleting...
              </>
            ) : (
              "Delete Expense"
            )}
          </Button>
        </Modal.Footer>
      </Modal>

    </div>
  );
};

export default ExpenseCard;
