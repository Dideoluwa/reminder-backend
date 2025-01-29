const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cron = require("node-cron");
const cors = require("cors");
require("dotenv").config();
const reminderRouter = require("./routes/reminderRoutes");
require("./scripts/cronJob");

const app = express();

app.use(express.urlencoded({ extended: true }));

app.use(bodyParser.json());

app.use(cookieParser());

app.use(cors());

const port = process.env.PORT || 8081;

app.get("/", async (req, res) => {
  res.status(200).send({
    message: "Hi",
  });
});

app.use("/api/v1", reminderRouter);

app.listen(port, () => {
  console.log(`Server Running at ${port}`);
});
