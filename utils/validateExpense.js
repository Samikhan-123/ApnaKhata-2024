// Previous code was using default export, let's change it to named export
export const validateExpense = (req, res, next) => {
  try {
    const { amount, description, date, category, paymentMethod } = req.body;

    const errors = [];

    // Validate amount
    if (!amount || amount <= 0) {
      errors.push('Amount must be greater than 0');
    }

    // Validate description
    if (!description || description.trim().length < 3) {
      errors.push('Description must be at least 3 characters long');
    }
    if (description && description.length > 200) {
      errors.push('Description cannot exceed 200 characters');
    }

    // Validate date
    if (!date) {
      errors.push('Date is required');
    }
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      errors.push('Invalid date format');
    }
    // if (dateObj > new Date()) {
    //   errors.push('Date cannot be in the future');
    // }

    // Validate category
    const validCategories = [
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
    ];
    if (!category || !validCategories.includes(category)) {
      errors.push('Invalid category');
    }

    // Validate payment method
    const validPaymentMethods = [
      'Cash',
      'Credit Card',
      'Debit Card',
      'UPI',
      'Net Banking',
      'Other',
    ];
    if (!paymentMethod || !validPaymentMethods.includes(paymentMethod)) {
      errors.push('Invalid payment method');
    }

    // Validate tags (if provided)
    if (req.body.tags) {
      if (typeof req.body.tags === 'string') {
        const tags = req.body.tags.split(',').map((tag) => tag.trim());
        if (tags.some((tag) => tag.length > 20)) {
          errors.push('Individual tags cannot exceed 20 characters');
        }
        if (tags.length > 10) {
          errors.push('Maximum 10 tags allowed');
        }
      }
    }

    // Validate notes (if provided)
    if (req.body.notes && req.body.notes.length > 500) {
      errors.push('Notes cannot exceed 500 characters');
    }

    // Validate recurring expense details (if provided)
    if (req.body.isRecurring === 'true' || req.body.isRecurring === true) {
      const recurringDetails =
        typeof req.body.recurringDetails === 'string'
          ? JSON.parse(req.body.recurringDetails)
          : req.body.recurringDetails;

      if (!recurringDetails) {
        errors.push('Recurring details are required for recurring expenses');
      } else {
        // Validate frequency
        const validFrequencies = ['daily', 'weekly', 'monthly', 'yearly'];
        if (!validFrequencies.includes(recurringDetails.frequency)) {
          errors.push('Invalid recurring frequency');
        }

        // Validate end date if provided
        if (recurringDetails.endDate) {
          const endDate = new Date(recurringDetails.endDate);
          const startDate = new Date(date);
          if (isNaN(endDate.getTime())) {
            errors.push('Invalid recurring end date format');
          }
          if (endDate <= startDate) {
            errors.push('Recurring end date must be after start date');
          }
        }
      }
    }

    // If there are validation errors, return them
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: errors,
        errors: errors,
      });
    }

    // If validation passes, proceed to next middleware
    next();
  } catch (error) {
    console.error('Expense validation error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error validating expense data',
      error: error.message,
    });
  }
};

// You can also export other validation-related utilities if needed
export const validateCategories = [
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
];

export const validatePaymentMethods = [
  'Cash',
  'Credit Card',
  'Debit Card',
  'UPI',
  'Net Banking',
  'Other',
];
