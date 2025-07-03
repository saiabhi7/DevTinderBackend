const express = require("express");
const userAuth = require("../middlewares/userAuth");
const User = require("../models/user");
const profileRouter = express.Router();

const allowedFields = [
  "firstName",
  "lastName",
  "mobile",
  "photoUrl",
  "dateOfBirth",
  "about",
  "skills",
  "age",
  "gender",
];

profileRouter.get("/profile/view", userAuth, async (req, res) => {
  const user = req.user;

  if (!user) {
    return res.status(404).json({ message: "User not found", data: {} });
  }

  try {
    const userProfile = await User.findById({ _id: user._id });

    if (!userProfile) {
      return res
        .status(404)
        .json({ message: "User profile not found", data: {} });
    }

    res.json({
      message: "User Profile fetched successfully",
      data: userProfile,
    });
  } catch (err) {
    return res.status(400).send({
      message: "Error fetching User Profile: " + err.message,
      data: {},
    });
  }
});

profileRouter.patch("/profile/update", userAuth, async (req, res) => {
  let user = req.user;

  if (!user) {
    return res.status(404).json({ message: "User not found", data: {} });
  }

  try {
    const reqBody = req.body;
    user = await User.findById({ _id: user._id });
    Object.keys(reqBody).forEach((key) => {
      if (!allowedFields.includes(key)) {
        return res
          .status(400)
          .json({ message: `Invalid field: ${key}`, data: {} });
      }
      user[key] = reqBody[key];
    });

    await user.save();

    return res.json({
      message: "User profile updated successfully!!!",
      data: user,
    });
  } catch (err) {
    return res.status(400).json({
      message: "Error updating user profile: " + err.message,
      data: {},
    });
  }
});

module.exports = profileRouter;
