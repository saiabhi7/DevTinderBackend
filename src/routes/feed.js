const express = require("express");
const userAuth = require("../middlewares/userAuth");
const Request = require("../models/request");
const User = require("../models/user");
const { POPULATED_USER_DATA } = require("../constants/constants");
const feedRouter = express.Router();

feedRouter.get("/feed", userAuth, async (req, res) => {
  const loggedInUser = req.user;

  if (!loggedInUser) {
    return res.status(404).json({ message: "User not found", data: {} });
  }

  try {
    const existingRequests = await Request.find({
      $or: [{ fromUserId: loggedInUser._id }, { toUserId: loggedInUser._id }],
    }).select("fromUserId toUserId");

    const idsToRemoveFromFeed = new Set();
    if (existingRequests.length > 0) {
      existingRequests.forEach((request) => {
        idsToRemoveFromFeed.add(request.fromUserId.toString());
        idsToRemoveFromFeed.add(request.toUserId.toString());
      });
    }

    const feedData = await User.find({
      _id: { $nin: Array.from(idsToRemoveFromFeed) },
    }).select(POPULATED_USER_DATA);

    return res.status(200).json({
      message: "Feed fetched successfully",
      data: feedData,
    });
  } catch (err) {
    return res
      .status(400)
      .json({ message: "Error fetching feed: " + err.message, data: {} });
  }
});

module.exports = feedRouter;
