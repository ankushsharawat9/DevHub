const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_REDIRECT_URI,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        if (!email) return done(new Error('Google profile has no email'), null);

        const existingUser = await User.findOne({ email });

        if (existingUser && !existingUser.googleId) {
          return done(
            new Error('This email is already registered manually. Please login using email and password.'),
            null
          );
        }

        if (existingUser) return done(null, existingUser);

        const newUser = await User.create({
          googleId: profile.id,
          name: profile.displayName,
          email,
          profilePic: profile.photos?.[0]?.value,
          isVerified: true,
          loginType: 'google', // ✅ Save login type
        });

        return done(null, newUser);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);
