"use strict";

const Model           = require('./model');
const ControllerBase  = require('../base/controller');

class DeviceData extends ControllerBase {

  constructor (db) {
    super('devicedata');
    this.dao = new Model(db);
  }
  
}

module.exports = DeviceData;
