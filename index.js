const express = require("express");
require("dotenv").config();
const bodyParser = require("body-parser");

const port = process.env.PORT;

const app = express();
app.use(bodyParser.json());

let count = 0;

app.get("/", (req, res) => {
  count++;
  console.log("Hit!", count);
  res.send("Hello World!");
});
app.post("/pushed", (req, res) => {
  console.log("Pushed!");
  console.log("!body: ", req.body);
  // req.body.respository.full_name
  // req.body.head_commit.message
  res.send("Pushed!");
});

app.get("/reset", (req, res) => {
  count = 0;
  console.log("Reset!", count);
  res.send("Reset!");
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
