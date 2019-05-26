const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const User = require("../models/User");
const bcrypt = require("bcryptjs");

passport.use(
  new LocalStrategy(
    { usernameField: "email" },
    async (email, password, done) => {
      const user = await User.findOne({ email });
      if (user) {
        const isAuth = await bcrypt.compare(password, user.password);
        if (isAuth) {
          done(null, user);
        } else {
          done(null, false, { message: "Password did not match" });
        }
      } else {
        done(null, false, { message: "Email is not valid" });
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    return done(null, user);
  });
});
