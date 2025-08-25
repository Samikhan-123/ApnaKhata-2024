import mongoose from "mongoose";
import Expense from "../model/expenseSchema.js";
import { sendEmail } from "../utils/emailConfig.js";
import path from "path";
import fs from "fs";
import mime from "mime-types";
import { fileURLToPath } from "url";
import {
  uploadToGridFS,
  deleteFromGridFS,
  getFileFromGridFS,
  getFileInfoFromGridFS,
} from "../middleware/mutler.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get all expenses with pagination and filtering
export const getExpenses = async (req, res) => {
  try {
    // Extract query parameters with defaults
    const {
      page = 1,
      limit = 12,
      category,
      paymentMethod,
      startDate,
      endDate,
      searchTerm,
      minAmount,
      maxAmount,
      tags,
    } = req.query;

    // Build the base query for filtered results
    let query = { user: req.user._id };

    // Apply filters if provided
    if (category && category !== "all") {
      query.category = category;
    }

    if (paymentMethod && paymentMethod !== "all") {
      query.paymentMethod = paymentMethod;
    }

    // Date range filter
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999); // End of the day
        query.date.$lte = end;
      }
    }

    // Amount range filter
    if (minAmount || maxAmount) {
      query.amount = {};
      if (minAmount) query.amount.$gte = Number(minAmount);
      if (maxAmount) query.amount.$lte = Number(maxAmount);
    }

    // Search term filter (search in description and tags)
    if (searchTerm) {
      query.$or = [
        { description: { $regex: searchTerm, $options: "i" } },
        { tags: { $in: [new RegExp(searchTerm, "i")] } },
      ];
    }

    // Tags filter
    if (tags) {
      const tagArray = tags.split(",").map((tag) => tag.trim());
      query.tags = { $in: tagArray.map((tag) => new RegExp(tag, "i")) };
    }

    // Calculate pagination values
    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.max(1, Number(limit));
    const skip = (pageNum - 1) * limitNum;

    // Execute queries in parallel for better performance
    const [
      expenses,
      totalRecords,
      filteredTotalRecords,
      totalAmountResult,
      filteredTotalAmountResult,
    ] = await Promise.all([
      // Get paginated expenses with filters
      Expense.find(query)
        .sort({ date: -1, createdAt: -1 })
        .skip(skip)
        .limit(limitNum),

      // Get total records (ALL records, no filters)
      Expense.countDocuments({ user: req.user._id }),

      // Get filtered records count
      Expense.countDocuments(query),

      // Get total amount (ALL expenses, no filters)
      Expense.aggregate([
        { $match: { user: req.user._id } },
        { $group: { _id: null, totalAmount: { $sum: "$amount" } } },
      ]),

      // Get filtered total amount
      Expense.aggregate([
        { $match: query },
        { $group: { _id: null, filteredTotalAmount: { $sum: "$amount" } } },
      ]),
    ]);

    // Calculate total pages
    const totalPages = Math.ceil(filteredTotalRecords / limitNum);

    // Handle cases where no expenses match the query
    const totalAmount =
      totalAmountResult.length > 0 ? totalAmountResult[0].totalAmount : 0;
    const filteredTotalAmount =
      filteredTotalAmountResult.length > 0
        ? filteredTotalAmountResult[0].filteredTotalAmount
        : 0;

    // Prepare response
    res.status(200).json({
      expenses,
      totalRecords, // Total records (all time, no filters)
      totalAmount, // Total amount (all time, no filters)
      filteredTotalRecords, // Records matching current filters
      filteredTotalAmount, // Amount matching current filters
      pagination: {
        currentPage: pageNum,
        totalPages,
        itemsPerPage: limitNum,
        hasNextPage: pageNum < totalPages,
        hasPreviousPage: pageNum > 1,
      },
      success: true,
      message: "Expenses fetched successfully",
    });
  } catch (error) {
    // console.error("Error fetching expenses:", error);
    res.status(500).json({
      success: false,
      message: "some error occurred",
      error: error.message,
    });
  }
};


// Get receipt by fileId
export const getReceipt = async (req, res) => {
  try {
    const { fileId } = req.params;
    
    // Get file info to check if it exists
    const fileInfo = await getFileInfoFromGridFS(fileId);
    if (!fileInfo) {
      return res.status(404).json({
        success: false,
        message: "Receipt not found",
      });
    }

    // Set headers
    res.setHeader("Content-Type", fileInfo.contentType || "application/octet-stream");
    res.setHeader("Content-Disposition", `inline; filename="${fileInfo.filename}"`);

    // Stream the file
    const downloadStream = getFileFromGridFS(fileId);
    downloadStream.pipe(res);
    
    downloadStream.on('error', (error) => {
      console.error('Error streaming file:', error);
      res.status(500).json({
        success: false,
        message: "Error streaming file",
      });
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "some error occurred",
      error: error.message,
    });
  }
};

