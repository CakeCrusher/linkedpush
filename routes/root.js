const router = require("express").Router();
const axios = require("axios");
const User = require("../models/user");
const { rootUrl } = require("../utils/constants");
const ejs = require("ejs");

router.get("/", (req, res) => {
  const authUrl = `${rootUrl(req)}/api/auth-url`;
  ejs.renderFile(__dirname + "/../views/index.ejs", { authUrl }, (err, str) => {
    if (err) {
      console.log(err);
    } else {
      res.send(str);
    }
  });
});

module.exports = router;
