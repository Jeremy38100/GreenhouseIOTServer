"use strict";

const mongoose        = require('mongoose');
const logger          = require('./logger');
const express         = require('express');
const config          = require('./config');
const request         = require('request');
const path            = require('path');

module.exports = function(app, db) {

  if(process.env.NODE_ENV != "production" && process.env.NAME != "development") {
    // those files won't be affected by the middleware placed after those lines of code
    logger.info("- local environment -");
    logger.info("setting up static files");

    app.use('/bower_components', express.static(path.join(__dirname, '/../../pickeat-admin/bower_components')));
    app.use('/',                 express.static(path.join(__dirname, '/../../pickeat-admin/app')));
  }

  if (process.env.NAME != "production" && process.env.NAME != "development") {
    app.use('/',                  express.static(path.join(__dirname, '../../pickeat-admin/app')));
    app.use('/bower_components',  express.static(path.join(__dirname, '../../pickeat-admin/bower_components')));
  } else {
    app.get('/', (req, res, next) => {
      return res.status(200).send("OK");
    })
  }

  app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, Content-Length");
    return next();
  });

  app.use('/api', (req, res, next) => {
		if (req.method == "OPTIONS") {
			return res.status(200).send("GET,POST,PUT,DELETE");
		} else {
			next();
		}
	});

  app.use('/api', (req, res, next) => {
    next();
  });

  const Main = require('./entities/main.router');

  const main = new Main(mongoose);

  app.use('/api', main.router);


}
