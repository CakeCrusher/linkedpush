const router = require("express").Router();
const axios = require("axios");
const User = require("../models/user");
const { rootUrl } = require("../utils/constants");
const { verifyUser } = require("../utils/middleware");
const ejs = require("ejs");

router.get("/:id", verifyUser, (req, res) => {
  const deleteDataUrl = `${rootUrl(req)}/user/delete/${req.params.id}`;
  const webhookUrl = `${rootUrl(req)}/publish/${req.params.id}`;
  ejs.renderFile(
    __dirname + "/../views/userDashboard.ejs",
    { deleteDataUrl, webhookUrl },
    (err, str) => {
      if (err) {
        console.log(err);
        res.status(500).send("Internal Server Error");
        return;
      } else {
        res.status(201).send(str);
        return;
      }
    }
  );
});

router.get("/delete/:id", verifyUser, async (req, res) => {
  const user = res.locals.user;
  await user.destroy();
  res.status(200).send("User successfully deleted");
});

module.exports = router;
