const JwtStrategy = require('passport-jwt').Strategy;
const BearerStrategy = require('passport-http-bearer');
const { ExtractJwt } = require('passport-jwt');
const { jwtSecret } = require('./vars');
// const authProviders = require('../api/services/authProviders');
const User = require('../api/models/login.model');

const jwtOptions = {
  secretOrKey: jwtSecret,
  jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme('Bearer'),
};

const jwt = async (payload, done) => {
  try {
    const user = await User.findById(payload.sub);
    if (user) return done(null, user);
    return done(null, false);
  } catch (error) {
    return done(error, false);
  }
};


exports.jwt = new JwtStrategy(jwtOptions, jwt);

