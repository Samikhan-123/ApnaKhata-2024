import mongoose from "mongoose";
import Expense from "../model/expenseSchema.js";
import { sendEmail } from "../utils/sendEmail.js";
import User from "../model/userSchema.js";

// Add expense
export const addExpense = async (req, res) => {
  try {
    const { amount, description, date, paidBy } = req.body;

    // Validate request body
    // if (!paidBy) {
    //   return res.status(400).json({ message: "The 'paidBy' field is required" });
    // }

    if (!amount || !description || !date) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await User.findById(paidBy); // Find user by paidBy field
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Create and save the new expense
    const newExpense = new Expense({
      amount,
      description,
      date,
      paidBy: {
        userId: user._id,
        name: user.name,
      },
    });

    await newExpense.save();

    // Find all users to send emails
    const users = await User.find({}, "email name");

    // Check if there are users to send emails to
    if (users.length > 0) { 
      // Send email notifications to all users using try-catch
      users.forEach(async (user) => {
        const formattedDate = new Date(date).toLocaleString("en-GB", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
          timeZone: "Asia/Karachi", // Adjust for GMT+
          timeZoneName: "short ( GMT+ 00:00:00 GMT )", //
        });

        const message = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>New Expense Notification</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    line-height: 1.6;
                    background-color: #f9f9f9;
                    color: #333;
                    margin: 0;
                    padding: 20px;
                }
                .container {
                    background-color: #fff;
                    padding: 20px;
                    border-radius: 5px;
                    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
                }
                h2 {
                    color: #4CAF50;
                }
                h3 {
                    color: #2196F3;
                }
                .highlight {
                    color: #FF5722;
                    font-weight: bold;
                }
                footer {
                    margin-top: 20px;
                    font-size: 0.8em;
                    color: #777;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <p>Hello <strong>${user.name}</strong>,</p>
                <p>We hope you are doing well!</p>
                <h3>New Expense Added By a User</h3>
                <p>
                    <strong>Description:</strong> <span class="highlight">${description}</span><br>
                    <strong>Amount:</strong> <span class="highlight">Rs .... </span><br>
                    <strong>Date:</strong> <span class="highlight">${formattedDate}</span>
                </p>
                <p>You can view and check these expenses through the ApnaKhata.</p>
                <p>Best regards,</p>
                <p><strong>The ApnaKhata Team</strong></p>
                <footer>
                    <p>Thank you for using ApnaKhata!</p>
                </footer>
            </div>
        </body>
        </html>
        `;

        try {
          await sendEmail({
            email: user.email,
            subject: "New Expense Added",
            html: message,
          });
          console.log(`Email sent to ${user.email}`);
        } catch (emailError) {
          console.error(`Error sending email to ${user.email}:`, emailError.message);
          // Optionally, you can log the email error somewhere for tracking
        }
      });
    }

    res.status(201).json({
      message: "Expense added and emails sent successfully",
      expense: newExpense,
      usersNotified: users.length,
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
      // .populate("userId", "name") // Populate the user who posted the expense
      .populate("paidBy", "name") // Populate users who have paid and posted the expense
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
// export const getExpensesByUserId = async (req, res) => {
//   try {
//     const { userId } = req.params;

//     // Fetch expenses where the paidBy.userId matches the provided userId
//     const expenses = await Expense.find({ "paidBy.userId": userId });

//     if (!expenses || expenses.length === 0) {
//       return res.status(404).json({ message: "No expenses found for this user" });
//     }

//     return res.status(200).json(expenses);
//   } catch (err) {
//     console.error("Error fetching expenses:", err);
//     return res.status(500).json({ message: "Something went wrong" });
//   }
// };

// controllers/expenseController.js
// Existing controllers...

// Mark Expense as Paid
// export const markExpenseAsPaid = async (req, res) => {
//   try {
//     const expenseId = req.params.id;
//     const userId = req.user._id; // Assuming authentication middleware sets req.user

//     const expense = await Expense.findById(expenseId);
//     if (!expense) {
//       return res.status(404).json({ message: "Expense not found" });
//     }

//     if (expense.paidBy.includes(userId)) {
//       return res
//         .status(400)
//         .json({ message: "Expense already marked as paid" });
//     }

//     expense.paidBy.push(userId);
//     await expense.save();

//     res.status(200).json({ message: "Expense marked as paid", expense });
//   } catch (error) {
//     console.error("Error marking expense as paid:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// };

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
