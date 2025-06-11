const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, minLength: 2, maxLength: 50 },
    lastName: { type: String, maxLength: 50, default: "" },
    username: { type: String, required: true, unique: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("Invalid Email");
        }
      },
    },
    password: {
      type: String,
      required: true,
      validate(value) {
        if (!validator.isStrongPassword(value)) {
          throw new Error(
            "Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, one number, and one symbol."
          );
        }
      },
    },
    mobile: {
      type: Number,
      required: true,
      unique: true,
      trim: true,
      validate(value) {
        if (!validator.isMobilePhone(value.toString())) {
          throw new Error("Invalid Mobile Number");
        }
      },
    },
    photoUrl: {
      type: String,
      default:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT58-VVT8Wch6ligqL9BVGs4hHtZ2ChZeURvA&s",
    },
    dateOfBirth: { type: Date },
    about: {
      type: String,
      default:
        "Software Engineer interesting in connecting with Other Software Engineers",
    },
    skills: { type: [String] },
    age: { type: Number, min: 18, max: 100 },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
    },
  },
  {
    timestamps: true, //Adds createdAt and updatedAt fields
  }
);

userSchema.methods.encryptPassword = async function () {
  const user = this;

  return await bcrypt.hash(user.password, 10);
};

userSchema.methods.isValidPassword = async function (passwordInput) {
  const user = this;
  const encryptedPassword = user.password;

  return await bcrypt.compare(passwordInput, encryptedPassword);
};

const User = mongoose.model("User", userSchema);

module.exports = User;
