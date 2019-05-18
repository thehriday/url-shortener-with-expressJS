const express = require("express");
const app = express();
require("dotenv").config();
const authRoute = require("./routes/authRouter");
const expressLayouts = require("express-ejs-layouts");
const expressValidator = require("express-validator");
const mongoose = require("mongoose");
const session = require("express-session");
const flash = require("connect-flash");
const User = require("./models/User");
const shortenerRouter = require("./routes/shortenerRouter");
const passport = require("passport")


//local strategy
require("./passport/passport")
// database connection
require("./util/dbConnection");

//session middleware
app.use(
  session({
    secret: "hridoy",
    resave: false,
    saveUninitialized: false
  })
);
//flash middleware
app.use(flash());
//passport middleware
app.use(passport.initialize())
app.use(passport.session())
//set static directory
app.use(express.static("public"));
//set view engine to ejs
app.set("view engine", "ejs");
//for layoutig
app.use(expressLayouts);
//parseing body
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
//set default title for every page
app.locals.title = "Url Shortener With Express";
//express validator
app.use(expressValidator());
//middle ware
app.use(async (req, res, next) => {
  
  // check, is user login or not
  if (req.isAuthenticated()) {
    app.locals.authUser = req.user;
  }else{
    app.locals.authUser = false
  }
  
  //set errors and success msg for every page
  app.locals.errors = req.flash("errors") || []
  app.locals.error = req.flash("error") || []
  app.locals.success = req.flash("success") || [];
  next();
});

//authentication route
app.use("/auth", authRoute);

//home route
app.get("/", (req, res) => {
  res.render("home", {
    title: "Welcome to Url-Shortener with expressJS",
    path: "/"
  });
});

//shortener route
app.use(shortenerRouter);

//logout route
app.get("/logout", (req, res) => {
  req.logOut()
  res.redirect("/auth/login");
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));

db.once("open", () => {
  app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
  });
});
