import mongoose from "mongoose";
import Expense from "../model/expenseSchema.js";
// import { sendEmail } from "../utils/emailConfig.js";
// import path from "path";
// import fs from "fs";
// import mime from "mime-types";
// import { fileURLToPath } from "url";
import {
  uploadToGridFS,
  deleteFromGridFS,
  getFileFromGridFS,
  getFileInfoFromGridFS,
} from "../middleware/mutler.js";
// import { newExpenseAddedEmailTemplate } from "../utils/emailMessages.js";

// Get all expenses with pagination and filtering
export const getExpenses = async (req, res) => {
  try {
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

    // Apply filters if provided using conditional approach
    query = {
      ...query,
      ...(category && category !== "all" ? { category } : {}),
      ...(paymentMethod && paymentMethod !== "all" ? { paymentMethod } : {}),
      ...(startDate || endDate ? { date: {} } : {}),
      ...(startDate
        ? {
            date: {
              ...(endDate
                ? {
                    $gte: new Date(startDate),
                    $lte: new Date(endDate).setHours(23, 59, 59, 999),
                  }
                : { $gte: new Date(startDate) }),
            },
          }
        : {}),
      ...(endDate
        ? {
            date: {
              ...query.date,
              $lte: new Date(endDate).setHours(23, 59, 59, 999),
            },
          }
        : {}),
      ...(minAmount || maxAmount ? { amount: {} } : {}),
      ...(minAmount ? { amount: { $gte: Number(minAmount) } } : {}),
      ...(maxAmount
        ? {
            amount: {
              ...query.amount,
              $lte: Number(maxAmount),
              $gte: Number(minAmount) || 0,
            },
          }
        : {}),
      ...(searchTerm
        ? {
            $or: [
              { description: { $regex: searchTerm, $options: "i" } },
              { category: { $regex: searchTerm, $options: "i" } },
              { paymentMethod: { $regex: searchTerm, $options: "i" } },
              { tags: { $in: [new RegExp(`^${searchTerm}$`, "i")] } },
              ...(new RegExp(/^\d{4}-\d{2}-\d{2}$/).test(searchTerm)
                ? [{ date: { $eq: new Date(searchTerm) } }]
                : []),
              ...(new RegExp(/^\d+(\.\d+)?$/).test(searchTerm)
                ? [{ amount: Number(searchTerm) }]
                : []),
              ...(new RegExp(/^\d{4}$/).test(searchTerm)
                ? [{ date: { $gte: new Date(`${searchTerm}-01-01`), $lt: new Date(`${searchTerm}-12-31`) } }]
                : []),
              ...(new RegExp(/^\d{2}$/).test(searchTerm)
                ? [{ date: { $gte: new Date(`${new Date().getFullYear()}-${searchTerm}-01`), $lt: new Date(`${new Date().getFullYear()}-${Number(searchTerm) + 1}-01`) } }]
                : []),
              ...(query.$or || []),
            ],
          }
        : {}),
      ...(tags
        ? {
            $or: [
              {
                tags: {
                  $in: tags.split(",").map((tag) => new RegExp(tag, "i")),
                },
              },
            ],
          }
        : {}),
    };

    // Calculate pagination values
    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.max(1, Number(limit));
    const skip = (pageNum - 1) * limitNum;

    // Get paginated expenses with filters
    const expenses = await Expense.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    // Get total records (ALL records, no filters)
    const totalRecords = await Expense.countDocuments({ user: req.user._id });

    // Get filtered records count
    const filteredTotalRecords = await Expense.countDocuments(query);

    // Get total amount (ALL expenses, no filters)
    const totalAmountResult = await Expense.aggregate([
      { $match: { user: req.user._id } },
      { $group: { _id: null, totalAmount: { $sum: "$amount" } } },
    ]);

    // Get filtered total amount
    const filteredTotalAmountResult = await Expense.aggregate([
      { $match: query },
      { $group: { _id: null, filteredTotalAmount: { $sum: "$amount" } } },
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
// getAnalyticsData
export const getAnalyticsData = async (req, res) => {
  try {
    const userId = req.user._id;

    const expenses = await Expense.find({ user: userId }).sort({ date: -1 });

    if (expenses.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No expenses found",
        data: getEmptyAnalyticsData(),
      });
    }

    const analyticsData = calculateAnalytics(expenses);

    res.status(200).json({
      success: true,
      analyticsData,
    });
  } catch (error) {
    // console.error("Analytics error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching analytics data",
      error: error.message,
    });
  }
};

