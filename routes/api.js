const router = require("express").Router();
const axios = require("axios");
const User = require("../models/user");
const { rootUrl } = require("../utils/constants");
const { verifyUser } = require("../utils/middleware");

const { APP_ID, APP_SECRET, REDIRECT_URI, PRODUCTION } = process.env;

// redirect to LinkedIn oath
router.get("/auth-url", (req, res) => {
  const url = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${APP_ID}&redirect_uri=${REDIRECT_URI}&scope=r_liteprofile%20r_emailaddress%20w_member_social`;
  res.redirect(url);
});

// recieves the code from LinkedIn and requests both the token and the user's id
router.get("/auth", async (req, res) => {
  const { code } = req.query;
  let token = null;

  let myLinkedInId = null;
  // code will be passed by linkedin oauth
  if (code) {
    const fetchToken = await axios({
      method: "post",
      url: `https://www.linkedin.com/oauth/v2/accessToken?grant_type=authorization_code&code=${code}&client_id=${APP_ID}&client_secret=${APP_SECRET}&redirect_uri=${REDIRECT_URI}`,
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

  // route to user's profile page
  res.redirect(`${rootUrl(req)}/user/${user.id}`);
  // res.status(200).send("Authenticated. You can close this window now.");
});

// export the route
module.exports = router;
