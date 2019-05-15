const express = require("express");
const app = express();
require("dotenv").config();
const authRoute = require("./routes/authRouter");
const expressLayouts = require("express-ejs-layouts");
const expressValidator = require("express-validator");
const mongoose = require("mongoose");
const session = require("express-session");
const flash = require("connect-flash");
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
//set success and errors for validation
app.use((req,res,next)=>{
  app.locals.errors = req.flash("errors") || []
  app.locals.success = req.flash("success") || []
  next()
})

//authentication route
app.use("/auth", authRoute);

app.get("/set",(req,res)=>{
  req.session.name = "Hridoy"
  res.send("Setted")
})


const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));

db.once("open", () => {
  app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
  });
});
