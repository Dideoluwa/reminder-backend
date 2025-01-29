const { getTimer, setTimer } = require("../services/reminderServices.services");
const {
  sendConfirmationEmail,
  sendReminderEmail,
} = require("../services/emailService.services");
require("dotenv").config();

const handleSetTimer = async (req, res) => {
  const currDate = +Date.now();
  const sixDaysInMilliseconds = 6 * 24 * 60 * 60 * 1000;
  const futureDateInMilliseconds = currDate + sixDaysInMilliseconds;

  try {
    const timerResult = await setTimer(futureDateInMilliseconds);
    await sendConfirmationEmail(timerResult.reminderTime);

    res.status(200).json({
      status: 200,
      message: timerResult,
      success: true,
    });
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: error.message,
      success: false,
    });
  }
};

const checkAndSendReminder = async () => {
  const dateNow = +Date.now();
  try {
    const timer = await getTimer();
    if (dateNow >= timer.reminderTime) {
      await sendReminderEmail();
      console.log("Reminder email sent successfully");
    } else {
      console.log("It is not yet time to send the reminder");
    }
  } catch (error) {
    console.error(`Error in reminder check: ${error}`);
  }
};

module.exports = {
  handleSetTimer,
  checkAndSendReminder,
};
