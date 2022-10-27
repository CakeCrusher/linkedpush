const router = require("express").Router();
const axios = require("axios");
const User = require("../models/user");
const { rootUrl } = require("../utils/constants");

router.get("/", (req, res) => {
  res.send(
    `Welcome to linkedpush.  \nTo get started please visit ${rootUrl(
      req
    )}/api/auth-url .  \n\nCheck out the source code at https://github.com/CakeCrusher/linkedpush`
  );
});

// this will login the user
router.get("/login", async (req, res) => {
  if (!req.query.username || !req.query.password) {
    res.status(400).send("Username and password are required.");
    return;
  }
  const user = await User.findOne({
    where: {
      username: req.query.username,
      password: req.query.password,
    },
  });
  if (!user) {
    res.status(401).send("User not found");
    return;
  }

  // get current url
  const rootUrl = req.protocol + "://" + req.get("host");

  res.status(200).json({
    websocket_url: user.linkedin_token ? `${rootUrl}/publish/${user.id}` : null,
    DELETE_MY_DATA: `${rootUrl}/delete?username=${user.username}&password=${user.password}`,
  });
});

module.exports = router;
