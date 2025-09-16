import React, { useState } from "react";
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
  FaFileDownload,
  FaReceipt,
  FaMoneyBillWave,
  FaCalendarAlt,
  FaCreditCard,
  FaTag,
  FaExternalLinkAlt,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../pages/styles/ExpenseCard.css";
import toast from "react-hot-toast";

const ExpenseCard = ({
  expenses = [],
  pagination = {},
  onDeleteSuccess,
  token,
}) => {
  const navigate = useNavigate();
  const api = import.meta.env.VITE_API_BASE_URL;

  // State management
  const [deleteModal, setDeleteModal] = useState({
    show: false,
    expense: null,
  });

  const [deleteState, setDeleteState] = useState({
    loading: false,
    error: null,
  });

  const [receiptState, setReceiptState] = useState({
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
    setDeleteModal({ show: true, expense });
  };

  const handleDelete = async () => {
    if (!deleteModal.expense?._id) return;

    setDeleteState({ loading: true, error: null });

    try {
      await axios.delete(`${api}/expenses/${deleteModal.expense._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Show success toast with expense details
      toast.success(
        `Deleted ${deleteModal.expense.category} expense: ${formatCurrency(deleteModal.expense.amount)}`
      );

      // Close modal and reset state
      setDeleteModal({ show: false, expense: null });
      setDeleteState({ loading: false, error: null });

      // Notify parent component to remove the expense from UI
      if (onDeleteSuccess) {
        onDeleteSuccess(deleteModal.expense._id);
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Failed to delete expense";
      setDeleteState({ loading: false, error: errorMessage });
      toast.error(errorMessage);
    }
  };

  const resetDeleteState = () => {
    setDeleteModal({ show: false, expense: null });
    setDeleteState({ loading: false, error: null });
  };

  // Handle view receipt - opens image in new tab
  const handleViewReceipt = async (receipt) => {
    if (!receipt || !receipt.fileId) return;

    setReceiptState({ loading: true, error: null });

    try {
      const response = await axios.get(
        `${api}/expenses/receipt/${receipt.fileId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: "blob",
        }
      );

      const blob = new Blob([response.data], { type: receipt.contentType });
      const receiptUrl = URL.createObjectURL(blob);

      // Open image in new tab for images
      if (receipt.contentType?.includes("image")) {
        window.open(receiptUrl, "_blank");
      } else {
        // For non-image files, trigger download
        triggerDownload(receiptUrl, receipt.originalName);
      }
    } catch (error) {
      setReceiptState({
        error: "Failed to load receipt. Please try again later.",
      });
    } finally {
      setReceiptState((prev) => ({ ...prev, loading: false }));
    }
  };

  // Download receipt file
  const handleDownloadReceipt = async (receipt) => {
    if (!receipt || !receipt.fileId) return;

    setReceiptState({ loading: true, error: null });

    try {
      const response = await axios.get(
        `${api}/expenses/receipt/${receipt.fileId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: "blob",
        }
      );

      const blob = new Blob([response.data], { type: receipt.contentType });
      const url = URL.createObjectURL(blob);
      triggerDownload(url, receipt.originalName);
      URL.revokeObjectURL(url);
    } catch (error) {
      setReceiptState({
        error: "Failed to download receipt. Please try again later.",
      });
    } finally {
      setReceiptState((prev) => ({ ...prev, loading: false }));
    }
  };

  // Helper to trigger file download
  const triggerDownload = (url, originalName) => {
    const link = document.createElement("a");
    link.href = url;
    link.download =
      originalName || `receipt-${new Date().toLocaleDateString("en-GB")}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
              sm={12}
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
                    {expense.receipt && expense.receipt.fileId ? (
                      <div className="d-flex align-items-center">
                        <Button
                          variant="outline-primary"
                          size="sm"
                          className="receipt-btn me-2"
                          onClick={() => handleViewReceipt(expense.receipt)}
                          title={
                            expense.receipt.originalName?.length > 20
                              ? `View receipt (${expense.receipt.originalName.substring(0, 20)}...)`
                              : `View receipt ${expense.receipt.originalName || ""}`
                          }
                          disabled={receiptState.loading}
                        >
                          {receiptState.loading ? (
                            <Spinner animation="border" size="sm" />
                          ) : (
                            <>
                              <FaExternalLinkAlt className="me-1" />
                              {expense.receipt.originalName &&
                                ` ${expense.receipt.originalName.substring(0, 10)}...`}
                            </>
                          )}
                        </Button>
                        <Button
                          variant="outline-secondary"
                          size="sm"
                          className="download-btn"
                          onClick={() => handleDownloadReceipt(expense.receipt)}
                          title="Download receipt"
                          disabled={receiptState.loading}
                        >
                          <FaFileDownload />
                        </Button>
                      </div>
                    ) : ""}
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

      {/* Delete Confirmation Modal */}
      <Modal
        show={deleteModal.show}
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
          {/* <h5>Are you sure you want to delete this expense?</h5> */}
          {deleteModal.expense && (
            <p className="text-muted mb-2">
              <strong>{deleteModal.expense.category}</strong> expense of{" "}
              <strong>{formatCurrency(deleteModal.expense.amount)}</strong>
            </p>
          )}
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
