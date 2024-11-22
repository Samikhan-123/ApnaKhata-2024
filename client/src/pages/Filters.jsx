import React, { useState, useEffect } from 'react';
import { Form, Row, Col, Button } from 'react-bootstrap';
import PropTypes from 'prop-types';
import { FaTimes } from 'react-icons/fa';

const Filters = ({ filters, onFilterChange, totalRecords }) => {
  Filters.propTypes = {
    filters: PropTypes.shape({
      category: PropTypes.string,
      paymentMethod: PropTypes.string,
      minAmount: PropTypes.string,
      maxAmount: PropTypes.string,
      startDate: PropTypes.string,
      endDate: PropTypes.string,
      tags: PropTypes.string,
      searchTerm: PropTypes.string,
    }).isRequired,
    onFilterChange: PropTypes.func.isRequired,
    totalRecords: PropTypes.number.isRequired,
  };

  const [showRecordCount, setShowRecordCount] = useState(false);

  useEffect(() => {
    if (totalRecords > 0) {
      setShowRecordCount(true);
    }
  }, [totalRecords]);


  const handleChange = (e) => {
    const { name, value } = e.target;
    onFilterChange({ ...filters, [name]: value });
  };

  const handleClear = (field) => {
    onFilterChange({ ...filters, [field]: '' });
  };

  const resetFilters = () => {
    onFilterChange({
      category: 'all',
      paymentMethod: 'all',
      minAmount: '',
      maxAmount: '',
      startDate: '',
      endDate: '',
      tags: '',
      searchTerm: '',
    });
  };

  const formGroupStyle = { position: 'relative' };
  const clearIconStyle = {
    position: 'absolute',
    right: '10px',
    top: '75%',
    transform: 'translateY(-50%)',
    cursor: 'pointer',
    color: '#6c757d',
  };

  return (
    <Form>
      <Row className="g-3">
        {/* Category Filter */}
        <Col md={3}>
          <Form.Group>
            <Form.Label>Category</Form.Label>
            <Form.Select
              name="category"
              value={filters.category}
              onChange={handleChange}
            >
              <option value="all">All Categories</option>
              {[
                'Food & Dining',
                'Shopping',
                'Transportation',
                'Bills & Utilities',
                'Entertainment',
                'Health & Fitness',
                'Travel',
                'Education',
                'Personal Care',
                'Others',
              ].map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>

        {/* Payment Method Filter */}
        <Col md={3}>
          <Form.Group>
            <Form.Label>Payment Method</Form.Label>
            <Form.Select
              name="paymentMethod"
              value={filters.paymentMethod}
              onChange={handleChange}
            >
              <option value="all">All Methods</option>
              {[
                'Cash',
                'Credit Card',
                'Debit Card',
                'UPI',
                'Net Banking',
                'Other',
              ].map((method) => (
                <option key={method} value={method}>
                  {method}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>

        {/* Min Amount Filter */}
        <Col md={3}>
          <Form.Group style={formGroupStyle}>
            <Form.Label>Min Amount</Form.Label>
            <Form.Control
              type="number"
              name="minAmount"
              value={filters.minAmount}
              onChange={handleChange}
              placeholder="Min Amount"
            />
          
          </Form.Group>
        </Col>

        {/* Max Amount Filter */}
        <Col md={3}>
          <Form.Group style={formGroupStyle}>
            <Form.Label>Max Amount</Form.Label>
            <Form.Control
              type="number"
              name="maxAmount"
              value={filters.maxAmount}
              onChange={handleChange}
              placeholder="Max Amount"
            />
           
          </Form.Group>
        </Col>

        {/* Start Date Filter */}
        <Col md={3}>
          <Form.Group style={formGroupStyle}>
            <Form.Label>Start Date</Form.Label>
            <Form.Control
              type="date"
              name="startDate"
              value={filters.startDate}
              onChange={handleChange}
            />
          
          </Form.Group>
        </Col>

        {/* End Date Filter */}
        <Col md={3}>
          <Form.Group style={formGroupStyle}>
            <Form.Label>End Date</Form.Label>
            <Form.Control
              type="date"
              name="endDate"
              value={filters.endDate}
              onChange={handleChange}
            />
        
          </Form.Group>
        </Col>

        {/* Tags Filter */}
        <Col md={3}>
          <Form.Group style={formGroupStyle}>
            <Form.Label>Tags</Form.Label>
            <Form.Control
              type="text"
              name="tags"
              value={filters.tags}
              onChange={handleChange}
              placeholder="Enter tags (comma-separated)"
            />
            {filters.tags && (
              <FaTimes
                style={clearIconStyle}
                onClick={() => handleClear('tags')}
              />
            )}
          </Form.Group>
        </Col>

        {/* Search Filter */}
        {/* <Col md={3}>
          <Form.Group style={formGroupStyle}>
            <Form.Label>Search</Form.Label>
            <Form.Control
              type="text"
              name="searchTerm"
              value={filters.searchTerm}
              onChange={handleChange}
              placeholder="Search expenses..."
            />
            {filters.searchTerm && (
              <FaTimes
                style={clearIconStyle}
                onClick={() => handleClear('searchTerm')}
              />
            )}
          </Form.Group>
        </Col> */}

        {/* Total Records */}
        <Col md={12}>
          {showRecordCount ? (
            <p className="text-muted">Total Records Found: {totalRecords}</p>
          ) : (
            <p className="text-muted">No records found.</p>
          )}
        </Col>

        {/* Reset Filters Button */}
        <Col md={3} className="d-flex align-items-end">
          <Button variant="secondary" onClick={resetFilters} className="w-100">
            Reset Filters
          </Button>
        </Col>
      </Row>
    </Form>
  );
};

export default Filters;
