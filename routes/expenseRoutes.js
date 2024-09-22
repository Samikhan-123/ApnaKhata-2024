import express from 'express';
import { addExpense, deleteExpense, editExpense, getExpenseById, getExpenses, updateExpense } from '../controller/expenseController.js';
import { authenticate } from '../utils/jwtUtills.js';

const router = express.Router();

// Add an expense
router.post('/add', authenticate, addExpense);

// Get all expenses
router.get('/', authenticate, getExpenses);

// Get an expense by ID
router.get('/get/:id', authenticate,getExpenseById);


// Get user expense by ID
// router.get('/user/:userId', getExpensesByUserId);

// Edit an expense
router.put('edit/:expenseId', editExpense);

// Delete an expense
router.delete('/:expenseId',authenticate, deleteExpense);
// Update an expense by ID
router.put('/update/:id',authenticate, updateExpense);

// mark an expense as paid
// router.put('/:id/mark-paid', authenticate, markExpenseAsPaid);


export default router;
