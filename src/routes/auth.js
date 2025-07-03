const express = require("express");
const userAuth = require("../middlewares/userAuth");
const requestValid = require("../middlewares/requestValid");
const jwt = require("jsonwebtoken");
const User = require("../models/user");

const authRouter = express.Router();

authRouter.post("/auth/signup", requestValid, async (req, res) => {
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
  let user = new User({
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
    const passwordHash = await user.encryptPassword(password);

    user.password = passwordHash;
    user.email = user.email.toLowerCase(); // Ensure email is stored in lowercase

    user = await user.save();
    delete user.password;
    delete user.__v;

    res
      .status(201)
      .json({ message: "User created successfully!!!", data: user });
  } catch (err) {
    res.status(400).json({
      message:
        "Error creating user: " + user.email + " with error: " + err.message,
      data: {},
    });
  }
});

authRouter.post("/auth/login", async (req, res) => {
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
    res.json({ message: "User logged in successfully!!!", data: user });
  } catch (err) {
    res
      .status(400)
      .json({ message: "Error logging in user : " + err.message, data: {} });
  }
});

authRouter.post("/auth/logout", userAuth, async (req, res) => {
  try {
    res.clearCookie("token", {
      expires: new Date(Date.now()),
    });
  } catch (err) {
    res
      .status(400)
      .json({ message: "Error logging out user: " + err.message, data: {} });
  }
});

module.exports = authRouter;
