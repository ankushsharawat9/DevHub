import dotenv from 'dotenv';
dotenv.config();
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User.js';


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

          // Optional: mark unverified manual user as verified
          // if (!user.isVerified) {
          //   user.isVerified = true;
          //   await user.save();
          // }

          return done(null, user);
        }

        // Create new user for Google account
        const newUser = new User({
          name,
          email,
          isVerified: true,
          password: Math.random().toString(36).slice(-8), // dummy password
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

// Optional session handling (can be removed if using JWT stateless auth)
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
