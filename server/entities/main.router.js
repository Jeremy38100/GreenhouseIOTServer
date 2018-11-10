'use strict';

var express = require('express');

class Router {

  constructor(db) {
    this.router = express.Router();
    this.init(db);
  }

  init(db) {
    let DeviceData    = require('./devicedata/routes'   );

    let deviceData  = new DeviceData(db);

    this.router.use('/deviceData',  deviceData.router   );

  }

}

module.exports = Router;
