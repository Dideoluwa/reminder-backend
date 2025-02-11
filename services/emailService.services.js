const nodeMailer = require("nodemailer");

require("dotenv").config();

const userEmail = process.env.EMAIL;
const password = process.env.PASSWORD;
const recieverMail = process.env.RECIEVER;

const createEmailTransporter = () => {
  return nodeMailer.createTransport({
    service: "Gmail",
    auth: {
      user: userEmail,
      pass: password,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });
};

const sendReminderEmail = async () => {
  const message = {
    from: `DOn <${userEmail}>`,
    to: recieverMail,
    subject: `Reminder to renew your airtime.`,
    html: `<div style="background-color: #f9f9f9; padding: 20px; border-radius: 10px; margin: 20px auto; max-width: 600px;">
            <h2 style="color: #333; font-family: Arial, sans-serif;">Hey Hey!</h2>
            <p style="color: #555; font-family: Arial, sans-serif;">Guess what?</p>
            <p style="color: #555; font-family: Arial, sans-serif;">It's almost been a week since you bought airtime. Don't you think it's nice to renew today?</p>
            <p style="color: #555; font-family: Arial, sans-serif;"><a href="https://airtime-reminder.netlify.app/" style="color: #007bff; text-decoration: none;">Click when you have renewed your airtime. Thanks.</a></p>
          </div>`,
  };

  try {
    const info = await createEmailTransporter().sendMail(message);
    console.log(`success in sending message ${info}`);
    return { success: true, message: info };
  } catch (err) {
    console.error(`error in sending mail ${err}`);
    throw new Error(`Failed to send reminder email: ${err.message}`);
  }
};

const sendConfirmationEmail = async (time) => {
  const date = new Date(time);
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();

  const message = {
    from: `DOn <${userEmail}>`,
    to: recieverMail,
    subject: `Success.`,
    html: `<div style="background-color: #f9f9f9; padding: 20px; border-radius: 10px; margin: 20px auto; max-width: 600px;">
            <h2 style="color: #333; font-family: Arial, sans-serif;">Hey again!</h2>
            <p style="color: #555; font-family: Arial, sans-serif;">I'm so happy I could help remind you.</p>
            <p style="color: #555; font-family: Arial, sans-serif;">We will see some other time.</p>
            <p style="color: #555; font-family: Arial, sans-serif;">Your next airtime renewal reminder will be ${day}/${month}/${year}.</p>
            <p style="color: #555; font-family: Arial, sans-serif;">Best regards,</p>
            <p style="color: #555; font-family: Arial, sans-serif;">Airtime Reminder Team</p>
          </div>`,
  };

  try {
    const info = await createEmailTransporter().sendMail(message);
    console.log(`success in sending message ${info}`);
    return { success: true, message: info };
  } catch (err) {
    console.error(`error in sending mail ${err}`);
    throw new Error(`Failed to send confirmation email: ${err.message}`);
  }
};

module.exports = {
  createEmailTransporter,
  sendReminderEmail,
  sendConfirmationEmail,
};
