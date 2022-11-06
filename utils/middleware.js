const User = require("../models/user");

const verifyUser = async (req, res, next) => {
  const user = await User.findByPk(req.params.id);
  if (!user) {
    res.status(404).send("User not found");
    return;
  }
  res.locals.user = user;
  next();
};

module.exports = { verifyUser };
