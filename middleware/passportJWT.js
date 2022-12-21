const config = require("../config/index");
const models = require("../models/index");
const passport = require("passport");

const JwtStrategy = require("passport-jwt").Strategy,
  ExtractJwt = require("passport-jwt").ExtractJwt;
const opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = config.JWT_SECRET;
// opts.issuer = "accounts.examplesoft.com";
// opts.audience = "yoursite.net";
passport.use(
  new JwtStrategy(opts, async (jwt_payload, done) => {
    try {
      const users = await models.User.findByPk(jwt_payload.id);

      if (!users) {
        return done(new Error("ไม่พบผู้ใช้ในระบบ"), null);
      }

      return done(null, users);
    } catch (error) {
      done(error);
    }
  })
);

module.exports.isLogin = passport.authenticate("jwt", { session: false });
