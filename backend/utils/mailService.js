const { Resend } = require('resend');
require('dotenv').config();

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = process.env.EMAIL_FROM || 'Pet Care App <onboarding@resend.dev>';

const sendEmail = async (to, subject, text, html = '') => {
  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      text,
      html,
    });

    if (error) {
      console.error('Error sending email:', error);
      return;
    }

    console.log('Email sent:', data?.id);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

module.exports = { sendEmail };
