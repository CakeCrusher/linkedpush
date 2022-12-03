const axios = require("axios");
// const fetch = (...args) =>
//   import("node-fetch").then(({ default: fetch }) => fetch(...args));
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

const FormData = require("form-data");
// const fs = require("fs/promises");
const fs = require("fs");

const registerUpload = async (userId, token) => {
  const { data } = await axios({
    method: "post",
    url: `https://api.linkedin.com/rest/assets?action=registerUpload`,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      "LinkedIn-Version": "202206",
    },
    data: {
      registerUploadRequest: {
        owner: `urn:li:person:${userId}`,
        recipes: ["urn:li:digitalmediaRecipe:feedshare-image"],
        serviceRelationships: [
          {
            identifier: "urn:li:userGeneratedContent",
            relationshipType: "OWNER",
          },
        ],
        supportedUploadMechanism: ["SYNCHRONOUS_UPLOAD"],
      },
    },
  });
  console.log("registerUpload data: ", data);
  return data;
};

const imageUpload = async (uploadUrl, imagePath, token) => {
  const res = await fetch(uploadUrl, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: fs.createReadStream(imagePath),
  });
  console.log("imageUploadRes", res);
};

const checkMediaStatus = async (assetId, token) => {
  const { data } = await axios({
    method: "get",
    url: `https://api.linkedin.com/rest/assets/${assetId}`,
    headers: {
      Authorization: `Bearer ${token}`,
      "LinkedIn-Version": "202206",
    },
  });
  console.log("checkStatus data: ", data);
  return data;
};

const createPost = async (
  userId,
  token,
  message,
  assetId = null,
  visibility = "CONNECTIONS"
) => {
  try {
    const bodyData = {
      author: `urn:li:person:${userId}`,
      commentary: message,
      visibility,
      distribution: {
        feedDistribution: "MAIN_FEED",
        targetEntities: [],
        thirdPartyDistributionChannels: [],
      },
      lifecycleState: "PUBLISHED",
    };
    if (assetId) {
      bodyData["content"] = {
        media: {
          title: "commit code",
          id: assetId,
        },
      };
      bodyData["isReshareDisabledByAuthor"] = false;
    }
    const { data } = await axios({
      method: "post",
      url: `https://api.linkedin.com/rest/posts`,
      headers: {
        Authorization: `Bearer ${token}`,
        "X-Restli-Protocol-Version": "2.0.0",
        "LinkedIn-Version": "202206",
        "Content-Type": "application/json",
      },
      data: bodyData,
    });
    return data;
  } catch (error) {
    throw Error(error);
  }
};

const downloadImage = async (url) => {
  // generate id
  const id = Math.random().toString(36).substring(2, 15);
  const imagePath = `images/${id}.png`;
  const res = await axios({
    url,
    responseType: "stream",
  });
  // await the download of the image
  await new Promise((resolve, reject) => {
    res.data
      .pipe(fs.createWriteStream(imagePath))
      .on("finish", () => resolve())
      .on("error", (e) => reject(e));
  });
  return imagePath;
};

// FULL FLOW

const uploadAsset = async (linkedinToken, myLinkedInId, message, fullName) => {
  console.log("LI token: ", linkedinToken);
  const registerUploadRes = await registerUpload(myLinkedInId, linkedinToken);
  const uploadUrl =
    registerUploadRes.value.uploadMechanism[
      "com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest"
    ].uploadUrl;
  const assetId = registerUploadRes.value.asset.replace(
    "digitalmediaAsset",
    "image"
  );
  let title, description;
  if (message.includes("@:")) {
    [title, description] = message.split("@:");
    title = title.trim();
    description = description.trim();
  } else {
    title = message.slice(0, 20);
    description = "";
  }

  const imagePath = await downloadImage(
    `https://image-gen-linkedpush.vercel.app/api/og?title=${encodeURIComponent(
      title
    )}&description=${encodeURIComponent(
      description
    )}&full_name=${encodeURIComponent(fullName)}`
  );

  await imageUpload(uploadUrl, imagePath, linkedinToken);

  // delete file at imagePath
  fs.unlink(imagePath, (err) => {
    if (err) {
      console.error(err);
      return;
    }
    //file removed
  });

  return assetId;
};

module.exports = {
  registerUpload,
  imageUpload,
  checkMediaStatus,
  createPost,
  downloadImage,
  uploadAsset,
};
