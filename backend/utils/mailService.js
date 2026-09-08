const nodemailer = require('nodemailer');
require('dotenv').config();
const fs = require('fs');
const path = require('path');

const transporter = nodemailer.createTransport({
  service: 'gmail', // or 'hotmail' for Outlook
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // App password for Gmail or real password for Outlook
  },
});

const sendEmail = async (to, subject, text, html = '') => {
  try {
    const attachments = [
      {
        filename: 'logoLart.png',
        path: path.join(__dirname, '../../client/public/logoLart.png'), // Adjust the path here
        cid: 'pawlogo' // same CID used in the HTML img src
      }
    ];

    const info = await transporter.sendMail({
      from: `Pet Care App <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html,
      attachments
    });

    console.log('Email sent:', info.response);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

module.exports = { sendEmail };
