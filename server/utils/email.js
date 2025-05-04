const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

dotenv.config();

// Create transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Send event confirmation email
const sendEventConfirmation = async (userEmail, userName, eventTitle, eventDate, eventTime, eventLocation) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: `Event Registration Confirmation: ${eventTitle}`,
      html: `
        <h2>Event Registration Confirmation</h2>
        <p>Hello ${userName},</p>
        <p>You have successfully registered for the following event:</p>
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px;">
          <h3>${eventTitle}</h3>
          <p><strong>Date:</strong> ${eventDate}</p>
          <p><strong>Time:</strong> ${eventTime}</p>
          <p><strong>Location:</strong> ${eventLocation}</p>
        </div>
        <p>We look forward to seeing you there!</p>
        <p>Best regards,<br>Campus Events Team</p>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`Confirmation email sent to ${userEmail}`);
    return true;
  } catch (error) {
    console.error('Error sending confirmation email:', error);
    return false;
  }
};

// Send event update notification
const sendEventUpdate = async (userEmail, userName, eventTitle, updateMessage) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: `Event Update: ${eventTitle}`,
      html: `
        <h2>Event Update</h2>
        <p>Hello ${userName},</p>
        <p>There has been an update to an event you're registered for:</p>
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px;">
          <h3>${eventTitle}</h3>
          <p>${updateMessage}</p>
        </div>
        <p>Best regards,<br>Campus Events Team</p>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`Update email sent to ${userEmail}`);
    return true;
  } catch (error) {
    console.error('Error sending update email:', error);
    return false;
  }
};

// Send event reminder
const sendEventReminder = async (userEmail, userName, eventTitle, eventDate, eventTime, eventLocation) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: `Reminder: ${eventTitle} is Coming Up!`,
      html: `
        <h2>Event Reminder</h2>
        <p>Hello ${userName},</p>
        <p>This is a friendly reminder about an upcoming event you're registered for:</p>
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px;">
          <h3>${eventTitle}</h3>
          <p><strong>Date:</strong> ${eventDate}</p>
          <p><strong>Time:</strong> ${eventTime}</p>
          <p><strong>Location:</strong> ${eventLocation}</p>
        </div>
        <p>We look forward to seeing you there!</p>
        <p>Best regards,<br>Campus Events Team</p>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`Reminder email sent to ${userEmail}`);
    return true;
  } catch (error) {
    console.error('Error sending reminder email:', error);
    return false;
  }
};

module.exports = {
  sendEventConfirmation,
  sendEventUpdate,
  sendEventReminder
};
