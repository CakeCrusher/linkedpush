const router = require("express").Router();
const axios = require("axios");
const { verifyUser } = require("../utils/middleware");

router.post("/:id", verifyUser, async (req, res) => {
  const user = res.locals.user;
  const token = user.linkedinToken;

  // TODO: get rid of this request (related to issue #6)
  const fetchMyId = await axios({
    method: "get",
    url: `https://api.linkedin.com/v2/me?projection=(id)`,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const myLinkedInId = fetchMyId.data.id;

  if (!token) {
    console.log("No token found. Please authenticate first.");
    res.status(401).send("Unauthorized");
    return;
  }

  if (!req.body.head_commit) {
    console.log("No commit found.");
    res.status(400).send("No commit found.");
    return;
  }

  if (!req.body.head_commit.message.includes("@linkedpush")) {
    console.log("No linkedpush tag found. Skipping...");
    res.status(200).send("No '@linkedpush' tag found. Skipping...");
    return;
  }

  const visibility =
    process.env.PRODUCTION.toLocaleLowerCase() === "true"
      ? "PUBLIC"
      : "CONNECTIONS";

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

    console.log("Successfully posted to LinkedIn.");
    res.status(200).send("success");
    return;
  } catch (error) {
    console.log("Failed to post. Error: ", error);
    res.status(401).send(error.message);
    return;
  }
});

module.exports = router;
