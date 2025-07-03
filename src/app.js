const express = require("express");
const dbConnection = require("./config/database");
const User = require("./models/user");
const auth = require("./middlewares/auth");
const requestValid = require("./middlewares/requestValid");
const cookieParser = require("cookie-parser");
const userAuth = require("./middlewares/userAuth");
const authRouter = require("./routes/auth");
const profileRouter = require("./routes/profile");
const connectionRequestRouter = require("./routes/connectionRequest");
const feedRouter = require("./routes/feed");

const app = express();
const port = 3000;

// Middleware to parse JSON request bodies that runs before each route and parses the JSON body
app.use(express.json());
app.use(cookieParser());

app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", connectionRequestRouter);
app.use("/", feedRouter);

// Test APIs
app.get("/user/profile", userAuth, async (req, res) => {
  try {
    const user = req.user;

    res.send(user);
  } catch (err) {
    res.status(400).send("Error getting User Profile: " + err.message);
  }

  console.log("Cookies:" + req.cookies);
});

app.get("/user", async (req, res) => {
  const email = req.body.email;
  console.log(email);
  try {
    const user = await User.findOne({ email: email });
    res.status(200).send(user);
  } catch (err) {
    res.status(500).send("Error fetching user: " + err.message);
  }
});

app.get("/user/feed", async (req, res) => {
  try {
    const feed = await User.find({});
    res.send(feed);
  } catch (err) {
    res.status(500).send("Error fetching feed: " + err.message);
  }
});

app.delete("/user/:id", async (req, res) => {
  const userId = req.params.id;
  try {
    await User.findByIdAndDelete(userId);
    res.send("User deleted successfully");
  } catch (err) {
    res.status(500).send("Error deleting user: " + err.message);
  }
});

app.patch("/user", requestValid, async (req, res) => {
  const userId = req.body.id;
  const data = req.body;
  const options = { upsert: true }; // upsert creates a new document if one doesn't exist else updates the existing document

  try {
    //await User.findByIdAndUpdate(userId, data, options);
    await User.findOneAndUpdate({ email: data.email }, data, options);
    res.send("User updated successfully!!!");
  } catch (err) {
    res.status(500).send("Error updating user: " + err.message);
  }
});

app.use("/user/:name", auth, (req, res) => {
  console.log("This is the second middleware function.");
  res.send("This is the second middleware function.");
});

dbConnection()
  .then(() => {
    console.log("DB Connection has been established successfully");
    app.listen(port, () => {
      console.log("Server is running on port: " + port);
    });
  })
  .catch((err) => {
    console.error("DB Connection failed: ", err.message);
  });
