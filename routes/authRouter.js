const express = require("express");
const route = express.Router();
const authController = require("../controllers/authController");
const isNotAuthenticated = require("../middleware/isNotAuthenticated");

//signup get and post route
route.get("/signup", isNotAuthenticated, authController.getSignup);
route.post("/signup", isNotAuthenticated, authController.postSignup);

//login get and post route
route.get("/login", isNotAuthenticated, authController.getLogin);
route.post("/login", isNotAuthenticated, authController.postLogin);

//forgot password get and post route
route
  .route("/forgot-password")
  .get(authController.getForgotPassword)
  .post(authController.postForgotPassword);

//change password get pas post route
route
  .route("/change-password")
  .get(authController.getChangePassword)
  .post(authController.postChangePassword);

module.exports = route;
