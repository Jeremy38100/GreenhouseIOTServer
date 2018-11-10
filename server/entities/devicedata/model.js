"use strict";

const mongoose    = require('mongoose');
const _           = require('underscore');
const BaseFields  = require('../base.fields');

const fields = _.extend(_.clone(BaseFields), {
  deviceId: {type: String, required: true},
  sensor: {type: String, required: true},
  data: {type: mongoose.Schema.Types.Mixed, required: true}
});

const schema = new mongoose.Schema(fields);

module.exports = function (mongoose) {
  return mongoose.model('devicedata', schema);
};
