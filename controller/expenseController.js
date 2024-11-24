import mongoose from 'mongoose';
import Expense from '../model/expenseSchema.js';
import User from '../model/userSchema.js';
import { sendEmail } from '../utils/emailConfig.js';
import path from 'path';
import fs from 'fs';
import mime from 'mime-types';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Helper function to check if a string is a valid date
const isValidDate = (dateString) => {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date);
};

// Get all expenses
export const getExpenses = async (req, res) => {
  try {
    const {
      startDate,
      endDate,
      category,
      minAmount,
      maxAmount,
      paymentMethod,
      tags,
      search,
      page = 1,
      itemsPerPage = 20, // Default: 20 items per page
    } = req.query;

    let query = { user: req.user._id };

    // Date filters
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    // Category filter
    if (category && category !== 'all') query.category = category;

    // Payment method filter
    if (paymentMethod && paymentMethod !== 'all')
      query.paymentMethod = paymentMethod;

    // Amount filters
    if (minAmount) query.amount = { $gte: Number(minAmount) };
    if (maxAmount) query.amount = { ...query.amount, $lte: Number(maxAmount) };

    // Tags filter 
    if (tags && tags.trim()) {
      const tagArray = tags
        .split(',')
        .map((tag) => tag.trim())
        .filter((tag) => tag);
      if (tagArray.length > 0) {
        query.tags = { $in: tagArray.map((tag) => new RegExp(tag, 'i')) };
      }
    }

    // Search functionality
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { description: searchRegex },
        { category: searchRegex },
        { paymentMethod: searchRegex },
        { tags: searchRegex },
        ...(isValidDate(search)
          ? [
              {
                date: {
                  $gte: new Date(search),
                  $lt: new Date(
                    new Date(search).setDate(new Date(search).getDate() + 1)
                  ),
                },
              },
            ]
          : []),
      ];
    }

    const sortOptions = { date: -1 }; // Descending order by date

    const expenses = await Expense.find(query)
      .sort(sortOptions)
      .skip((page - 1) * itemsPerPage)
      .limit(Number(itemsPerPage));

    const totalRecords = await Expense.countDocuments(query);

    res.status(200).json({
      expenses,
      pagination: {
        totalRecords,
        currentPage: Number(page),
        totalPages: Math.ceil(totalRecords / itemsPerPage),
        itemsPerPage: Number(itemsPerPage),
        hasNextPage: page * itemsPerPage < totalRecords,
        hasPreviousPage: page > 1
      },
      success: true,
      message: 'Expenses fetched successfully',
    });
  } catch (error) {
    console.error('Error fetching expenses:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching expenses',
      error: error.message,
    });
  }
};


// Get receipt by filename
export const getReceipt = async (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(process.cwd(), 'uploads', 'receipts', filename);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'Receipt not found'
      });
    }

    // Get file mime type
    const mimeType = mime.lookup(filePath) || 'application/octet-stream';
    
    // Set headers
    res.setHeader('Content-Type', mimeType);
    res.setHeader('Content-Disposition', `inline; filename="${filename}"`);

    // Stream the file
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);

  } catch (error) {
    console.error('Error fetching receipt:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching receipt',
      error: error.message
    });
  }
};

// Get all expenses without filters
export const getAllExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find({ user: req.user._id })
      .sort({ date: -1 })
      .select('-__v'); // Exclude version key

    // Calculate total amount
    const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0);

    // Transform receipt URLs if they exist
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const transformedExpenses = expenses.map(expense => {
      const expObj = expense.toObject();
      if (expObj.receipt) {
        expObj.receipt.url = `${baseUrl}/api/expenses/receipt/${expObj.receipt.filename}`;
      }
      return expObj;
    });

    res.status(200).json({
      success: true,
      count: expenses.length,
      totalAmount,
      expenses: transformedExpenses,
      message: 'Expenses fetched successfully'
    });

  } catch (error) {
    console.error('Error fetching all expenses:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching expenses',
      error: error.message
    });
  }
};


