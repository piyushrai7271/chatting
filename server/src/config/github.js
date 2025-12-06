import gitPassport from "passport";
import { Strategy as GitHubStrategy } from "passport-github2";
import dotenv from "dotenv";
import { findOrCreateGithubUser } from "../services/auth/githubAuth.service.js";

dotenv.config();

gitPassport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: process.env.GITHUB_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const user = await findOrCreateGithubUser(profile);
        done(null, user);
      } catch (err) {
        done(err, null);
      }
    }
  )
);

export default gitPassport;
