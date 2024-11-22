import { google } from 'googleapis';
import nodemailer from 'nodemailer';

const OAuth2 = google.auth.OAuth2;
// import dotenv from 'dotenv';
// dotenv.config()

export const createTransporter = async () => {
  try {
    
    const oauth2Client = new google.auth.OAuth2(
      process.env.CLIENT_ID,
      process.env.CLIENT_SECRET,
      'https://developers.google.com/oauthplayground'
    );

    oauth2Client.setCredentials({
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
    });

    const accessTokenObj = await oauth2Client.getAccessToken();
    const token = accessTokenObj?.token;
    // console.log('Access Token:', token); // Log the access token for debugging
    if (!token) {
      throw new Error(
        'Access token not generated. Check refresh token and OAuth credentials.'
      );
    }

    console.log('Access token generated successfully.');

    return {
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: process.env.EMAIL_USER,
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        refreshToken: process.env.GOOGLE_REFRESH_TOKEN, 
        accessToken: token,
      },
      
    };
  } catch (error) {
    console.error('Error creating transporter config:', error);
    throw new Error(
      'Transporter configuration failed. Ensure OAuth and environment variables are correctly set.'
    );
  }
};

export const sendEmail = async (options) => {
  try {
    const transporterConfig = await createTransporter();
    const transporter = nodemailer.createTransport(transporterConfig);

    const mailOptions = {
      from: `ApnaKhata <${process.env.EMAIL_USER}>`,
      to: options.email,
      subject: options.subject,
      // text: options.message,
      html: options.html,
    };

await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', options.email); 
  } catch (error) {
    console.error('Detailed error sending email:', error);
    throw error;
  }
};
