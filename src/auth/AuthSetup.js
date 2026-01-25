import session from "express-session";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { AuthService } from "../services/auth/AuthService.js"; //

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
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value;
          const name = profile.displayName;

          // call your service to register or find user
          const user = await AuthService.registerGoogleUser({ email, name });

          // done passes the user to Passport
          return done(null, user);
        } catch (err) {
          console.error("GoogleStrategy error:", err);
          return done(err, null);
        }
      },
    ),
  );

  // SERIALIZE / DESERIALIZE
  passport.serializeUser((user, done) => done(null, user));
  passport.deserializeUser((user, done) => done(null, user));
};
