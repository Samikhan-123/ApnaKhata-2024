import { google } from "googleapis";
import nodemailer from "nodemailer";

// Function to create a new transporter
export const createTransporter = async () => {
  try {
    // Initialize OAuth2 client with Google credentials
    const oauth2Client = new google.auth.OAuth2(
      process.env.CLIENT_ID,
      process.env.CLIENT_SECRET,
      // process.env.GOOGLE_REFRESH_TOKEN,
      process.env.GOOGLE_REDIRECT_URI
    );
    // Set refresh token from environment variable
    oauth2Client.setCredentials({
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
    });

    // Attempt to get a new access token
    const accessTokenObj = await oauth2Client.getAccessToken();
    const token = accessTokenObj?.token;

    if (!token) {
      throw new Error(
        "Access token not generated. Check refresh token and OAuth credentials"
      );
    }

    // Return the nodemailer transporter config with OAuth2 credentials
    return {
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: process.env.EMAIL_USER,
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
        accessToken: token,
      },
    };
  } catch (error) {
    // console.error('Error creating transporter config:', error);
    throw error;
  }
};

// Function to send email using nodemailer with retry logic
export const sendEmail = async (options) => {
  const maxRetries = 2; // Maximum retry attempts
  let attempt = 0;

  while (attempt <= maxRetries) {
    try {
      const transporterConfig = await createTransporter();
      const transporter = nodemailer.createTransport(transporterConfig);

      const mailOptions = {
        from: `ApnaKhata <${process.env.EMAIL_USER}>`,
        to: options.email,
        subject: options.subject,
        html: options.html,
      };

      // Attempt to send the email
      await transporter.sendMail(mailOptions);
      console.log("Email sent successfully:", options.email);
      return; // Exit after successful email send
    } catch (error) {
      attempt++;
      // console.error(`Attempt ${attempt} failed:`, error);

      // If the maximum retry attempts are reached, throw error
      if (attempt > maxRetries) {
        throw new Error(
          `Attempt ${attempt} failed: Maximum retry attempts reached. Email could not be sent.`
        );
      }

      // If retrying, wait 1 second before trying again
      console.log("Retrying in 1 second...");
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
};

