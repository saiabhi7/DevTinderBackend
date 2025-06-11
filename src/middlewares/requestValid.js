const requestValid = (req, res, next) => {
  const allowedFields = [
    "firstName",
    "lastName",
    "username",
    "email",
    "password",
    "mobile",
    "photoUrl",
    "dateOfBirth",
    "about",
    "skills",
    "age",
    "gender",
  ];
  const reqBody = req.body;

  const isValidRequest = Object.keys(reqBody).every((key) =>
    allowedFields.includes(key)
  );

  if (!isValidRequest) {
    res
      .status(400)
      .send(
        "Invalid Request: Only allowed fields are " + allowedFields.join(", ")
      );
  }
  next();
};

module.exports = requestValid;
