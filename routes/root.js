const router = require("express").Router();
const axios = require("axios");
const User = require("../models/user");
const { rootUrl } = require("../utils/constants");
const { getCode } = require("../utils/githubApi");
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

router.get("/test", async (req, res) => {
  // full_name = body.repository.full_name
  // sha = body.head_commit.id
  // token = user.githubToken

  await getCode(
    "f4737a0c52add1c9a093dc51fec370470ab884e9",
    "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",
    "CakeCrusher/test-repo"
  );
  return res.send("test");
});

module.exports = router;
