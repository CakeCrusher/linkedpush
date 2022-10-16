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

  console.log("Authenticated.");
  res.status(200).send("Authenticated. You can close this window now.");
});

router.post("/publish", async (req, res) => {
  if (!req.body.head_commit) {
    res.status(400).send("No commit found.");
    return;
  }
  if (!req.body.head_commit.message.includes("@linkedpush")) {
    console.log("No linkedpush tag found. Skipping...");
    res.status(200).send("No '@linkedpush' tag found. Skipping...");
    return;
  }

  const visibility =
    PRODUCTION.toLocaleLowerCase() === "true" ? "PUBLIC" : "CONNECTIONS";

  const autoAcredit = `\nGitHub repo: ${req.body.repository.url}`;
  const promo = `\n\n⚙️ by https://github.com/CakeCrusher/linkedpush`;

  // these symbols are not allowed and will cause the post to fail
  const invalidSymbols = ["(", ")", "@"];

  // remove the linkedpush tag
  let cleanMessage = req.body.head_commit.message
    .replace("@linkedpush", "")
    .split("")
    .filter((char) => !invalidSymbols.includes(char))
    .join("");

  if (!token) {
    console.log("No token found. Please authenticate first.");
    res.status(401).send("Unauthorized");
    return;
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
    res.status(401).send(error.message);
    return;
  }

  console.log("Successfully posted to LinkedIn.");
  res.status(200).send("success");
  return;
});

// export the route
module.exports = router;
