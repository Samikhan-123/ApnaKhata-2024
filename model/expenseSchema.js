import mongoose from "mongoose";

const expenseSchema = new mongoose.Schema(
  {


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
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      name: {
        type: String,
        required: true,
      }, 
    },
  },
  { timestamps: true }
); 

const Expense = mongoose.model("Expense", expenseSchema);

export default Expense;
