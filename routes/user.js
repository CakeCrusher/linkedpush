const router = require("express").Router();
const axios = require("axios");
const User = require("../models/User");
const { rootUrl } = require("../utils/constants");

router.get("/:id", (req, res) => {
  res.send(`user route:${req.params.id}`);
});

module.exports = router;