// Add expense
export const addExpense = async (req, res) => {
  try {
    const {
      description,
      amount,
      date,
      category,
      paymentMethod,
      tags,
      notes,
      isRecurring,
      recurringDetails,
    } = req.body;

    // Parse recurring details if provided and valid
    const parsedRecurringDetails =
      isRecurring && typeof recurringDetails === 'string'
        ? JSON.parse(recurringDetails)
        : recurringDetails || null;

    // Parse tags if provided as a string
    const parsedTags =
      typeof tags === 'string'
        ? tags.split(',').map((tag) => tag.trim())
        : tags || [];

    // Prepare receipt details
    const receipt = req.file
      ? {
          filename: req.file.filename,
          path: req.file.path,
          mimetype: req.file.mimetype,
        }
      : null;

    // Create a new expense
    const newExpense = new Expense({
      user: req.user._id,
      description,
      amount: Number(amount),
      date: new Date(date),
      category,
      paymentMethod,
      tags: parsedTags,
      notes,
      receipt,
      isRecurring: isRecurring === true || isRecurring === 'true',
      recurringDetails: parsedRecurringDetails,
    });

    await newExpense.save();

    // Enhanced HTML Email
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; background: #fff;">
        <h2 style="color: #2c3e50; text-align: center; padding-bottom: 10px; border-bottom: 2px solid #eee;">
           New Expense Added!
        </h2>
        
        <div style="margin: 20px 0; background: #f9f9f9; padding: 15px; border-radius: 5px;">
          <h3 style="color: #34495e; margin-bottom: 15px;">Expense Summary:</h3>
          <ul style="list-style: none; padding: 0; line-height: 1.6;">
            <li><strong>Description:</strong> ${description}</li>
            <li><strong>Amount:</strong> ${new Intl.NumberFormat('en-PK', {
              style: 'currency',
              currency: 'PKR',
            }).format(amount)}</li>
            <li><strong>Category:</strong> ${category}</li>
            <li><strong>Date:</strong> ${new Date(date).toLocaleDateString()}</li>
            <li><strong>Payment Method:</strong> ${paymentMethod}</li>
            ${
              parsedTags.length > 0
                ? `<li><strong>Tags:</strong> ${parsedTags.join(', ')}</li>`
                : ''
            }
            ${notes ? `<li><strong>Notes:</strong> ${notes}</li>` : ''}
          
            ${
              isRecurring
                ? `<li><strong>Recurring Expense:</strong> Yes</li>`
                : ''
            }
          </ul>
        </div>

        ${
          receipt
            ? `
          <div style="margin-top: 20px; text-align: center;">
            <p style="color: #7f8c8d; font-size: 0.9em;">📎 A receipt has been uploaded with this expense.</p>
          </div>
          `
            : ''
        }
        <br />
        <br />
        <p>
          بغیر منصوبہ بندی کے خرچ زندگی کو مشکلات میں ڈال سکتا ہے، ہمیشہ اپنے
          بجٹ کے اصولوں پر چلیں اور مالی سکون حاصل کریں۔
        </p>

        <div style="text-align: center; margin-top: 20px; font-size: 0.85em; color: #7f8c8d;">
          <p>This is an automated notification from <strong>ApnaKhata Expense Tracker</strong>.</p>
          <p>Please do not reply to this email.</p>
        </div>
      </div>
    `;

    // Send notification email
    await sendEmail({
      email: req.user.email,
      subject: '📌 New Expense Added - ApnaKhata',
      html: emailHtml,
    });

    // Respond with success
    res.status(201).json({
      success: true,
      message: 'Expense added successfully',
      expense: newExpense,
    });
  } catch (error) {
    console.error('Error adding expense:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding expense',
      error: error.message,
      details: {
        body: req.body,
        file: req.file,
      },
    });
  }
};

// Get expense by ID
export const getExpenseById = async (req, res) => {
  try {
    const expense = await Expense.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found',
      });
    }

    // Add receipt URL if exists
    const expenseObj = expense.toObject();
    if (expenseObj.receipt) {
      expenseObj.receipt.url = `${req.protocol}://${req.get('host')}/uploads/receipts/${expenseObj.receipt.filename}`;
    }

    res.status(200).json({
      success: true,
      expense: expenseObj,
    });
  } catch (error) {
    console.error('Error fetching expense:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching expense',
    });
  }
};
// Update expense
export const updateExpense = async (req, res) => {
  try {
    const {
      description,
      amount,
      date,
      category,
      paymentMethod,
      tags,
      notes,
      isRecurring,
      recurringDetails,
    } = req.body;

    const expense = await Expense.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found',
      });
    }

    // Parse recurring details only if it's a string and isRecurring is true
    let parsedRecurringDetails = null;
    if (isRecurring === true || isRecurring === 'true') {
      try {
        parsedRecurringDetails =
          typeof recurringDetails === 'string'
            ? JSON.parse(recurringDetails)
            : recurringDetails;
      } catch (parseError) {
        console.error('Error parsing recurring details:', parseError);
        parsedRecurringDetails = recurringDetails;
      }
    }

    // Parse tags if they're provided as a string
    const parsedTags =
      typeof tags === 'string'
        ? tags.split(',').map((tag) => tag.trim())
        : tags || [];

    // Update fields
    expense.description = description;
    expense.amount = Number(amount);
    expense.date = new Date(date);
    expense.category = category;
    expense.paymentMethod = paymentMethod;
    expense.tags = parsedTags;
    expense.notes = notes;
    expense.isRecurring = isRecurring === true || isRecurring === 'true';
    expense.recurringDetails = parsedRecurringDetails;

    if (req.file) {
      expense.receipt = {
        filename: req.file.filename,
        path: req.file.path,
        mimetype: req.file.mimetype,
      };
    }

    await expense.save();
    res.status(200).json({
      success: true,
      message: 'Expense updated successfully',
      expense,
    });
  } catch (error) {
    console.error('Error updating expense:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating expense',
      error: error.message,
      details: {
        body: req.body,
        file: req.file,
      },
    });
  }
};

