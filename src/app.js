const express = require("express");
const dbConnection = require("./config/database");
const User = require("./models/user");
const auth = require("./middlewares/auth");
const requestValid = require("./middlewares/requestValid");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const userAuth = require("./middlewares/userAuth");

const app = express();
const port = 3000;

// Middleware to parse JSON request bodies that runs before each route and parses the JSON body
app.use(express.json());
app.use(cookieParser());

app.post("/user/signup", requestValid, async (req, res) => {
  const {
    firstName,
    lastName,
    username,
    email,
    password,
    mobile,
    photoUrl,
    dateOfBirth,
    about,
    skills,
    age,
    gender,
  } = req.body;
  const user = new User({
    firstName,
    lastName,
    username,
    email,
    password,
    mobile,
    photoUrl,
    dateOfBirth,
    about,
    skills,
    age,
    gender,
  });

  try {
    //Encrypt Password before saving in DB
    const passwordHash = User.encryptPassword(password);

    user.password = passwordHash;
    user.email = user.email.toLowerCase(); // Ensure email is stored in lowercase

    await user.save();
    res.status(201).send("User created successfully!!!");
  } catch (err) {
    res
      .status(400)
      .send(
        "Error creating user: " + user.email + " with error: " + err.message
      );
  }
});

app.post("/user/login", async (req, res) => {
  const { username, email, password } = req.body;
  let user = null;
  if (!username && !email) {
    res.status(400).send("Please provide email or username");
  } else if (!password) {
    res.status(400).send("Please provide password");
  }
  try {
    if (email) {
      user = await User.findOne({ email: email.toLowerCase() });
    } else if (username) {
      user = await User.findOne({ username });
    }

    if (!user) {
      throw new Error("Invalid Credentials");
    }

    const isPasswordValid = await user.isValidPassword(password);

    if (!isPasswordValid) {
      throw new Error("Invalid Credentials");
    }

    const jwtToken = await jwt.sign(
      {
        userId: user._id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
      "DevTinder@Saiabhi17",
      {
        algorithm: "HS256",
        expiresIn: "8h",
        issuer: "DevTinder",
      }
    );

    res.cookie("token", jwtToken, {
      httpOnly: true,
      expires: new Date(Date.now() + 8 * 60 * 60 * 1000),
    });
    res.send("User logged in successfully!!!");
  } catch (err) {
    res.status(400).send("Error logging in user : " + err.message);
  }
});

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
