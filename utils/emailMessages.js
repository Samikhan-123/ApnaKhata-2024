// utils/emailTemplates.js

export const formatDate = (date) => {
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Karachi",
  }).format(date);
};

export const passwordResetRequestTemplate = (
  userName,
  resetUrl,
  formattedDate
) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Reset Request</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f9f9f9;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 30px 20px;
            text-align: center;
            color: white;
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 600;
        }
        .content {
            padding: 30px;
        }
        .timestamp {
            background-color: #f8f9fa;
            border: 1px solid #e9ecef;
            border-radius: 6px;
            padding: 12px;
            margin: 20px 0;
            text-align: center;
            font-size: 14px;
            color: #495057;
        }
        .button {
            display: inline-block;
            background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
            color: white;
            padding: 14px 28px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            margin: 20px 0;
            text-align: center;
        }
        .footer {
            background-color: #f8f9fa;
            padding: 20px;
            text-align: center;
            font-size: 14px;
            color: #6c757d;
            border-top: 1px solid #e9ecef;
        }
        .security-note {
            background-color: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: 6px;
            padding: 15px;
            margin: 20px 0;
            color: #856404;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Password Reset Request</h1>
        </div>
        
        <div class="content">
            <h2>Dear ${userName},</h2>
            
            <p>You have requested to reset your password for your ApnaKhata account.</p>
            
            <div class="timestamp">
                Request initiated on: ${formattedDate}
            </div>
            
            <p>Please click the button below to set a new password:</p>
            
            <div style="text-align: center;">
                <a href="${resetUrl}" class="button">Reset Password</a>
            </div>
            
            <div class="security-note">
                <strong>Important:</strong> This link will expire in 10 minutes for security reasons.
                If you did not request this password reset, please ignore this email and ensure your account is secure.
            </div>
            
            <p>For security reasons, we recommend:</p>
            <ul>
                <li>Using a strong, unique password</li>
                <li>Enabling two-factor authentication if available</li>
                <li>Regularly updating your password</li>
            </ul>
        </div>
        
        <div class="footer">
            <p>Best Regards,<br>The ApnaKhata Team</p>
            <p>© ${new Date().getFullYear()} ApnaKhata Expense Tracker. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
`;

export const passwordResetSuccessTemplate = (userName, formattedDate) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Reset Successful</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f9f9f9;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
            background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
            padding: 30px 20px;
            text-align: center;
            color: white;
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 600;
        }
        .content {
            padding: 30px;
        }
        .timestamp {
            background-color: #f8f9fa;
            border: 1px solid #e9ecef;
            border-radius: 6px;
            padding: 12px;
            margin: 20px 0;
            text-align: center;
            font-size: 14px;
            color: #495057;
        }
        .success-icon {
            text-align: center;
            font-size: 48px;
            color: #28a745;
            margin: 20px 0;
        }
        .security-tips {
            background-color: #e7f3ff;
            border: 1px solid #b8daff;
            border-radius: 6px;
            padding: 20px;
            margin: 20px 0;
        }
        .security-tips h3 {
            color: #004085;
            margin-top: 0;
        }
        .footer {
            background-color: #f8f9fa;
            padding: 20px;
            text-align: center;
            font-size: 14px;
            color: #6c757d;
            border-top: 1px solid #e9ecef;
        }
        .warning {
            background-color: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: 6px;
            padding: 15px;
            margin: 20px 0;
            color: #856404;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Password Reset Successful</h1>
        </div>
        
        <div class="content">
            <div class="success-icon">✓</div>
            
            <h2>Dear ${userName},</h2>
            
            <p>Your password was successfully changed for your ApnaKhata account.</p>
            
            <div class="timestamp">
                Password changed on: ${formattedDate}
            </div>
            
            <div class="warning">
                <strong>Security Notice:</strong> If you did not request this change, 
                please contact our support email immediately to secure your account.
            </div>
            
            <div class="security-tips">
                <h3>🔒 Security Tips:</h3>
                <ul>
                    <li>Use a strong, unique password that you don't use elsewhere</li>
                    <li>Enable two-factor authentication for added security</li>
                    <li>Avoid using personal information in your password</li>
                    <li>Consider using a password manager</li>
                    <li>Regularly update your password every 3-6 months</li>
                </ul>
            </div>
            
            <p>Thank you for helping us keep your account secure!</p>
        </div>
        
        <div class="footer">
            <p>Best Regards,<br>The ApnaKhata Team</p>
            <p>© ${new Date().getFullYear()} ApnaKhata Expense Tracker. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
`;

export const newExpenseAddedEmailTemplate = (
  userName,
  description,
  amount,
  date,
  category,
  paymentMethod,
  parsedTags,
  receipt
) =>
  `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Expense Added - ApnaKhata</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #2c3e50;
            background-color: #f8f9fa;
            margin: 0;
            padding: 20px;
        }
        
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
        }
        
        .email-header {
            background: #660B05;
            padding: 20px;
            text-align: center;
            color: white;
        }
        
        .email-header h2 {
            font-size: 20px;
            font-weight: 700;
            margin-bottom: 10px;
        }
        
        .email-header p {
            font-size: 16px;
            opacity: 0.9;
            font-weight: 300;
        }
        
        .email-body {
            padding: 30px;
        }
        
        .expense-summary {
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
            border-radius: 12px;
            padding: 25px;
            margin: 20px 0;
            border-left: 4px solid #667eea;
        }
        
        .expense-summary h3 {
            color: #2c3e50;
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 20px;
            display: flex;
            align-items: center;
        }
        
        .expense-summary h3:before {
            content: "💼";
            margin-right: 10px;
        }
        
        .expense-details {
            list-style: none;
            padding: 0;
        }
        
        .expense-details li {
            display: flex;
            justify-content: space-between;
            padding: 12px 0;
            border-bottom: 1px solid rgba(0, 0, 0, 0.05);
        }
        
        .expense-details li:last-child {
            border-bottom: none;
        }
        
        .expense-details strong {
            color: #2c3e50;
            font-weight: 600;
            min-width: 120px;
        }
        
        .expense-details span {
            color: #5a6c7d;
            text-align: right;
            flex: 1;
        }
        
        .amount-highlight {
            color: #e74c3c !important;
            font-weight: 600;
            font-size: 1.1em;
        }
        
        .receipt-section {
            background: #fff8e6;
            border: 1px solid #ffeaa7;
            border-radius: 8px;
            padding: 15px;
            margin: 20px 0;
            text-align: center;
        }
        
        .receipt-icon {
            font-size: 24px;
            margin-bottom: 10px;
        }
        
        .wisdom-quote {
            background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
            border-radius: 8px;
            padding: 20px;
            margin: 25px 0;
            text-align: center;
            font-style: italic;
            color: #1565c0;
            border-left: 4px solid #1976d2;
        }
        
        .quote-icon {
            font-size: 24px;
            margin-bottom: 10px;
            display: block;
        }
        
        .email-footer {
            background: #2c3e50;
            color: white;
            padding: 25px;
            text-align: center;
            border-radius: 0 0 16px 16px;
        }
        
        .footer-logo {
            font-size: 24px;
            font-weight: 700;
            margin-bottom: 15px;
            color: #fff;
        }
        
        .footer-text {
            font-size: 14px;
            opacity: 0.8;
            line-height: 1.5;
        }
        
        
        @media (max-width: 600px) {
            .email-body {
                padding: 20px;
            }
            
            .expense-details li {
                flex-direction: column;
                gap: 5px;
            }
            
            .expense-details span {
                text-align: left;
            }
            
            .email-header h2 {
                font-size: 20px;
            }
        }
        
        .category-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 500;
            color: white;
        }
        
        .tag-pill {
            display: inline-block;
            padding: 4px 10px;
            border-radius: 12px;
            font-size: 11px;
            background: #e8eaf6;
            color: #3f51b5;
            margin: 2px;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <!-- Header -->
        <div class="email-header">
            <p>Your expense has been successfully added to ApnaKhata</p>
        </div>
        
        <!-- Body -->
        <div class="email-body">
            <h3>Hello, ${userName}</h3>
            <p>We're confirming that a new expense has been added to your account. Here's a summary of the transaction:</p>
            
            <!-- Expense Summary -->
            <div class="expense-summary">
                <h3>Expense Details</h3>
                <ul class="expense-details">
                    <li>
                        <strong>Description:</strong>
                        <span>${description}</span>
                    </li>
                    <li>
                        <strong>Amount:</strong>
                        <span class="amount-highlight">${new Intl.NumberFormat(
                          "en-PK",
                          {
                            style: "currency",
                            currency: "PKR",
                          }
                        ).format(amount)}</span>
                    </li>
                    <li>
                        <strong>Category:</strong>
                        <span><span class="category-badge">${category}</span></span>
                    </li>
                    <li>
                        <strong>Date:</strong>
                        <span>${new Date(date).toLocaleDateString("en-PK", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}</span>
                    </li>
                    <li>
                        <strong>Payment Method:</strong>
                        <span>${paymentMethod}</span>
                    </li>
                    ${
                      Array.isArray(parsedTags) && parsedTags?.length > 0
                        ? `<li>
                            <strong>Tags:</strong>
                            <span>${parsedTags?.map((tag) => `<span class="tag-pill">${tag}</span>`).join(" ")}</span>
                           </li>`
                        : ""
                    }
                </ul>
            </div>
            
            <!-- Receipt Information -->
            ${
              receipt
                ? `<div class="receipt-section">
                    <div class="receipt-icon">📎</div>
                    <p><strong>Receipt Attached</strong><br>
                    A digital receipt has been uploaded with this expense for your records.</p>
                   </div>`
                : ""
            }
            
            <!-- Financial Wisdom -->
            <div class="wisdom-quote">
                <span class="quote-icon">💡</span>
                <p>"بغیر منصوبہ بندی کے خرچ زندگی کو مشکلات میں ڈال سکتا ہے، ہمیشہ اپنے بجٹ کے اصولوں پر چلیں اور مالی سکون حاصل کریں۔"</p>
                <p style="margin-top: 10px; font-size: 0.9em;">- ApnaKhata Financial Wisdom</p>
            </div>
            
            <p>Thank you for using ApnaKhata to manage your expenses. We're here to help you achieve financial wellness.</p>
            
            <p>Best regards,<br>The ApnaKhata Team</p>
        </div>
        
        <!-- Footer -->
        <div class="email-footer">
            <div class="footer-logo">ApnaKhata</div>
            <div class="footer-text">
                <p>Your personal expense tracker for better financial management</p>
                <p>This is an automated notification. Please do not reply to this email.</p>
            </div>
           
        </div>
    </div>
</body>
</html>
`;
