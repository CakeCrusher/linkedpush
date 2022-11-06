const express = require("express");
require("dotenv").config();
const bodyParser = require("body-parser");
const axios = require("axios");
const apiRoute = require("./routes/api");
const rootRoute = require("./routes/root");
const userRoute = require("./routes/user");
const publishRoute = require("./routes/publish");
const { connectToDatabase } = require("./utils/db");
const cors = require("cors");

const PORT = process.env.PORT;

const app = express();
app.use(express.static("public"));
app.use(cors());
app.use(bodyParser.json());

app.use("/", rootRoute);
app.use("/user", userRoute);
app.use("/api", apiRoute);
app.use("/publish", publishRoute);

const start = async () => {
  await connectToDatabase();
  app.listen(PORT, () => {
    console.log(
      `Linkedpush listening at http://localhost:${PORT}\nPlease authenticate by navigating to: http://localhost:${PORT}/api/auth-url`
    );
  });
};

start();
