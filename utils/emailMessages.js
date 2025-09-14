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

export const welcomeEmailTemplate = (userName, appUrl) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to ApnaKhata</title>
    <style>
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
            border-radius: 20px;
            overflow: hidden;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
        }
        
        .email-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 40px 20px;
            text-align: center;
            color: white;
        }
        
        .email-header h1 {
            font-size: 32px;
            font-weight: 700;
            margin-bottom: 15px;
        }
        
        .email-header p {
            font-size: 18px;
            opacity: 0.9;
            font-weight: 300;
        }
        
        .logo-container {
            margin-bottom: 25px;
        }
        
        .logo {
            font-size: 36px;
            font-weight: 700;
            color: white;
            display: inline-block;
            padding: 15px 25px;
            background: rgba(255, 255, 255, 0.15);
            border-radius: 16px;
        }
        
        .email-body {
            padding: 40px;
        }
        
        .welcome-section {
            text-align: center;
            margin-bottom: 30px;
        }
        
        .welcome-icon {
            font-size: 48px;
            color: #667eea;
            margin-bottom: 20px;
        }
        
        .welcome-section h2 {
            color: #2c3e50;
            font-size: 28px;
            font-weight: 600;
            margin-bottom: 15px;
        }
        
        .welcome-section p {
            color: #5a6c7d;
            font-size: 16px;
            margin-bottom: 20px;
        }
        
        .features-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 20px;
            margin: 30px 0;
        }
        
        .feature-card {
            background: rgba(102, 126, 234, 0.05);
            border-radius: 12px;
            padding: 20px;
            text-align: center;
        }
        
        .feature-icon {
            font-size: 24px;
            color: #667eea;
            margin-bottom: 15px;
        }
        
        .feature-card h3 {
            font-size: 16px;
            font-weight: 600;
            color: #2c3e50;
            margin-bottom: 10px;
        }
        
        .feature-card p {
            font-size: 14px;
            color: #5a6c7d;
        }
        
        .cta-section {
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
            border-radius: 16px;
            padding: 30px;
            text-align: center;
            margin: 30px 0;
        }
        
        .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 16px 32px;
            text-decoration: none;
            border-radius: 50px;
            font-weight: 600;
            font-size: 16px;
            margin: 20px 0;
        }
        
        .security-note {
            background: rgba(40, 167, 69, 0.1);
            border: 1px solid rgba(40, 167, 69, 0.2);
            border-radius: 12px;
            padding: 20px;
            margin: 30px 0;
            text-align: center;
        }
        
        .security-note h3 {
            color: #28a745;
            font-size: 18px;
            margin-bottom: 10px;
        }
        
        .support-section {
            text-align: center;
            margin: 30px 0;
            padding: 25px;
            background: rgba(248, 249, 250, 0.8);
            border-radius: 16px;
        }
        
        .support-section h3 {
            color: #2c3e50;
            margin-bottom: 15px;
        }
        
        .support-contact {
            color: #667eea;
            font-weight: 600;
            text-decoration: none;
        }
        
        .email-footer {
            background: #2c3e50;
            color: white;
            padding: 30px;
            text-align: center;
        }
        
        .footer-logo {
            font-size: 24px;
            font-weight: 700;
            margin-bottom: 20px;
        }
        
        .footer-links {
            margin: 20px 0;
        }
        
        .footer-links a {
            color: #bbdefb;
            text-decoration: none;
            margin: 0 15px;
            font-size: 14px;
        }
        
        .copyright {
            font-size: 14px;
            opacity: 0.8;
            margin-top: 20px;
        }
        
        @media (max-width: 600px) {
            .features-grid {
                grid-template-columns: 1fr;
            }
            
            .email-body {
                padding: 25px;
            }
            
            .email-header {
                padding: 30px 15px;
            }
        }
        
        .highlight {
            color: #667eea;
            font-weight: 600;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="email-header">
            <div class="logo-container">
                <div class="logo">ApnaKhata</div>
            </div>
            <h1>Welcome to ApnaKhata! 🎉</h1>
            <p>Your journey to better financial management starts here</p>
        </div>
        
        <div class="email-body">
            <div class="welcome-section">
                <div class="welcome-icon">👋</div>
                <h2>Hello ${userName},</h2>
                <p>Thank you for joining <span class="highlight">ApnaKhata</span> - your personal expense tracking solution. We're thrilled to have you on board!</p>
                <p>Your account has been successfully created and is ready to use. Now you can take control of your finances with our powerful tools.</p>
            </div>
            
            <h3 style="text-align: center; color: #2c3e50; margin-bottom: 20px;">Here's what you can do with ApnaKhata:</h3>
            <div class="features-grid">
                <div class="feature-card">
                    <div class="feature-icon">💰</div>
                    <h3>Track Expenses</h3>
                    <p>Easily record and categorize your daily expenses</p>
                </div>
                <div class="feature-card">
                    <div class="feature-icon">📊</div>
                    <h3>Visual Analytics</h3>
                    <p>View spending patterns with beautiful charts</p>
                </div>
                <div class="feature-card">
                    <div class="feature-icon">📱</div>
                    <h3>Multi-Device Sync</h3>
                    <p>Access your data anywhere, anytime</p>
                </div>
                <div class="feature-card">
                    <div class="feature-icon">🔒</div>
                    <h3>Secure Data</h3>
                    <p>Your financial information is protected</p>
                </div>
            </div>
            
            <div class="cta-section">
                <h3>Ready to get started?</h3>
                <p>Begin your financial journey by adding your first expense</p>
                <a href="${appUrl}/expenses" class="cta-button">Go to Dashboard</a>
            </div>
            
            <div class="security-note">
                <h3>🔒 Account Security</h3>
                <p>For your security, we recommend verifying your email address and setting up two-factor authentication in your account settings.</p>
            </div>
            
            <div class="support-section">
                <h3>Need Help?</h3>
                <p>Check out our <a href="${appUrl}/help" class="support-contact">Help Center</a> for guides and tutorials</p>
                <p>Or contact our support team at <a href="mailto:support@apnakhata.com" class="support-contact">support@apnakhata.com</a></p>
            </div>
        </div>
        
        <div class="email-footer">
            <div class="footer-logo">ApnaKhata</div>
            <p>Your personal expense tracker for better financial management</p>
            
            <div class="footer-links">
                <a href="${appUrl}/privacy">Privacy Policy</a>
                <a href="${appUrl}/terms">Terms of Service</a>
            </div>
            
            <p class="copyright">© 2024 ApnaKhata. All rights reserved.</p>
            <p class="copyright">This is an automated message. Please do not reply to this email.</p>
        </div>
    </div>
</body>
</html>
`;
};

// The rest of your templates (passwordResetRequestTemplate, passwordResetSuccessTemplate, 
// newExpenseAddedEmailTemplate)

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
