const jwt = require("jsonwebtoken");
const User = require("../models/user");

const userAuth = async (req, res, next) => {
  const { token } = req.cookies;

  if (!token) {
    res.status(401).send("User is not Authorized as token is not present");
  }

  try {
    const userObj = await jwt.verify(token, "DevTinder@Saiabhi17");

    if (!userObj) {
      throw new Error("User not Authorized as token is invalid");
    }

    const userId = userObj.userId;

    const user = await User.findById({ _id: userId });

    if (!user) {
      throw new Error("User not found");
    }

    req.user = user;

    next();
  } catch (err) {
    res.status(400).send("Error in user authentication: " + err.message);
  }
};

module.exports = userAuth;
