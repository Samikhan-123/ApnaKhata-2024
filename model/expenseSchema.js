import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
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
        'Food & Dining',
        'Shopping',
        'Transportation',
        'Bills & Utilities',
        'Entertainment',
        'Health & Fitness',
        'Travel',
        'Education',
        'Personal Care',
        'Others',
      ],
    },
    paymentMethod: {
      type: String,
      required: true,
      enum: [
        'Cash',
        'Credit Card',
        'Debit Card',
        'JazzCash',
        'EasyPaisa',
        'Other',
      ],
    },
    receipt: {
      filename: String,
      path: String,
      mimetype: String,
    },
    tags: {
      type: [String],
      required: true,
    },
    notes: {
      type: String,
      required: false,
    },
  },
  { timestamps: true }
);

// // Important: Keep this toJSON method to ensure consistent ID field
// expenseSchema.methods.toJSON = function () {
//   const obj = this.toObject();
//   obj.id = obj._id.toString();
//   delete obj._id;
//   delete obj.__v;
//   return obj;
// };

const Expense = mongoose.model('Expense', expenseSchema);
export default Expense;
