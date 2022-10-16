const express = require("express");
require("dotenv").config();
const bodyParser = require("body-parser");
const axios = require("axios");
const apiRoute = require("./routes/api");

const PORT = process.env.PORT;

const app = express();
app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.redirect("https://github.com/CakeCrusher/linkedpush");
});

app.use("/api", apiRoute);

app.listen(PORT, () => {
  console.log(
    `Linkedpush listening at http://localhost:${PORT}\nPlease authenticate by navigating to: http://localhost:${PORT}/api/auth-url`
  );
});