// Delete expense
export const deleteExpense = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('id', id);
    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Expense ID is required',
      });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid expense ID format',
      });
    }

    const expense = await Expense.findOne({
      _id: id,
      user: req.user._id,
    });

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found',
      });
    }
    // Delete associated receipt file if exists
    if (expense.receipt?.filename) {
      const filePath = `uploads/receipts/${expense.receipt.filename}`;
      try {
        await fs.promises.unlink(filePath);
      } catch (err) {
        console.error('Error deleting receipt file:', err);
      }
    }

    await expense.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Expense successfully deleted',
    });
  } catch (error) {
    console.error('Error deleting expense:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting expense',
    });
  }
};

// Get expense statistics
export const getExpenseStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const query = { user: req.user._id };

    if (startDate) query.date = { $gte: new Date(startDate) };
    if (endDate) query.date = { ...query.date, $lte: new Date(endDate) };

    const stats = await Expense.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$amount' },
          averageAmount: { $avg: '$amount' },
          maxAmount: { $max: '$amount' },
          minAmount: { $min: '$amount' },
          count: { $sum: 1 },
        },
      },
    ]);

    const categoryStats = await Expense.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
    ]);

    const paymentMethodStats = await Expense.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$paymentMethod',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      stats: stats[0] || {},
      categoryStats,
      paymentMethodStats,
    });
  } catch (error) {
    console.error('Error getting expense stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting expense statistics',
    });
  }
};

// Get expenses by category
export const getExpensesByCategory = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const query = { user: req.user._id };

    if (startDate) query.date = { $gte: new Date(startDate) };
    if (endDate) query.date = { ...query.date, $lte: new Date(endDate) };

    const expenses = await Expense.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
          expenses: { $push: '$$ROOT' },
        },
      },
      { $sort: { total: -1 } },
    ]);

    res.status(200).json({
      success: true,
      expenses,
    });
  } catch (error) {
    console.error('Error getting expenses by category:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting expenses by category',
    });
  }
};

// Get monthly expenses
export const getMonthlyExpenses = async (req, res) => {
  try {
    const { year = new Date().getFullYear() } = req.query;

    const expenses = await Expense.aggregate([
      {
        $match: {
          user: req.user._id,
          date: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`),
          },
        },
      },
      {
        $group: {
          _id: { $month: '$date' },
          total: { $sum: '$amount' },
          count: { $sum: 1 },
          expenses: { $push: '$$ROOT' },
        },
      },
      {
        $project: {
          month: '$_id',
          total: 1,
          count: 1,
          expenses: 1,
          _id: 0,
        },
      },
      { $sort: { month: 1 } },
    ]);

    res.status(200).json({
      success: true,
      year,
      expenses,
    });
  } catch (error) {
    console.error('Error getting monthly expenses:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting monthly expenses',
    });
  }
};

export default {
  getExpenses,
  addExpense,
  getExpenseById,
  updateExpense,
  deleteExpense,
  getExpenseStats,
  getExpensesByCategory,
  getMonthlyExpenses,
};
