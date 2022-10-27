const router = require("express").Router();
const axios = require("axios");
const User = require("../models/User");
const { rootUrl } = require("../utils/constants");
const { verifyUser } = require("../utils/middleware");

router.get("/:id", verifyUser, (req, res) => {
  const deleteDataUrl = `${rootUrl(req)}/user/delete/${req.params.id}`;
  const webhookUrl = `${rootUrl(req)}/publish/${req.params.id}`;
  res
    .status(200)
    .json({ delete_data_url: deleteDataUrl, webhook_url: webhookUrl });
});

router.get("/delete/:id", verifyUser, async (req, res) => {
  const user = res.locals.user;
  await user.destroy();
  res.status(200).send("User successfully deleted");
});

module.exports = router;
