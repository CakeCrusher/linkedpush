const router = require("express").Router();
const axios = require("axios");

const { APP_ID, APP_SECRET, REDIRECT_URI, PRODUCTION } = process.env;
let token = null;
let myLinkedInId = null;

// redirect to LinkedIn oath
router.get("/auth-url", (req, res) => {
  const url = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${APP_ID}&redirect_uri=${REDIRECT_URI}&scope=r_liteprofile%20r_emailaddress%20w_member_social`;
  res.redirect(url);
});

// recieves the code from LinkedIn and requests both the token and the user's id
router.get("/auth", async (req, res) => {
  const { code } = req.query;

  if (code) {
    const fetchToken = await axios({
      method: "post",
      url: `https://www.linkedin.com/oauth/v2/accessToken?grant_type=authorization_code&code=${code}&client_id=${APP_ID}&client_secret=${APP_SECRET}&redirect_uri=${REDIRECT_URI}`,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });
    token = fetchToken.data.access_token;

    const fetchMyId = await axios({
      method: "get",
      url: `https://api.linkedin.com/v2/me?projection=(id)`,
      headers: {
        Authorization: `Bearer ${fetchToken.data.access_token}`,
      },
    });
    myLinkedInId = fetchMyId.data.id;
  }

  res.status(200).send("Authenticated. You can close this window now.");
});

router.post("/publish", async (req, res) => {
  const visibility =
    PRODUCTION.toLocaleLowerCase() === "true" ? "PUBLIC" : "CONNECTIONS";

  const promo = `\nGitHub repo: ${req.body.repository.url}\n\n⚙️ by https://github.com/CakeCrusher/linked-publish`;

  // these symbols are not allowed and will cause the post to fail
  const invalidSymbols = ["(", ")", "@"];
  const cleanMessage = req.body.head_commit.message
    .split("")
    .filter((char) => !invalidSymbols.includes(char))
    .join("");

  if (!token) {
    console.log("No token found. Please authenticate first.");
    return res.status(401).send("Unauthorized");
  }

  let postingPost = null;
  try {
    postingPost = await axios({
      method: "post",
      url: `https://api.linkedin.com/rest/posts`,
      headers: {
        Authorization: `Bearer ${token}`,
        "X-Restli-Protocol-Version": "2.0.0",
        "LinkedIn-Version": "202206",
        "Content-Type": "application/json",
      },
      data: {
        author: `urn:li:person:${myLinkedInId}`,
        commentary: cleanMessage + promo,
        visibility,
        distribution: {
          feedDistribution: "MAIN_FEED",
          targetEntities: [],
          thirdPartyDistributionChannels: [],
        },
        lifecycleState: "PUBLISHED",
      },
    });
  } catch (error) {
    console.log("Failed to post. Error: ", error);
    return res.status(401).send(error.message);
  }

  console.log("Successfully posted to LinkedIn.");
  return res.status(200).send("success");
});

// export the route
module.exports = router;
