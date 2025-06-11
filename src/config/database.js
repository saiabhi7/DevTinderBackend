const mongoose = require("mongoose");

const dbConnection = async () => {
  await mongoose.connect(
    "mongodb+srv://namastenode:dzDRIUKR7ue2ZdEL@namastenode.o4b9i.mongodb.net/devTinder"
  );
};

module.exports = dbConnection;
