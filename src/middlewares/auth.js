const userAuth = (req, res, next) => {
  const isAuthenticated = false;

  if (isAuthenticated) {
    console.log("User is Authenticated");
    next();
  } else {
    console.log("User is not Authenticated");
    res.status(401).send("Authentication Error: User is not authenticated.");
  }
};

module.exports = userAuth;
