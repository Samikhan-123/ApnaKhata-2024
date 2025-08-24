import React, { useState } from "react";
import { Form, Row, Col, Button, Card, Badge } from "react-bootstrap";
import {
  FaFilter,
  FaSearch,
  FaTimes,
  FaMoneyBillWave,
  FaTag,
} from "react-icons/fa";

const Filters = ({ filters, onFilterChange, totalRecords, loading }) => {
  const [localFilters, setLocalFilters] = useState(filters);
  const [showFilters, setShowFilters] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLocalFilters((prev) => ({ ...prev, [name]: value }));
  };

  const applyFilters = () => {
    onFilterChange(localFilters);
  };

  const resetFilters = () => {
    const resetFilters = {
      category: "all",
      paymentMethod: "all",
      startDate: "",
      endDate: "",
      searchTerm: "",
      minAmount: "",
      maxAmount: "",
      tags: "",
    };
    setLocalFilters(resetFilters);
    onFilterChange(resetFilters);
  };

  const hasActiveFilters = () => {
    return (
      localFilters.category !== "all" ||
      localFilters.paymentMethod !== "all" ||
      localFilters.startDate ||
      localFilters.endDate ||
      localFilters.searchTerm ||
      localFilters.minAmount ||
      localFilters.maxAmount ||
      localFilters.tags
    );
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatCurrency = (amount) => {
    if (!amount) return "";
    return new Intl.NumberFormat("en-PK", {
      style: "currency",
      currency: "PKR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getFilterSummary = () => {
    const summary = [];

    if (localFilters.category && localFilters.category !== "all")
      summary.push(
        <span key="cat">
          <strong>Category:</strong> {localFilters.category}
        </span>
      );
    if (localFilters.paymentMethod && localFilters.paymentMethod !== "all")
      summary.push(
        <span key="pay">
          <strong>Payment:</strong> {localFilters.paymentMethod}
        </span>
      );
    if (localFilters.searchTerm)
      summary.push(
        <span key="search">
          <strong>Search:</strong> {localFilters.searchTerm}
        </span>
      );
    if (localFilters.tags)
      summary.push(
        <span key="tags">
          <strong>Tags:</strong> {localFilters.tags}
        </span>
      );
    if (localFilters.minAmount)
      summary.push(
        <span key="min">
          <strong>Min:</strong> {formatCurrency(localFilters.minAmount)}
        </span>
      );
    if (localFilters.maxAmount)
      summary.push(
        <span key="max">
          <strong>Max:</strong> {formatCurrency(localFilters.maxAmount)}
        </span>
      );
    if (localFilters.startDate && localFilters.endDate) {
      summary.push(
        <span key="daterange">
          <strong>Date:</strong> {formatDate(localFilters.startDate)} to{" "}
          {formatDate(localFilters.endDate)}
        </span>
      );
    } else if (localFilters.startDate) {
      summary.push(
        <span key="from">
          <strong>From:</strong> {formatDate(localFilters.startDate)}
        </span>
      );
    } else if (localFilters.endDate) {
      summary.push(
        <span key="to">
          <strong>To:</strong> {formatDate(localFilters.endDate)}
        </span>
      );
    }

    return summary.length
      ? summary.reduce((prev, curr, idx) => [
          prev,
          <span key={`sep-${idx}`} className="mx-2 text-muted">
            |
          </span>,
          curr,
        ])
      : "Showing all expenses";
  };

  return (
    <Card className="filter-card mb-4">
      <Card.Header
        className="filter-header d-flex justify-content-between align-items-center cursor-pointer"
        onClick={() => setShowFilters(!showFilters)}
      >
        <div className="d-flex align-items-center">
          <FaFilter className="me-2" />
          <h5 className="mb-0">Filters</h5>
          {hasActiveFilters() && (
            <Badge bg="primary" className="ms-2">
              Active
            </Badge>
          )}
        </div>
        <span className="filter-toggle">{showFilters ? "▲" : "▼"}</span>
      </Card.Header>

      {/* Filter summary */}
      <div className="px-3 py-2 bg-light border-bottom small text-muted">
        {getFilterSummary()}
      </div>

      {showFilters && (
        <Card.Body className="filter-body">
          <Row className="g-3">
            {/* Search Bar */}
            {/* <Col md={12} lg={6}>
              <Form.Group>
                <Form.Label className="fw-semibold">Search</Form.Label>
                <div className="search-input-group">
                  <Form.Control
                    type="text"
                    name="searchTerm"
                    value={localFilters.searchTerm}
                    onChange={handleChange}
                    placeholder="Search by description or tags..."
                    className="search-input"
                  />
                  <Button
                    variant="primary"
                    className="search-btn"
                    onClick={applyFilters}
                    disabled={loading}
                  >
                    <FaSearch />
                  </Button>
                </div>
              </Form.Group>
            </Col> */}

            {/* Tags Filter */}
            <Col md={6} lg={3}>
              <Form.Group>
                <Form.Label className="fw-semibold">
                  <FaTag className="me-1" /> Tags
                </Form.Label>
                <Form.Control
                  type="text"
                  name="tags"
                  value={localFilters.tags}
                  onChange={handleChange}
                  placeholder="e.g., food,travel,shopping"
                  className="filter-input"
                />
                <Form.Text className="text-muted">
                  Separate multiple tags with commas
                </Form.Text>
              </Form.Group>
            </Col>

            {/* Category Filter */}
            <Col md={6} lg={3}>
              <Form.Group>
                <Form.Label className="fw-semibold">Category</Form.Label>
                <Form.Select
                  name="category"
                  value={localFilters.category}
                  onChange={handleChange}
                  className="filter-select"
                >
                  <option value="all">All Categories</option>
                  {[
                    "Food & Dining",
                    "Shopping",
                    "Transportation",
                    "Bills & Utilities",
                    "Entertainment",
                    "Health & Fitness",
                    "Travel",
                    "Education",
                    "Personal Care",
                    "Others",
                  ].map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>

            {/* Payment Method Filter */}
            <Col md={6} lg={3}>
              <Form.Group>
                <Form.Label className="fw-semibold">Payment Method</Form.Label>
                <Form.Select
                  name="paymentMethod"
                  value={localFilters.paymentMethod}
                  onChange={handleChange}
                  className="filter-select"
                >
                  <option value="all">All Methods</option>
                  {[
                    "Cash",
                    "Credit Card",
                    "Debit Card",
                    "JazzCash",
                    "EasyPaisa",
                    "Other",
                  ].map((method) => (
                    <option key={method} value={method}>
                      {method}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>

            {/* Amount Range Filters */}
            <Col md={6} lg={3}>
              <Form.Group>
                <Form.Label className="fw-semibold">
                  <FaMoneyBillWave className="me-1" /> Min Amount
                </Form.Label>
                <Form.Control
                  type="number"
                  name="minAmount"
                  value={localFilters.minAmount}
                  onChange={handleChange}
                  placeholder="Minimum amount"
                  min="0"
                  step="1"
                  className="filter-input"
                />
              </Form.Group>
            </Col>

            <Col md={6} lg={3}>
              <Form.Group>
                <Form.Label className="fw-semibold">
                  <FaMoneyBillWave className="me-1" /> Max Amount
                </Form.Label>
                <Form.Control
                  type="number"
                  name="maxAmount"
                  value={localFilters.maxAmount}
                  onChange={handleChange}
                  placeholder="Maximum amount"
                  min="0"
                  step="1"
                  className="filter-input"
                />
              </Form.Group>
            </Col>

            {/* Start Date Filter */}
            <Col md={6} lg={3}>
              <Form.Group>
                <Form.Label className="fw-semibold">Start Date</Form.Label>
                <Form.Control
                  type="date"
                  name="startDate"
                  value={localFilters.startDate}
                  onChange={handleChange}
                  className="filter-input"
                />
              </Form.Group>
            </Col>

            {/* End Date Filter */}
            <Col md={6} lg={3}>
              <Form.Group>
                <Form.Label className="fw-semibold">End Date</Form.Label>
                <Form.Control
                  type="date"
                  name="endDate"
                  value={localFilters.endDate}
                  onChange={handleChange}
                  className="filter-input"
                />
              </Form.Group>
            </Col>

            {/* Action Buttons */}
            <Col md={12}>
              <div className="d-flex gap-2 justify-content-between align-items-center">
                <div className="results-count">
                  {!loading && totalRecords > 0 ? (
                    <span className="text-success fw-semibold">
                      {totalRecords} expense{totalRecords !== 1 ? "s" : ""}{" "}
                      found
                    </span>
                  ) : loading ? (
                    <span className="text-muted">Searching...</span>
                  ) : (
                    <span className="text-muted">No expenses found</span>
                  )}
                </div>

                <div className="d-flex gap-2">
                  <Button
                    variant="outline-secondary"
                    onClick={resetFilters}
                    disabled={loading}
                    className="d-flex align-items-center"
                  >
                    <FaTimes className="me-1" /> Reset
                  </Button>
                  <Button
                    variant="primary"
                    onClick={applyFilters}
                    disabled={loading}
                    className="d-flex align-items-center"
                  >
                    <FaSearch className="me-1" /> Search
                  </Button>
                </div>
              </div>
            </Col>
          </Row>
        </Card.Body>
      )}

      {/* Custom CSS */}
      <style jsx>{`
        .filter-card {
          border: none;
          border-radius: 12px;
          box-shadow: 0 2px 15px rgba(0, 0, 0, 0.08);
          overflow: hidden;
        }

        .filter-header {
          background: #660b05;
          color: white;
          padding: 1rem 1.25rem;
          cursor: pointer;
          transition: background 0.3s ease;
        }

        .filter-header:hover {
          background: #8c1007;
        }

        .filter-toggle {
          font-size: 0.9rem;
        }

        .filter-body {
          padding: 1.5rem;
          background: #f8f9fa;
        }

        .search-input-group {
          position: relative;
          display: flex;
        }

        .search-input {
          border-right: none;
          border-radius: 8px 0 0 8px;
          padding: 0.75rem;
        }

        .search-btn {
          border-radius: 0 8px 8px 0;
          padding: 0.75rem 1rem;
          border: 1px solid #ced4da;
          border-left: none;
        }

        .filter-select,
        .filter-input {
          border-radius: 8px;
          padding: 0.75rem;
          border: 1px solid #ced4da;
        }

        .filter-select:focus,
        .filter-input:focus {
          border-color: #667eea;
          box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
        }

        .results-count {
          font-size: 0.95rem;
        }

        @media (max-width: 768px) {
          .filter-body {
            padding: 1rem;
          }

          .search-input-group {
            flex-direction: column;
          }

          .search-input {
            border-right: 1px solid #ced4da;
            border-radius: 8px 8px 0 0;
          }

          .search-btn {
            border-radius: 0 0 8px 8px;
            border: 1px solid #ced4da;
            border-top: none;
          }
        }
      `}</style>
    </Card>
  );
};

export default Filters;
