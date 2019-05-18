const User = require("../models/User");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const passport = require("passport")


exports.getSignup = (req, res) => {
  res.render("auth/signup", { title: "Please Sign Up",path:"/auth/signup"});
};

exports.postSignup = async (req, res) => {
  let { name, userName, email, password, confirmPassword } = req.body;
  //name validation
  if (name.length === 0) {
    req.check("name", "Name is required").custom(() => false);
  } else {
    req
      .check("name", "Name should be atleast 3 character")
      .isLength({ min: 3 });
  }
  //user name validation
  if (userName.length === 0) {
    req.check("userName", "Username is required").custom(() => false);
  } else if (userName.length < 3) {
    req.check("userName", "Username should be 3 character").custom(() => false);
  } else {
    const usernameExist = await User.findOne({ userName });
    if (usernameExist) {
      req
        .check("userName", "Username should be unique, try another")
        .custom(() => false);
    }
  }
  //email validation
  if (email.length === 0) {
    req.check("email", "Email is required").custom(() => false);
  } else if (!validator.isEmail(email)) {
    req.check("email", "Email is not Valid").isEmail();
  } else {
    const emailExist = await User.findOne({ email });
    if (emailExist) {
      req
        .check("email", "Email should be unique, try another")
        .custom(() => false);
    }
  }
  //password validation
  if (password.length === 0) {
    req.check("password", "Password is required").custom(() => false);
  } else if (password.length < 8) {
    req
      .check("password", "Password should be atleast 8 character")
      .custom(() => false);
  } else {
    req
      .check("password", "Password and confirm Password are not match")
      .equals(confirmPassword);
  }
  // store to database
  if (!req.validationErrors()) {
    password = bcrypt.hashSync(password);
    const user = User({ name, userName, email, password });
    user
      .save()
      .then(() => {
        req.flash("success", "You have Registered Successfully");
        res.redirect("/auth/login");
      })
      .catch(err => {
        console.log(err);
      });
  } else {
    req.flash("errors", req.validationErrors());
    res.redirect("back");
  }
};

//login get controller
exports.getLogin = (req, res) => {
  res.render("auth/login", { title: "Please Login", path:"/auth/login"});
};

// login post controller
exports.postLogin = (req, res,next) => {
  passport.authenticate("local",{
    successRedirect:"/",
    failureRedirect:"/auth/login",
    failureFlash:true
  })(req,res,next)
};

