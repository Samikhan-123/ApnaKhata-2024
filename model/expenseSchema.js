import mongoose from "mongoose";

const expenseSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      trim: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    paidBy: {
      // Users who have paid their share
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      // Store the user's name
    },
  },
  { timestamps: true }
); 

const Expense = mongoose.model("Expense", expenseSchema);

export default Expense;
