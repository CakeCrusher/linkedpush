const router = require("express").Router();
const axios = require("axios");
const { verifyUser } = require("../utils/middleware");
const { uploadAsset, createPost } = require("../utils/linkedinApi");

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

  // const autoAcredit = `GitHub repo: ${req.body.repository.url}`;
  const autoAcredit = `GitHub commit: ${
    req.body.repository.url + "/commit/" + req.body.head_commit.id
  }`;
  const promo = `⚙️ by https://linkedpush.herokuapp.com/`;

  // these symbols are not allowed and will cause the post to fail
  const invalidSymbols = ["(", ")"];

  // remove the linkedpush tag
  const cleanMessage = (message, aoc = false) => {
    if (!aoc) {
      message = message.replace("@:", "");
    }
    message = message
      .replace("@linkedpush", "")
      .replace("@aoc", "")
      .split("")
      .filter((char) => !invalidSymbols.includes(char))
      .join("");
    return message;
  };

  const messageList = [];
  let aocMessage;
  // iterate through req.body.commits in reversse
  for (let i = req.body.commits.length - 1; i >= 0; i--) {
    if (req.body.commits[i].message.includes("@linkedpush")) {
      messageList.push(cleanMessage(req.body.commits[i].message));
    }
    if (req.body.commits[i].message.includes("@aoc") && !aocMessage) {
      aocMessage = cleanMessage(req.body.commits[i].message, true);
    }
  }
  const finalMessage = `${messageList.join(
    "\n\n"
  )}\n\n${autoAcredit}\n${promo}`;

  const assetId =
    aocMessage &&
    (await uploadAsset(
      token,
      myLinkedInId,
      aocMessage,
      req.body.repository.full_name
    ));
  console.log("assetId: ", assetId);
  let postingPost = null;
  try {
    postingPost = await createPost(
      myLinkedInId,
      token,
      finalMessage,
      assetId,
      visibility
    );

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
