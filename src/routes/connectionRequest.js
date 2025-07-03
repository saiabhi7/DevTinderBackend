const express = require("express");
const userAuth = require("../middlewares/userAuth");
const User = require("../models/user");
const Request = require("../models/request");
const mongoose = require("mongoose");
const { POPULATED_USER_DATA } = require("../constants/constants");

const connectionRequestRouter = express.Router();

connectionRequestRouter.post(
  "/request/send/:status/:toUserId",
  userAuth,
  async (req, res) => {
    const user = req.user;

    if (!user) {
      return res.status(404).json({ message: "User Not Found", data: {} });
    }

    const status = req.params.status;
    const toUserId = req.params.toUserId;
    const fromUserId = user._id;

    if (!status) {
      return res
        .status(400)
        .json({ message: "Status is missing in the request", data: {} });
    }
    if (!["ignored", "interested"].includes(status)) {
      return res.status(400).json({
        message: `Status should be either 'ignored' or 'interested'`,
        data: {},
      });
    }
    if (!toUserId) {
      return res.status(400).json({
        message: "User Id of Recipient is missing in the request",
        data: {},
      });
    }
    if (toUserId === fromUserId.toString()) {
      return res
        .status(400)
        .json({ message: "Request cannot be sent to Self", data: {} });
    }
    if (!mongoose.Types.ObjectId.isValid(toUserId)) {
      return res.status(400).json({
        message: "Invalid Recipient User Id",
        data: {},
      });
    }
    if (!mongoose.Types.ObjectId.isValid(fromUserId)) {
      return res.status(400).json({
        message: "Invalid Sender User Id",
        data: {},
      });
    }

    try {
      const toUser = await User.findById({
        _id: toUserId,
      });

      if (!toUser) {
        return res
          .status(404)
          .json({ message: "Recipient User Not Found", data: {} });
      }

      const existingRequest = await Request.find({
        $or: [
          {
            fromUserId,
            toUserId,
          },
          {
            fromUserId: toUserId,
            toUserId: fromUserId,
          },
        ],
      });

      if (existingRequest.length > 0) {
        return res
          .status(400)
          .json({ message: "A Connection Request already exists", data: {} });
      }

      let request = new Request({ fromUserId, toUserId, status });
      request = await request.save();

      return res.status(201).json({
        message: "Connection Request Sent Successfully!!!",
        data: request,
      });
    } catch (err) {
      return res.status(400).json({
        message: "Error sending request to user: " + err.message,
        data: {},
      });
    }
  }
);

connectionRequestRouter.post(
  "/request/review/:status/:requestId",
  userAuth,
  async (req, res) => {
    const reviewer = req.user;

    const status = req.params.status;
    const requestId = req.params.requestId;

    if (!status) {
      return res
        .status(400)
        .json({ message: "Status is missing in the request", data: {} });
    }
    if (!["accepted", "rejected"].includes(status)) {
      return res.status(400).json({
        message: `Status should be either 'accepted' or 'rejected'`,
        data: {},
      });
    }
    if (!requestId) {
      return res
        .status(400)
        .json({ message: "Request Id is missing in the request", data: {} });
    }
    if (!mongoose.Types.ObjectId.isValid(requestId)) {
      return res.status(400).json({ message: "Invalid Request Id", data: {} });
    }

    try {
      const existingRequest = await Request.findOne({
        _id: requestId,
        toUserId: reviewer._id,
        status: "interested",
      });

      if (!existingRequest) {
        return res.status(404).json({
          message: "Connection Request Not Found or Already Reviewed",
          data: {},
        });
      }

      existingRequest.status = status;
      const updatedRequest = await existingRequest.save();

      return res.status(200).json({
        message: "Connection Request Reviewed Successfully!!!",
        data: updatedRequest,
      });
    } catch (err) {
      return res.status(400).json({
        message: "Error Reviewing the Request: " + err.message,
        data: {},
      });
    }
  }
);

connectionRequestRouter.get("/request/list", userAuth, async (req, res) => {
  const loggedInUser = req.user;

  if (!loggedInUser) {
    return res.status(404).json({ message: "User Not Found", data: {} });
  }

  try {
    const requests = await Request.find({
      toUserId: loggedInUser._id,
      status: "interested",
    })
      .select("fromUserId")
      .populate("fromUserId", POPULATED_USER_DATA);

    if (requests.length === 0) {
      return res.status(404).json({
        message: "No Connection Requests Found",
        data: {},
      });
    }

    return res.json({
      message: "Connection Requests Fetched Successfully!!!",
      data: requests,
    });
  } catch (err) {
    return res.status(400).json({});
  }
});

module.exports = connectionRequestRouter;
