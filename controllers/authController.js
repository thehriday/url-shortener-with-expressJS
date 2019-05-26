const User = require("../models/User");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const passport = require("passport");
const path = require("path");
const mongoose = require("mongoose");
const { randomBytes } = require("crypto");
const mailTranspoter = require("../util/mailTranspoter");

exports.getSignup = (req, res) => {
  res.render("auth/signup", { title: "Please Sign Up", path: "/auth/signup" });
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

  //photo validation
  const { photo } = req.files;

  const photoType = [".jpg", ".jpeg", ".png", ".gif"];
  const photoExt = path.extname(photo.name);
  //type validation and size validation
  if (photo.name) {
    if (!photoType.includes(photoExt)) {
      req.check("photo", "You have to upload a photo").custom(() => false);
    } else if (photo.size > 1000 * 1000 * 2) {
      req
        .check("photo", "photo size must be less then 2MB.")
        .custom(() => false);
    }
  }

  // store to database
  if (!req.validationErrors()) {
    password = bcrypt.hashSync(password);
    const user = User({
      _id: new mongoose.Types.ObjectId(),
      name,
      userName,
      email,
      password
    });
    // save profile photo
    if (photo.name) {
      const photoLink = user._id + photoExt;
      photo.mv(path.join("public", "photos", photoLink), err => {
        if (err) {
          console.log("error happend to save photo");
        }
      });
      user.photoLink = photoLink;
    }
    // save user to database
    user
      .save()
      .then(() => {
        req.flash("success", "You have Registered Successfully");
        res.redirect("/auth/login");
      })
      .catch(err => console.log(err));
  } else {
    req.flash("errors", req.validationErrors());
    res.redirect("back");
  }
};

//login get controller
exports.getLogin = (req, res) => {
  res.render("auth/login", { title: "Please Login", path: "/auth/login" });
};

// login post controller
exports.postLogin = (req, res, next) => {
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/auth/login",
    failureFlash: true
  })(req, res, next);
};

//view for forgot password
exports.getForgotPassword = (req, res) => {
  res.render("auth/forgot-password", {
    title: "Forgot Password",
    path: "/auth/forgot-password"
  });
};

//post for forgot password

exports.postForgotPassword = async (req, res) => {
  req
    .check("unameOrEmail", "Username or Email is required")
    .not()
    .isEmpty();
  if (!req.validationErrors()) {
    //decide input is Email or username and find the user
    let user;
    if (validator.isEmail(req.body.unameOrEmail)) {
      user = await User.findOne({ email: req.body.unameOrEmail });
    } else {
      user = await User.findOne({ userName: req.body.unameOrEmail });
    }
    //if user exist add a unique number and expire date with user and save to DB
    if (user) {
      user.forgotPasswordToken = randomBytes(32).toString("hex");
      user.forgotPasswordTime = Date.now() + 1000 * 60 * 2;
      await user.save();
      //send mail to user for resting password
      await mailTranspoter.sendMail({
        from: '"admin@url-shortener.com',
        to: user.email,
        subject: "Password Rest",
        text: "Password Reset/n",
        html: `
        Hi ${user.name}<br>
        <b>To Reset your password </b> <a href='${
          process.env.HOST_URL
        }/auth/change-password?token=${
          user.forgotPasswordToken
        }'>Click Here</a> `
      });
      req.flash("success", ["Check Your Mail to change password"]);
      res.redirect("/auth/login");
    }
    //if user not exist display error
    else {
      req.flash("errors", { msg: "No user found with this email or username" });
      res.redirect("back");
    }
  } else {
    req.flash("errors", req.validationErrors());
    res.redirect("back");
  }
};

exports.getChangePassword = async (req, res) => {
  const { token } = req.query;
  const user = await User.findOne({
    forgotPasswordToken: token,
    forgotPasswordTime: { $gt: Date.now() }
  });

  if(user){
    res.render("auth/changePassword",{title:"Change Password",path:"/auth/change-password",token:user.forgotPasswordToken})
  }
  else{
    req.flash("errors", { msg: "Invalid Token or Token time expired!!" });
    res.redirect("/auth/login");
  }
  
};

exports.postChangePassword = async (req, res) => {
  const { password, forgotPasswordToken } = req.body;
  const user = await User.findOne({
    forgotPasswordToken: forgotPasswordToken,
    forgotPasswordTime: { $gt: Date.now() }
  });
  if(user){
    user.password = await bcrypt.hash(password,10)
    user.forgotPasswordTime = undefined;
    user.forgotPasswordToken = undefined;
    await user.save()
    req.flash("success", ["Password Changed Succesfully!!"]);
    res.redirect("/auth/login");
  }
  else{
    req.flash("errors", { msg: "Invalid Token or Token time expired!!" });
    res.redirect("/auth/login");
  }
};
