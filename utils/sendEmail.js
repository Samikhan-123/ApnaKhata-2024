import nodemailer from 'nodemailer';
import { createTransporter } from '../utils/emailConfig.js';
// import { createTransporter } from '../config/emailConfig.js';

export const sendEmail = async (options) => {
  try {
    const transporterConfig = await createTransporter();
    const transporter = nodemailer.createTransport(transporterConfig);

    const mailOptions = {
      from: `ApnaKhata <${process.env.EMAIL_USER}>`,
      to: options.email,
      subject: options.subject,
      text: options.message,
      html: options.html, // HTML version

    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.response);
    return info;
  } catch (error) {
    console.error('Detailed error sending email:', error);
    throw error;
  }
};