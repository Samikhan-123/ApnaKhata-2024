import mongoose from "mongoose";
import Expense from "../model/expenseSchema.js";
import { sendEmail } from "../utils/sendEmail.js";
import User from "../model/userSchema.js";

// Add expense

export const addExpense = async (req, res) => {
  try {
    const { userId, amount, description, date,paidBy } = req.body; // Get required fields
    if (!paidBy) { 
      return res.status(400).json({ message: "The 'paidBy' field is required" });
    }

    // Validate request body
    if (!userId || !amount || !description || !date) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Create and save the new expense
    const newExpense = new Expense({
      userId,
      amount,
      description,
      date,
      paidBy,

    });

    await newExpense.save();

    // Find all users to send emails ( need to store emails in the database)
    const users = await User.find({}, "email name"); // Fetch all user emails and names

    if (users.length > 0) {
      // Send email notifications to all users

      // Use `forEach` to loop over all users
      users.forEach((user) => {
        const formattedDate = new Date(date).toLocaleString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          hour12: true, // Use 12-hour format
        });
        const message =
          `Advice: Sab se pahle app ne ghabrana nhe hai. 😛\n\n` + // Added advice here
          `Hello ${user.name},\n\n` +
          `We hope you are doing well!\n\n` +
          `A user has just added a new expense:\n\n` +
          `Description: ${description}\n` +
          `Amount: ${amount}\n\n` +
          `Date: ${formattedDate}\n\n` +
          `You can view and check these expenses through the app.\n` +
          `Best regards,\n` +
          `The ApnaKhata Team`;

        sendEmail({
          email: user.email,
          subject: "New Expense Added",
          message,
        });
      });
    }

    res
      .status(201)
      .json({
        message: "Expense added and emails sent successfully",
        expense: newExpense.length,
        users: users.length,
      });
  } catch (error) {
    console.error("Error adding expense or sending emails:", error);
    res.status(500).json({
      message: "Error adding expense or sending emails",
      error: error.message,
    });
  }
};

// Get all expenses for a user
export const getExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find()
      .populate("userId", "name") // Populate the user who posted the expense
      .populate("paidBy", "name") // Populate users who have paid
      .sort({ createdAt: -1 }); // Sort by createdAt in descending order

    res.status(200).json(expenses);
  } catch (error) {
    console.error("Error fetching expenses:", error);
    res.status(500).json({ message: "Server error" });
  }
};

//  to get an expense by ID
export const getExpenseById = async (req, res) => {
  try {
    const expenseId = req.params.id;

    if (!expenseId) {
      return res.status(400).json({ message: "Expense ID is required" });
    }

    // Check if the ID is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(expenseId)) {
      return res.status(400).json({ message: "Invalid expense ID format" });
    }

    const expense = await Expense.findById(expenseId);

    if (!expense) {
      return res.status(404).json({ message: "Expense id not found" });
    }

    res.status(200).json(expense);
  } catch (error) {
    console.error("Error fetching expense:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Edit expense
export const editExpense = async (req, res) => {
  try {
    const { expenseId } = req.params; // Get expenseId from URL parameters
    const { amount, description, date } = req.body; // Updated fields

    if (!amount || !description || !date) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Find the expense by ID and update
    const updatedExpense = await Expense.findByIdAndUpdate(
      expenseId,
      { amount, description, date },
      { new: true } // Return the updated document
    );

    if (!updatedExpense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    res.status(200).json({
      message: "Expense updated successfully",
      expense: updatedExpense,
    });
  } catch (error) {
    console.error("Error editing expense:", error); // Log the error
    res
      .status(500)
      .json({ message: "Error editing expense", error: error.message });
  }
};

// Delete expense
export const deleteExpense = async (req, res) => {
  try {
    const { expenseId } = req.params; // Get expenseId from URL parameters

    // Find the expense by ID and delete
    const deletedExpense = await Expense.findByIdAndDelete(expenseId);

    if (!deletedExpense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    res.status(200).json({ message: "Expense deleted successfully" });
  } catch (error) {
    console.error("Error deleting expense:", error); // Log the error
    res
      .status(500)
      .json({ message: "Error deleting expense", error: error.message });
  }
};

// expenseController.js

export const updateExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, amount, description, date } = req.body;

    const updatedExpense = await Expense.findByIdAndUpdate(
      id,
      { name, amount, description, date },
      { new: true, runValidators: true }
    );

    if (!updatedExpense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    res.status(200).json(updatedExpense);
  } catch (error) {
    console.error("Error updating expense:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get an user expense by ID
export const getExpensesByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    // No need to cast to ObjectId, Mongoose will handle it automatically
    const expenses = await Expense.find({ userId });

    // if (!expenses || expenses.length === 0) {
    //   return res
    //     .status(404)
    //     .json({ message: "No expenses found for this user" });
    // }

    res.status(200).json(expenses);
  } catch (error) {
    console.error("Error fetching expenses:", error);
    res.status(500).json({ message: "Error fetching expenses", error });
  }
};

// controllers/expenseController.js
// Existing controllers...

// Mark Expense as Paid
export const markExpenseAsPaid = async (req, res) => {
  try {
    const expenseId = req.params.id;
    const userId = req.user._id; // Assuming authentication middleware sets req.user

    const expense = await Expense.findById(expenseId);
    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    if (expense.paidBy.includes(userId)) {
      return res
        .status(400)
        .json({ message: "Expense already marked as paid" });
    }

    expense.paidBy.push(userId);
    await expense.save();

    res.status(200).json({ message: "Expense marked as paid", expense });
  } catch (error) {
    console.error("Error marking expense as paid:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const sendMailToUsersToAddExpense = async (req, res) => {
  const { email } = req.body;

  try {
    const emails = await User.find({ email });

    if (!emails) {
      return res.status(404).json({ message: "emails not found" });
    }

    await emails.save();

    const message = `Hello this is a notification that an expense has been added to your account.\n\n`;

    await sendEmail({
      email: emails.email,
      subject: "Expense Alert",
      message,
    });

    res.status(200).json({ message: "Password reset email sent!" });
  } catch (error) {
    console.error("Detailed error in forgotPassword:", error);

    res.status(500).json({
      message: "Error sending email. Please try again later.",
      error: error.message,
    });
  }
};
