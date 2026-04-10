'use strict';

/**
 * Expose
 */

const port = process.env.PORT || 3000;

module.exports = {
  db: process.env.MONGODB_URL || 'mongodb+srv://sanuthnethika_db_user:TUmVk6r5z847mQ0M@cluster0.556mgxf.mongodb.net/?appName=Cluster0',
  twitter: {
    clientID: process.env.TWITTER_CLIENTID,
    clientSecret: process.env.TWITTER_SECRET,
    callbackURL: `http://localhost:${port}/auth/twitter/callback`
  },
  github: {
    clientID: process.env.GITHUB_CLIENTID,
    clientSecret: process.env.GITHUB_SECRET,
    callbackURL: `http://localhost:${port}/auth/github/callback`
  },
  linkedin: {
    clientID: process.env.LINKEDIN_CLIENTID,
    clientSecret: process.env.LINKEDIN_SECRET,
    callbackURL: `http://localhost:${port}/auth/linkedin/callback`
  },
  google: {
    clientID: process.env.GOOGLE_CLIENTID,
    clientSecret: process.env.GOOGLE_SECRET,
    callbackURL: `http://localhost:${port}/auth/google/callback`
  }
};
