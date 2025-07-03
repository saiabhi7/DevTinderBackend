const mongoose = require("mongoose");

const requestSchema = new mongoose.Schema(
  {
    fromUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      validate: function (value) {
        if (!mongoose.Types.ObjectId.isValid(value)) {
          throw new Error("Invalid Recipient User Id");
        }
      },
    },
    toUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      validate: function (value) {
        if (!mongoose.Types.ObjectId.isValid(value)) {
          throw new Error("Invalid Sender User Id");
        }
      },
    },
    status: {
      type: String,
      enum: ["ignored", "interested", "accepted", "rejected"],
      message: "${VALUE} is not a valid status",
    },
  },
  {
    timeStamps: true,
  }
);

const Request = mongoose.model("Request", requestSchema);

module.exports = Request;
