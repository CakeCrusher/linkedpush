const router = require("express").Router();
const axios = require("axios");
const User = require("../models/User");

router.get("/", (req, res) => {
  res.send("this is root");
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

// this will register the user
router.get("/register", async (req, res) => {
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
  if (user) {
    res.status(401).send("User already exists");
    return;
  }

  const newUser = await User.create({
    username: req.query.username,
    password: req.query.password,
  });

  // redirect to login
  res.redirect(
    "/login?username=" + newUser.username + "&password=" + newUser.password
  );
});

// this will delete the user
router.get("/delete", async (req, res) => {
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
  user.destroy();
  res.status(200).send("User deleted");
});

module.exports = router;
