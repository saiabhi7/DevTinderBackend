const mongoose = require("mongoose");
const { MONGO_DB_URL } = require("../constants/constants");

const dbConnection = async () => {
  await mongoose.connect(MONGO_DB_URL);
};

module.exports = dbConnection;