// Get all expenses without filters
// export const getAllExpenses = async (req, res) => {
//   try {
//     const expenses = await Expense.find({ user: req.user._id })
//       .sort({ createdAt: -1 });

//     // Calculate total amount
//     const totalAmount = expenses.reduce(
//       (sum, expense) => sum + expense.amount,
//       0
//     );

//     // Transform receipt URLs if they exist
//     const baseUrl = `${req.protocol}://${req.get("host")}`;
//     const transformedExpenses = expenses.map((expense) => {
//       const expObj = expense.toObject();
//       if (expObj.receipt) {
//         expObj.receipt.url = `${baseUrl}/api/expenses/receipt/${expObj.receipt.filename}`;
//       }
//       return expObj;
//     });

//     res.status(200).json({
//       success: true,
//       count: expenses.length,
//       totalAmount,
//       expenses: transformedExpenses,
//       message: "Expenses fetched successfully",
//     });
//   } catch (error) {
//     console.error("Error fetching all expenses:", error);
//     res.status(500).json({
//       success: false,
//       message: "some error occurred",
//       error: error.message,
//     });
//   }
// };


// Add expense
// Add expense (updated)
export const addExpense = async (req, res) => {
  try {
    const { description, amount, date, category, paymentMethod, tags } = req.body;

    // Parse tags if provided as a string
    const parsedTags =
      typeof tags === "string"
        ? tags.split(",").map((tag) => tag.trim())
        : tags || [];

    // Upload file to GridFS if exists
    let receipt = null;
    if (req.file) {
      if (req.file.size > 1024 * 1024 * 1) {
        return res.status(400).json({
          success: false,
          message: "Receipt file size exceeds the maximum limit of 1MB, max allowed size is 1MB",
        });
      }
      
      if (!["image/jpeg", "image/png", "application/pdf"].includes(req.file.mimetype)) {
        return res.status(400).json({
          success: false,
          message: "Unsupported receipt file format",
        });
      }
      
      // Upload to GridFS
      receipt = await uploadToGridFS(req.file);
    }

    // Create a new expense
    const newExpense = new Expense({
      user: req.user._id,
      description,
      amount: Number(amount),
      date: new Date(date),
      category,
      paymentMethod,
      tags: parsedTags,
      receipt,
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
            <li><strong>Amount:</strong> ${new Intl.NumberFormat("en-PK", {
              style: "currency",
              currency: "PKR",
            }).format(amount)}</li>
            <li><strong>Category:</strong> ${category}</li>
            <li><strong>Date:</strong> ${new Date(date).toLocaleDateString()}</li>
            <li><strong>Payment Method:</strong> ${paymentMethod}</li>
            ${
              parsedTags.length > 0
                ? `<li><strong>Tags:</strong> ${parsedTags.join(", ")}</li>`
                : ""
            }
            <li><strong>Receipt:</strong> ${receipt ? "uploaded successfully" : "No receipt uploaded"}</li>
          </ul>
        </div>

        ${
          receipt
            ? `
          <div style="margin-top: 20px; text-align: center;">
            <p style="color: #7f8c8d; font-size: 0.9em;">📎 A receipt has been uploaded with this expense.</p>
          </div>
          `
            : ""
        }
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
      subject: "📌 New Expense Added - ApnaKhata",
      html: emailHtml,
    });

    // Respond with success
    res.status(201).json({
      success: true,
      message: "Expense added successfully",
      expense: newExpense,
    });
  } catch (error) {
    // console.error("Error adding expense:", error);
    res.status(500).json({
      success: false,
      message: "Error adding expense",
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
        message: "Expense not found",
      });
    }

    // Add receipt URL if exists
    const expenseObj = expense.toObject();
    if (expenseObj.receipt && expenseObj.receipt.fileId) {
      expenseObj.receipt.url = `${req.protocol}://${req.get("host")}/api/expenses/receipt/${expenseObj.receipt.fileId}`;
    }

    res.status(200).json({
      success: true,
      expense: expenseObj,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching expense",
    });
  }
};
// Update expense
// Update expense (updated)
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
        message: "Expense not found",
      });
    }

    // Parse recurring details
    let parsedRecurringDetails = null;
    if (isRecurring === true || isRecurring === "true") {
      try {
        parsedRecurringDetails =
          typeof recurringDetails === "string"
            ? JSON.parse(recurringDetails)
            : recurringDetails;
      } catch (parseError) {
        parsedRecurringDetails = recurringDetails;
      }
    }

    // Parse tags
    const parsedTags =
      typeof tags === "string"
        ? tags.split(",").map((tag) => tag.trim())
        : tags || [];

    // Update fields
    expense.description = description;
    expense.amount = Number(amount);
    expense.date = new Date(date);
    expense.category = category;
    expense.paymentMethod = paymentMethod;
    expense.tags = parsedTags;
    expense.notes = notes;
    expense.isRecurring = isRecurring === true || isRecurring === "true";
    expense.recurringDetails = parsedRecurringDetails;

    // Handle file upload if a new file is provided
    if (req.file) {
      // Delete old file if exists
      if (expense.receipt && expense.receipt.fileId) {
        await deleteFromGridFS(expense.receipt.fileId);
      }
      
      // Upload new file to GridFS
      expense.receipt = await uploadToGridFS(req.file);
    }

    await expense.save();
    res.status(200).json({
      success: true,
      message: "Expense updated successfully",
      expense,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating expense",
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
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Expense ID is required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid expense ID format",
      });
    }

    const expense = await Expense.findOne({
      _id: id,
      user: req.user._id,
    });

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: "Expense not found",
      });
    }
    
    // Delete associated receipt file from GridFS if exists
    if (expense.receipt?.fileId) {
      await deleteFromGridFS(expense.receipt.fileId);
    }

    await expense.deleteOne();

    res.status(200).json({
      success: true,
      message: "Expense successfully deleted",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting expense",
    });
  }
};


