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
