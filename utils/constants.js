const rootUrl = (req) => req.protocol + "://" + req.get("host");

module.exports = {
  rootUrl,
};
