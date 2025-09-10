import mongoose from "mongoose";

const expenseSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
      validate: {
        validator: (val) => !isNaN(val),
        message: ({ value }) => `${value} is not a valid number`,
      },
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    category: {
      type: String,
      required: true,
      enum: [
        "Food & Dining",
        "Shopping",
        "Transportation",
        "Bills & Utilities",
        "Entertainment",
        "Health & Fitness",
        "Travel",
        "Education",
        "Personal Care",
        "Others",
      ],
    },
    paymentMethod: {
      type: String,
      required: true,
      enum: [
        "Cash",
        "Credit Card",
        "Debit Card",
        "JazzCash",
        "EasyPaisa",
        "Other",
      ],
    },
    receipt: {
      fileId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Receipt",
      },
      filename: String,
      contentType: String,
      originalName: String,
    },
    tags: {
      type: [String],
      required: true,
    },
  },
  { timestamps: true }
);

expenseSchema.index({ date: -1 });

const Expense = mongoose.model("Expense", expenseSchema);
export default Expense;
