import express from 'express';
import {
  addExpense,
  deleteExpense,
  getExpenseById,
  getExpenses,
  updateExpense,
  getReceipt,
} from '../controller/expenseController.js';
import { authenticate } from '../utils/jwtUtills.js';
import { upload } from '../middleware/mutler.js';
import {validateExpense} from '../utils/validateExpense.js';

const router = express.Router();

// Base route: /api/expenses

// Get receipt by filename
router.get("/receipt/:fileId", authenticate, getReceipt);

// Get all expenses without filters
// router.get('/all', authenticate, getAllExpenses);


// Get all expenses with filters
router.get('/', authenticate, getExpenses);

// Get expense statistics
// router.get('/stats', authenticate, getExpenseStats);

// Get expenses by category
// router.get('/by-category', authenticate, getExpensesByCategory);

// Get monthly expenses
// router.get('/monthly', authenticate, getMonthlyExpenses);

// Get specific expense
router.get('/:id', authenticate, getExpenseById);

// Add new expense
router.post(
  '/add',
  authenticate,
  upload.single('receipt'),
  validateExpense,
  addExpense
);

// Update expense
router.put(
  '/:id',
  authenticate,
  upload.single('receipt'),
  validateExpense,
  updateExpense
);

// Delete expense
router.delete('/:id', authenticate, deleteExpense);
export default router;