// Helper function to calculate analytics from expenses
const calculateAnalytics = (expenses) => {
  const totalExpenses = expenses.reduce(
    (sum, expense) => sum + expense.amount,
    0
  );

  const totalMonths = Object.keys(
    expenses.reduce((acc, expense) => {
      const monthYear = new Date(expense.date).toISOString().slice(0, 7);
      acc[monthYear] = (acc[monthYear] || 0) + 1;
      return acc;
    }, {})
  ).length;

  // Calculate monthly breakdown
  const monthlyBreakdown = expenses.reduce((acc, expense) => {
    const monthYear = new Date(expense.date).toISOString().slice(0, 7);
    acc[monthYear] = (acc[monthYear] || 0) + expense.amount;
    return acc;
  }, {});

  const monthlyAverage = totalMonths > 0 ? totalExpenses / totalMonths : 0;
  const averagePerTransaction =
    expenses.length > 0 ? totalExpenses / expenses.length : 0;

  // Find highest and lowest expenses
  const highestExpense = expenses.reduce(
    (max, expense) =>
      expense.amount > max.amount
        ? {
            amount: expense.amount,
            category: expense.category,
            date: expense.date,
          }
        : max,
    { amount: 0, category: "", date: null }
  );

  const lowestExpense = expenses.reduce(
    (min, expense) =>
      expense.amount < min.amount
        ? { amount: expense.amount, category: expense.category, date: expense.date }
        : min,
    { amount: Infinity, category: "" }
  );

  // Get top 3 highest expenses
  const topExpenses = expenses
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 3)
    .map((expense) => ({
      description: expense.description,
      amount: expense.amount,
      category: expense.category,
      date: expense.date,
    }));

  // Calculate category distribution
  const categoryDistribution = expenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {});

  // Calculate payment methods distribution
  const paymentMethods = expenses.reduce((acc, expense) => {
    acc[expense.paymentMethod] =
      (acc[expense.paymentMethod] || 0) + expense.amount;
    return acc;
  }, {});

  return {
    totalExpenses,
    monthlyAverage: Number(monthlyAverage.toFixed(2)),
    averagePerTransaction,
    highestExpense,
    lowestExpense,
    topExpenses,
    monthlyBreakdown,
    categoryDistribution,
    paymentMethods,
    totalTransactions: expenses.length,
    totalMonths,
  };
};

// Helper function for empty analytics data
const getEmptyAnalyticsData = () => ({
  totalExpenses: 0,
  monthlyAverage: 0,
  averagePerTransaction: 0,
  highestExpense: { amount: 0, category: "N/A" },
  lowestExpense: { amount: 0, category: "N/A" },
  topExpenses: [],
  monthlyBreakdown: {},
  categoryDistribution: {},
  paymentMethods: {},
  totalTransactions: 0,
  totalMonths: 0,
});

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
    res.setHeader(
      "Content-Type",
      fileInfo.contentType || "application/octet-stream"
    );
    res.setHeader(
      "Content-Disposition",
      `inline; filename="${fileInfo.filename}"`
    );

    // Stream the file
    const downloadStream = getFileFromGridFS(fileId);
    downloadStream.pipe(res);

    downloadStream.on("error", (error) => {
      console.error("Error streaming file:", error);
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
export const addExpense = async (req, res) => {
  try {
    const { description, amount, date, category, paymentMethod, tags } =
      req.body;

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
          message: "Receipt file size exceeds the maximum limit of 1MB",
        });
      }

      if (
        !["image/jpeg", "image/png", "application/pdf"].includes(
          req.file.mimetype
        )
      ) {
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
    // const emailHtml = newExpenseAddedEmailTemplate(
    //   req.user.name,
    //   description,
    //   amount,
    //   date,
    //   category,
    //   paymentMethod,
    //   parsedTags,
    //   receipt
    // );

    // Validate email template props
    // if (!emailHtml) {
    //   return res.status(500).json({
    //     success: false,
    //     message: "Error generating email template",
    //   });
    // }

    // Send notification email
    // await sendEmail({
    //   email: req.user.email,
    //   subject: "📌 New Expense Added - ApnaKhata",
    //   html: emailHtml,
    // });

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
      message: "Error adding expense: " + error.message,
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
    const { description, amount, date, category, paymentMethod, tags } =
      req.body;

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
};
