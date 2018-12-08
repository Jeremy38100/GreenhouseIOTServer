"use strict";

const mongoose    = require('mongoose');
const BaseRoutes  = require('../base/routes');

class DeviceDataRoutes extends BaseRoutes {
  constructor(db) {
    super('deviceData', db);
  }
}

module.exports = new DeviceDataRoutes(mongoose);