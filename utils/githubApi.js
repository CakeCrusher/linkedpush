const axios = require("axios");

const commitInfo = async (sha, token, full_name) => {
  const { data } = await axios({
    method: "get",
    url: `https://api.github.com/repos/${full_name}/commits/${sha}`,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return data;
};

const fileInfo = async (contents_url, token) => {
  const { data: contentsData } = await axios({
    method: "get",
    url: contents_url,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const { data: fileString } = await axios({
    method: "get",
    url: contentsData.download_url,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  // output fileString without parsing it
  return fileString;
};

const isBestFile = (file) => {
  const fileSplit = file.filename.split(".");
  const fileExtension = fileSplit[fileSplit.length - 1];
  if (fileExtension !== "txt") {
    return true;
  }
  return false;
};

const getCode = async (commit_sha, token, full_name) => {
  const commitData = await commitInfo(commit_sha, token, full_name);
  const bestFile = commitData.files.find((file) => isBestFile(file));
  const fileName = bestFile.filename;
  const fileSha = bestFile.sha;
  const contentsUrl = bestFile.contents_url;
  const fileString = await fileInfo(contentsUrl, token);
  console.log("fileString: ", encodeURIComponent(fileString));
  return { fileName, fileString };
};

module.exports = { getCode };
