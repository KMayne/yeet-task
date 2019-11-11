#!/usr/bin/env node

const express = require('express');
const dotenv = require('dotenv');
const fileSync = require('lowdb/adapters/FileSync');
const history = require('connect-history-api-fallback');
const low = require('lowdb');
const path = require('path');
const winston = require('winston');

const apiRouter = require('./api-router');

// Load environment variables from .env file
dotenv.config();
// Set up Lowdb with data file
const adapter = new fileSync('./data/db.json');
const db = low(adapter);
// Initialise app
const app = express();

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.colorize({ all: true }),
    winston.format.simple()
  ),
  transports: new winston.transports.Console(),
});

// Setup database;
db.defaults({ }).write();

// Set up API routes
app.use('/api', apiRouter);
app.use(history());

// Set up front end resources
if (['development', 'staging', 'testing'].includes(process.env.NODE_ENV)) {
  // Webpack middleware for use in development
  logger.info('Setting up webpack-dev-middleware...');
  const webpack = require('webpack');
  const webpackDevMiddleware = require('webpack-dev-middleware');
  const hotMiddleware = require('webpack-hot-middleware');

  const config = require('../web-app/webpack.config');
  const compiler = webpack(config);

  app.use(webpackDevMiddleware(compiler));
  app.use(hotMiddleware(compiler, { log: console.log }));
} else {
  // Make static web app files accessible
  app.use(express.static(path.join('.', 'web-app','dist')));
}

// 404 handler
app.use((req, res, next) => next({ message: 'Not found', status: 404 }));

// Error handler
app.use((err, req, res, _) => {
  logger.error('Error in request: ' + err + err.stack);
  res.status(err.status || 500);
  res.json(req.app.get('env') === 'development' ? err : { message : err.message });
});

app.logger = logger;
module.exports = app;
