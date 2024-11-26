/* eslint-disable no-unused-vars */
// src/components/PersonalExpenses.jsx

import React, { useState, useEffect } from "react";
import { Button, Card, Form, Row, Col, Table, Badge, Alert } from "react-bootstrap";
import { FaEdit, FaTrash, FaPlus } from "react-icons/fa";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";
import { useAuth } from "../auth/AuthContext"; // Assuming you have AuthContext for user info

const PersonalExpenses = () => {
  const { user } = useAuth(); // Get user info from AuthContext
  const [personalExpenses, setPersonalExpenses] = useState(() => {
    const saved = localStorage.getItem("personalExpenses");
    return saved ? JSON.parse(saved) : [];
  });
  const [newExpense, setNewExpense] = useState({ amount: "", description: "" });
  const [editingExpense, setEditingExpense] = useState(null);

  useEffect(() => {
    // Save expenses in localStorage
    localStorage.setItem("personalExpenses", JSON.stringify(personalExpenses));
  }, [personalExpenses]);

  const handleAddPersonalExpense = () => {
    if (newExpense.amount && newExpense.description) {
      setPersonalExpenses((prev) => [
        ...prev,
        { ...newExpense, id: Date.now(), date: new Date().toISOString(), userId: user.id }, // Add userId
      ]);
      setNewExpense({ amount: "", description: "" });
    }
  };

  const handleEditPersonalExpense = (expense) => {
    setEditingExpense(expense);
    setNewExpense({ amount: expense.amount, description: expense.description });
  };

  const handleUpdatePersonalExpense = () => {
    setPersonalExpenses((prev) =>
      prev.map((exp) =>
        exp.id === editingExpense.id
          ? { ...exp, ...newExpense, date: new Date().toISOString() }
          : exp
      )
    );
    setEditingExpense(null);
    setNewExpense({ amount: "", description: "" });
  };

  const handleDeletePersonalExpense = (id) => {
    confirmAlert({
      title: "Confirm to delete",
      message: "Are you sure you want to delete this personal expense?",
      buttons: [
        {
          label: "Yes",
          onClick: () =>
            setPersonalExpenses((prev) => prev.filter((exp) => exp.id !== id)),
        },
        {
          label: "No",
          onClick: () => {},
        },
      ],
    });
  };

  // Filter expenses for the logged-in user
  const filteredExpenses = personalExpenses.filter((expense) => expense.userId === user.id);

  return (
    <div className="container-fluid col-sm-12">
      <Card className="shadow-sm">
        <Card.Body>
          <Card.Title as="h3" className="mb-4">Personal Expenses</Card.Title>
          <Form>
            <Row className="mb-3 gap-3">
              <Col md={4}>
                <Form.Control
                  type="number"
                  placeholder="Amount"
                  value={newExpense.amount}
                  onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                />
              </Col>
              <Col md={6}>
                <Form.Control
                  type="text"
                  placeholder="Description"
                  value={newExpense.description}
                  onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                />
              </Col>
              <Col md={2}>
                <Button
                  variant="primary"
                  onClick={editingExpense ? handleUpdatePersonalExpense : handleAddPersonalExpense}
                >
                  {editingExpense ? "Update" : <><FaPlus /> Add</>}
                </Button>
              </Col>
            </Row>
          </Form>
          {filteredExpenses.length > 0 ? (
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Amount (Rs)</th>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredExpenses.map((expense, index) => (
                  <tr key={expense.id}>
                    <td>{index + 1}</td>
                    <td>
                      <Badge bg={expense.amount > 1000 ? "danger" : "success"}>
                        {expense.amount}
                      </Badge>
                    </td>
                    <td>
                      {new Date(expense.date).toLocaleString("en-GB", {
                        year: "numeric",
                        month: "numeric",
                        day: "numeric",
                        hour: "numeric",
                        hour12: true,
                        minute: "numeric",
                        second: "numeric",
                      })}
                    </td>
                    <td>{expense.description}</td>
                    <td className="d-flex gap-sm-2">
                      <Button
                        variant="outline-warning"
                        size="sm"
                        onClick={() => handleEditPersonalExpense(expense)}
                        className="me-2"
                      >
                        <FaEdit /> Edit
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleDeletePersonalExpense(expense.id)}
                      >
                        <FaTrash /> Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <Alert variant="info">No personal expenses added yet.</Alert>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default PersonalExpenses;
