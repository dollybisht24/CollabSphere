import passport from 'passport';
import dotenv from 'dotenv';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User.js';

dotenv.config();

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Google OAuth Strategy - only initialize if credentials are provided
const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

if (googleClientId && googleClientSecret && 
    googleClientId !== 'your_google_client_id_here' && 
    googleClientSecret !== 'your_google_client_secret_here') {
  
  passport.use(
    new GoogleStrategy(
      {
        clientID: googleClientId,
        clientSecret: googleClientSecret,
        callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback',
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Check if user already exists
          let user = await User.findOne({ email: profile.emails[0].value });

          if (user) {
            // Update Google ID if not set
            if (!user.googleId) {
              user.googleId = profile.id;
              await user.save();
            }
            return done(null, user);
          }

          // Create new user
          user = await User.create({
            googleId: profile.id,
            name: profile.displayName,
            email: profile.emails[0].value,
            profilePicture: profile.photos[0]?.value,
            // Generate a random password for Google users (they won't use it)
            password: Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8),
          });

          done(null, user);
        } catch (error) {
          done(error, null);
        }
      }
    )
  );
  
  console.log('✓ Google OAuth configured');
} else {
  console.log('⚠ Google OAuth not configured - using email/password only');
  console.log('  To enable Google login, set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env');
}

export default passport;
