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
  });
};

const sendReminderEmail = async () => {
  const message = {
    from: `DOn <${userEmail}>`,
    to: recieverMail,
    subject: `Reminder to renew your airtime.`,
    html: `<b>Hey Hey!, <br>Guess what?.<br>It's almost been a week since you bought airtime. Don't you think it's nice to renew today?.<br><a href=https://airtime-reminder.netlify.app//>Click when you have renewed your airtime. Thanks.<a/>.`,
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
    html: `<b>Hey again!, <br>I'm so happy I could help remind you.<br>We will see some other time.<br>Your next airtime renewal reminder will be ${day}/${month}/${year}.`,
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
