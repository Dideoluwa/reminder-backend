const axios = require("axios");

const reminder = process.env.URL;

const setTimer = async (reminderTime) => {
  try {
    const response = await axios({
      method: "put",
      url: reminder,
      headers: {
        "Content-Type": "application/json",
      },
      data: JSON.stringify({ reminderTime }),
    });
    return response.data;
  } catch (error) {
    throw new Error(`Failed to set timer: ${error.message}`);
  }
};

const getTimer = async () => {
  try {
    const response = await axios({
      method: "GET",
      url: reminder,
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(`Failed to get timer: ${error.message}`);
  }
};

module.exports = {
  setTimer,
  getTimer,
};
