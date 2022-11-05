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

  if (
    !req.body.commits.find((commit) => commit.message.includes("@linkedpush"))
  ) {
    console.log("No linkedpush tag found. Skipping...");
    res.status(200).send("No '@linkedpush' tag found. Skipping...");
    return;
  }

  const visibility =
    process.env.PRODUCTION.toLocaleLowerCase() === "true"
      ? "PUBLIC"
      : "CONNECTIONS";

  const autoAcredit = `GitHub repo: ${req.body.repository.url}`;
  const promo = `⚙️ by https://linkedpush.herokuapp.com/`;

  // these symbols are not allowed and will cause the post to fail
  const invalidSymbols = ["(", ")", "@"];

  // remove the linkedpush tag
  const cleanMessage = (message) =>
    message
      .replace("@linkedpush", "")
      .split("")
      .filter((char) => !invalidSymbols.includes(char))
      .join("");

  const messageList = [];
  // iterate through req.body.commits in reversse
  for (let i = req.body.commits.length - 1; i >= 0; i--) {
    if (req.body.commits[i].message.includes("@linkedpush")) {
      messageList.push(cleanMessage(req.body.commits[i].message));
    }
  }
  const finalMessage = `${messageList.join(
    "\n\n"
  )}\n\n${autoAcredit}\n${promo}`;

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
        commentary: finalMessage,
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