// Get expense statistics
// export const getExpenseStats = async (req, res) => {
//   try {
//     const { startDate, endDate } = req.query;
//     const query = { user: req.user._id };

//     if (startDate) query.date = { $gte: new Date(startDate) };
//     if (endDate) query.date = { ...query.date, $lte: new Date(endDate) };

//     const stats = await Expense.aggregate([
//       { $match: query },
//       {
//         $group: {
//           _id: null,
//           totalAmount: { $sum: "$amount" },
//           averageAmount: { $avg: "$amount" },
//           maxAmount: { $max: "$amount" },
//           minAmount: { $min: "$amount" },
//           count: { $sum: 1 },
//         },
//       },
//     ]);

//     const categoryStats = await Expense.aggregate([
//       { $match: query },
//       {
//         $group: {
//           _id: "$category",
//           total: { $sum: "$amount" },
//           count: { $sum: 1 },
//         },
//       },
//     ]);

//     const paymentMethodStats = await Expense.aggregate([
//       { $match: query },
//       {
//         $group: {
//           _id: "$paymentMethod",
//           total: { $sum: "$amount" },
//           count: { $sum: 1 },
//         },
//       },
//     ]);

//     res.status(200).json({
//       success: true,
//       stats: stats[0] || {},
//       categoryStats,
//       paymentMethodStats,
//     });
//   } catch (error) {
//     console.error("Error getting expense stats:", error);
//     res.status(500).json({
//       success: false,
//       message: "Error getting expense statistics",
//     });
//   }
// };

// Get expenses by category
// export const getExpensesByCategory = async (req, res) => {
//   try {
//     const { startDate, endDate } = req.query;
//     const query = { user: req.user._id };

//     if (startDate) query.date = { $gte: new Date(startDate) };
//     if (endDate) query.date = { ...query.date, $lte: new Date(endDate) };

//     const expenses = await Expense.aggregate([
//       { $match: query },
//       {
//         $group: {
//           _id: "$category",
//           total: { $sum: "$amount" },
//           count: { $sum: 1 },
//           expenses: { $push: "$$ROOT" },
//         },
//       },
//       { $sort: { total: -1 } },
//     ]);

//     res.status(200).json({
//       success: true,
//       expenses,
//     });
//   } catch (error) {
//     console.error("Error getting expenses by category:", error);
//     res.status(500).json({
//       success: false,
//       message: "Error getting expenses by category",
//     });
//   }
// };

// Get monthly expenses
// export const getMonthlyExpenses = async (req, res) => {
//   try {
//     const { year = new Date().getFullYear() } = req.query;

//     const expenses = await Expense.aggregate([
//       {
//         $match: {
//           user: req.user._id,
//           date: {
//             $gte: new Date(`${year}-01-01`),
//             $lte: new Date(`${year}-12-31`),
//           },
//         },
//       },
//       {
//         $group: {
//           _id: { $month: "$date" },
//           total: { $sum: "$amount" },
//           count: { $sum: 1 },
//           expenses: { $push: "$$ROOT" },
//         },
//       },
//       {
//         $project: {
//           month: "$_id",
//           total: 1,
//           count: 1,
//           expenses: 1,
//           _id: 0,
//         },
//       },
//       { $sort: { month: 1 } },
//     ]);

//     res.status(200).json({
//       success: true,
//       year,
//       expenses,
//     });
//   } catch (error) {
//     console.error("Error getting monthly expenses:", error);
//     res.status(500).json({
//       success: false,
//       message: "Error getting monthly expenses",
//     });
//   }
// };

// // Helper function to get file URL
// export const getFileUrl = (req, filename) => {
//   if (!filename) return null;
//   const uploadDir = process.env.NODE_ENV === 'production'
//     ? '/tmp/uploads/receipts'
//     : 'uploads/receipts';
//   return `${req.protocol}://${req.get('host')}/${uploadDir}/${filename}`;
// };

export default {
  getExpenses,
  addExpense,
  getExpenseById,
  updateExpense,
  deleteExpense,
  // getExpenseStats,
  // getExpensesByCategory,
  // getMonthlyExpenses,
};
