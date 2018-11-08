'use strict';

const mqtt = require('mqtt');
const logger = require('../../logger');
const _ = require('underscore');
const config = require('../../config');

class MQTT {
  
  constructor() {}

  listen() {
    this.client = mqtt.connect(config.mqtt.method + "://" + config.mqtt.host + ":" + config.mqtt.port);
    this.client.on('connect', this.onConnect);
  }

  onConnect() {
    logger.info("MQTT connected");
  }

}

module.exports = new MQTT();