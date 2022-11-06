const router = require("express").Router();
const axios = require("axios");
const User = require("../models/user");
const { rootUrl } = require("../utils/constants");
const { verifyUser } = require("../utils/middleware");
const ejs = require("ejs");

router.get("/:id", verifyUser, async (req, res) => {
  const deleteDataUrl = `${rootUrl(req)}/user/delete/${req.params.id}`;
  const webhookUrl = `${rootUrl(req)}/publish/${req.params.id}`;
  // make an api request to retrieve the github user
  const fetchUserInfo = await axios.get("https://api.github.com/user", {
    headers: {
      Authorization: `Bearer ${res.locals.user.githubToken}`,
    },
  });
  const fetchRepos = await axios.get(
    fetchUserInfo.data.repos_url + "?sort=pushed&per_page=50",
    {
      headers: {
        Authorization: `Bearer ${res.locals.user.githubToken}`,
      },
    }
  );

  // reduce repos to only contain the following data: owner_name, repo_name,
  const mappedRepos = fetchRepos.data.map((repo) => {
    return {
      repo_name: repo.name,
      html_url: repo.html_url,
    };
  });
  ejs.renderFile(
    __dirname + "/../views/userDashboard.ejs",
    {
      deleteDataUrl,
      webhookUrl,
      githubToken: res.locals.user.githubToken,
      owner_name: fetchUserInfo.data.login,
      repos: mappedRepos,
    },
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
