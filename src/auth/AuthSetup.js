import session from "express-session";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";

export const SetupAuth = (app) => {
  // REQUIRED for Cloudflare / HTTPS
  app.set("trust proxy", 1);

  // SESSION
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "secret123",
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: true,
        sameSite: "none",
      },
    }),
  );

  // PASSPORT INIT
  app.use(passport.initialize());
  app.use(passport.session());

  // GOOGLE STRATEGY
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: `${process.env.FRONTEND_URL}/auth/google/callback`,
      },
      (accessToken, refreshToken, profile, done) => {
        const userData = {
          id: profile.id,
          name: profile.displayName,
          email: profile.emails?.[0]?.value,
          photo: profile.photos?.[0]?.value,
        };

        return done(null, userData);
      },
    ),
  );

  // SERIALIZE / DESERIALIZE
  passport.serializeUser((user, done) => done(null, user));
  passport.deserializeUser((user, done) => done(null, user));
};
