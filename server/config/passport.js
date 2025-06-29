const GoogleStrategy = require('passport-google-oauth20').Strategy;
const passport = require('passport');
const User = require('../models/User');

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: '/api/auth/google/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value;
        const name = profile.displayName;

        let user = await User.findOne({ email });

        if (user) {
          console.log('✅ Existing user found for Google login');

          // If user registered manually but not verified, you can optionally:
          // if (!user.isVerified) {
          //   user.isVerified = true;
          //   await user.save();
          // }

          return done(null, user);
        }

        // No existing user found, create a new one via Google
        const newUser = new User({
          name,
          email,
          isVerified: true, // Google account is trusted
          password: Math.random().toString(36).slice(-8), // dummy password for required field
        });

        await newUser.save();
        console.log('✅ New user created via Google login');
        return done(null, newUser);
      } catch (err) {
        console.error('❌ Error in Google Strategy:', err);
        return done(err, null);
      }
    }
  )
);

// For sessions (optional, can be removed if you're stateless with JWT)
passport.serializeUser((user, done) => {
  done(null, user.id);
});
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});
