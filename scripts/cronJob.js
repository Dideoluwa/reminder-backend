const cron = require("node-cron");
const {
  checkAndSendReminder,
} = require("../controllers/reminderController.controllers");

cron.schedule(
  "0 */6 * * *",
  () => {
    checkAndSendReminder();
  },
  {
    scheduled: true,
    timezone: "UTC",
  }
);

module.exports = cron;
