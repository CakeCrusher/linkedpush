const router = require("express").Router();
const axios = require("axios");
const User = require("../models/user");
const { rootUrl } = require("../utils/constants");
const { verifyUser } = require("../utils/middleware");
const oauthRoute = require("./oauth");

const { APP_ID } = process.env;

// redirect to LinkedIn oath
router.get("/auth-url", (req, res) => {
  const url = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${APP_ID}&redirect_uri=${
    rootUrl(req) + "/api/oauth/linkedin"
  }&scope=r_liteprofile%20r_emailaddress%20w_member_social`;
  res.redirect(url);
});

router.use("/oauth", oauthRoute);
// recieves the code from LinkedIn and requests both the token and the user's id

// export the route
module.exports = router;
