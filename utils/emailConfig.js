import nodemailer from "nodemailer";

// Function to create a new transporter
export const createTransporter = async () => {
  try {
    // For production, use App Password approach (more reliable)
    if (!process.env.EMAIL_USER || !process.env.EMAIL_APP_PASSWORD) {
      console.error("Email credentials are not properly configured");
      return null;
    }

    return nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD,
      },
    });
  } catch (error) {
    console.error("Error creating transporter config:", error.message); 
    return null;
  }
};

// Function to send email using nodemailer with retry logic
export const sendEmail = async (options, res = null) => {
  const maxRetries = 2; // Maximum retry attempts
  let attempt = 1;

  while (attempt <= maxRetries) {
    try {
      const transporter = await createTransporter();

      // if (!transporter) {
      //   throw new Error("Failed to create email transporter");
      //   // console.log()
      //   // res.status(500).json({
      //   //   success: false,
      //   //   message: "Failed to create email transporter",
      //   // });
      // }

      const mailOptions = {
        from: `ApnaKhata <${process.env.EMAIL_USER}>`,
        to: options.email,
        subject: options.subject,
        html: options.html,
      };

      // Attempt to send the email
      await transporter.sendMail(mailOptions);
      console.log("Email sent successfully to:", options.email);
      return true; // Success
    } catch (error) {
      attempt++;
      console.error(`Attempt ${attempt} failed:`, error.message);

      // If the maximum retry attempts are reached
      if (attempt > maxRetries) {
        console.error(
          "Maximum retry attempts reached. Email could not be sent."
        );

        // Only send response if res object is provided
        if (res) {
          return res.status(500).json({
            success: false,
            message: "Email could not be sent after multiple attempts.",
          });
        }
        return false; // Failure but no response sent
      }

      // If retrying, wait 1 second before trying again
      console.log("Retrying in 1 second...");
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
};
