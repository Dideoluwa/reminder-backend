const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");
const cookieParser = require("cookie-parser");
const cron = require("node-cron");
const cors = require("cors");
require("dotenv").config();
const nodeMailer = require("nodemailer");

const userEmail = process.env.EMAIL;
const password = process.env.PASSWORD;
const recieverMail = process.env.RECIEVER;
const reminder = process.env.URL;

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));

app.use(bodyParser.json());

app.use(cookieParser());

app.use(cors());

// Function to set-timer for reminder
const postTimerForReminder = (payload) => {
  const res = axios({
    method: "put",
    url: reminder,
    headers: {
      "Content-Type": "application/json",
    },
    data: JSON.stringify({
      reminderTime: payload.reminderTime,
    }),
  });
  return res;
};

// Get Timer
const getTimer = () => {
  const res = axios({
    method: "GET",
    url: reminder,
    headers: {
      "Content-Type": "application/json",
    },
  });
  return res;
};

// Function to trigger sending of mail
const sendMail = () => {
  const transporter = nodeMailer.createTransport({
    service: "Gmail",
    auth: {
      user: userEmail,
      pass: password,
    },
  });

  // Message sent to mail
  let message = {
    from: "DOn <dideoluwaoni@gmail.com>",
    to: recieverMail,
    subject: `Reminder to renew your airtime.`,
    html: `<b>Hey Hey!, <br>Guess what?.<br>It's almost been a week since you bought airtime. Don't you think it's nice to renew today?.<br><a href=https://airtime-reminder.netlify.app//>Click when you have renewed your airtime. Thanks.<a/>.`,
  };

  transporter.sendMail(message, (err, info) => {
    if (err) {
      return res.status(400).json({
        message: `error in sending mail ${err}`,
      });
    } else {
      console.log(`success in sending message ${info}`);
      return res.json({
        message: info,
      });
    }
  });
};

// Function to send confirmation mail
const sendConfirmationMail = (time) => {
  const transporter = nodeMailer.createTransport({
    service: "Gmail",
    auth: {
      user: userEmail,
      pass: password,
    },
  });

  const date = new Date(time);

  const day = date.getDate();
  const month = date.getMonth() + 1; // Months are zero-indexed
  const year = date.getFullYear();

  // Message sent to mail
  let message = {
    from: "DOn <dideoluwaoni@gmail.com>",
    to: recieverMail,
    subject: `Success.`,
    html: `<b>Hey again!, <br>I'm so happy I could help remind you.<br>We will see some other time.<br>Your next airtime renewal reminder will be ${day}/${month}/${year}.`,
  };

  transporter.sendMail(message, (err, info) => {
    if (err) {
      return res.status(400).json({
        message: `error in sending mail ${err}`,
      });
    } else {
      console.log(`success in sending message ${info}`);
      return res.json({
        message: info,
      });
    }
  });
};

//check timer to know when to send mail
const triggerSendMail = async () => {
  // get the current timestamp
  const dateNow = +Date.now();
  try {
    // Fetch set timestamp from database
    const timerRes = await getTimer();

    // Check if the current time is ahead of the set time
    if (dateNow >= timerRes.data.reminderTime) {
      // Send the reminder mail
      const sendMailRes = sendMail();
      return sendMailRes;
    } else {
      console.log("It is not yet time to send the reminder");
    }
  } catch (err) {
    console.log(`error in ${err}`);
  }
};

// Set the cron expression to run the function every minute
const task = cron.schedule("0 */6 * * *", triggerSendMail);

// const task = cron.schedule("*/3 * * * *", triggerSendMail);

app.get("/", async (req, res) => {
  res.send("Hello world");
});

app.get("/set-timer", async (req, res) => {
  const currDate = +Date.now();

  // Convert 6 days to milliseconds
  const sixDaysInMilliseconds = 6 * 24 * 60 * 60 * 1000;

  const futureDateInMilliseconds = currDate + sixDaysInMilliseconds;

  try {
    const sendTimer = await postTimerForReminder({
      reminderTime: futureDateInMilliseconds,
    });
    const confirmMailRes = sendConfirmationMail(sendTimer.data.reminderTime);
    res.status(200).send({
      status: 200,
      message: sendTimer.data,
      success: true,
    });
    return confirmMailRes.data;
  } catch (err) {
    res.send(err.response);
  }
});

// Start the cron job
task.start();

app.listen(process.env.PORT || 8081, () => {
  console.log(`Server Running at 8081`);
});
