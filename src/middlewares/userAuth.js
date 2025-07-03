const jwt = require("jsonwebtoken");
const User = require("../models/user");

const userAuth = async (req, res, next) => {
  const { token } = req.cookies;

  if (!token) {
    return res
      .status(401)
      .json({
        message: "User is not Authorized as token is not present",
        data: {},
      });
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

    delete user.password;
    delete user.__v;

    req.user = user;

    next();
  } catch (err) {
    return res
      .status(400)
      .json({
        message: "Error in user authentication: " + err.message,
        data: {},
      });
  }
};

module.exports = userAuth;
