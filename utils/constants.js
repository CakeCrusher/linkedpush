const rootUrl = (req) => "https://" + req.get("host");

module.exports = {
  rootUrl,
};
