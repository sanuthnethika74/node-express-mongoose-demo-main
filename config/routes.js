'use strict';

/*
 * Module dependencies.
 */

const users = require('../app/controllers/users');
const articles = require('../app/controllers/articles');
const comments = require('../app/controllers/comments');
const tags = require('../app/controllers/tags');
const auth = require('./middlewares/authorization');
const rateLimit = require('express-rate-limit');

/**
 * Route middlewares
 */

const articleAuth = [auth.requiresLogin, auth.article.hasAuthorization];
const commentAuth = [auth.requiresLogin, auth.comment.hasAuthorization];

const fail = {
  failureRedirect: '/login'
};

/**
 * Expose routes
 */

module.exports = function(app, passport) {
  const pauth = passport.authenticate.bind(passport);

  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: 'Too many login attempts. Please try again after 15 minutes.'
  });

  const signupLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 3,
    standardHeaders: true,
    legacyHeaders: false,
    message: 'Too many signup attempts. Please try again later.'
  });

  // user routes
  app.get('/login', users.login);
  app.get('/signup', users.signup);
  app.get('/logout', users.logout);
  app.post('/users', signupLimiter, users.create);
  app.post(
    '/users/session',
    authLimiter,
    pauth('local', {
      failureRedirect: '/login',
      failureFlash: 'Invalid email or password.'
    }),
    users.session
  );
  app.get('/users/:userId', users.show);
  app.get('/auth/github', pauth('github', fail), users.signin);
  app.get('/auth/github/callback', pauth('github', fail), users.authCallback);
  app.get('/auth/twitter', pauth('twitter', fail), users.signin);
  app.get('/auth/twitter/callback', pauth('twitter', fail), users.authCallback);
  app.get(
    '/auth/google',
    pauth('google', {
      failureRedirect: '/login',
      scope: [
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email'
      ]
    }),
    users.signin
  );
  app.get('/auth/google/callback', pauth('google', fail), users.authCallback);
  app.get(
    '/auth/linkedin',
    pauth('linkedin', {
      failureRedirect: '/login',
      scope: ['r_emailaddress']
    }),
    users.signin
  );
  app.get(
    '/auth/linkedin/callback',
    pauth('linkedin', fail),
    users.authCallback
  );

  app.param('userId', users.load);

  // article routes
  app.param('id', articles.load);
  app.get('/articles', articles.index);
  app.get('/articles/new', auth.requiresLogin, articles.new);
  app.post('/articles', auth.requiresLogin, articles.create);
  app.get('/articles/:id', articles.show);
  app.get('/articles/:id/edit', articleAuth, articles.edit);
  app.put('/articles/:id', articleAuth, articles.update);
  app.delete('/articles/:id', articleAuth, articles.destroy);

  // home route
  app.get('/', articles.index);

  // comment routes
  app.param('commentId', comments.load);
  app.post('/articles/:id/comments', auth.requiresLogin, comments.create);
  app.get('/articles/:id/comments', auth.requiresLogin, comments.create);
  app.delete(
    '/articles/:id/comments/:commentId',
    commentAuth,
    comments.destroy
  );

  // tag routes
  app.get('/tags/:tag', tags.index);

  /**
   * Error handling
   */

app.use(function (err, req, res, next) {
  if (
    err.message &&
    (~err.message.indexOf('not found') ||
      ~err.message.indexOf('Cast to ObjectId failed'))
  ) {
    return next();
  }

  console.error(err.stack);

  const isValidationError =
    err.name === 'ValidationError' ||
    (err.stack && err.stack.includes('ValidationError'));

  if (isValidationError) {
    return res.status(422).render('422', {
      error: 'Your request could not be processed.',
    });
  }

  return res.status(500).render('500', {
    error: 'Something went wrong on our side. Please try again later.',
  });
});

  // assume 404 since no middleware responded
  app.use(function(req, res) {
    const payload = {
      url: req.originalUrl,
      error: 'Not found'
    };
    if (req.accepts('json')) return res.status(404).json(payload);
    res.status(404).render('404', payload);
  });
};
