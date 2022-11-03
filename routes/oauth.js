const router = require("express").Router();
const axios = require("axios");
const User = require("../models/user");
const { rootUrl } = require("../utils/constants");
const { APP_ID, APP_SECRET, GH_ID } = process.env;

router.get("/linkedin", async (req, res) => {
  const { code } = req.query;

  let myLinkedInId = null;
  // code will be passed by linkedin oauth
  if (code) {
    const fetchToken = await axios({
      method: "post",
      url: `https://www.linkedin.com/oauth/v2/accessToken?grant_type=authorization_code&code=${code}&client_id=${APP_ID}&client_secret=${APP_SECRET}&redirect_uri=${
        rootUrl(req) + "/api/oauth/linkedin"
      }`,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });
    token = fetchToken.data.access_token;
  }

  if (!token) {
    res
      .status(401)
      .send("Unauthorized. Please visit /api/auth-url to authorize.");
    return;
  }

  // fetch users primary contact info
  const fetchUserInfo = await axios({
    method: "get",
    url: `https://api.linkedin.com/v2/clientAwareMemberHandles?q=members&projection=(elements*(primary,type,handle~))`,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  // check if user with fetchUserInfo.elements[0]["handle~"].emailAddress exists in db

  const typeField =
    fetchUserInfo.data.elements[0].type === "EMAIL" ? "email" : "phoneNumber";
  const primaryContactValue =
    typeField === "email"
      ? fetchUserInfo.data.elements[0]["handle~"].emailAddress
      : fetchUserInfo.data.elements[0]["handle~"].phoneNumber.number;

  let user = await User.findOne({
    where: {
      [typeField]: primaryContactValue,
    },
  });

  if (user) {
    // update token
    user.linkedinToken = token;
    await user.save();
  } else {
    // if user does not exist, create user
    user = await User.create({
      [typeField]: primaryContactValue,
      linkedinToken: token,
    });
  }

  if (!user.githubToken) {
    // redirect to github auth
    res.redirect(
      `https://github.com/login/oauth/authorize?client_id=${GH_ID}&redirect_uri=${
        rootUrl(req) + "/api/oauth/github"
      }&scope=admin:repo_hook`
    );
  } else {
    // route to user's profile page
    res.redirect(`${rootUrl(req)}/user/${user.id}`);
  }
});

router.get("/github", async (req, res) => {});

module.exports = router;
