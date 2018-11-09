'use strict';

const mqtt = require('mqtt');
const logger = require('../../logger');
const _ = require('underscore');
const config = require('../../config');

class MQTT {
  
  constructor(ws) {
    this.ws = ws;
    this.interval = null;
  }

  listen() {
    this.client = mqtt.connect(config.mqttProd.method + "://" + config.mqttProd.host + ":" + config.mqttProd.port);
    this.client.on('connect', () => {
      logger.info("MQTT connected");
      this.client.subscribe(config.mqttProd.mainTopic, (err) => {
        if (err) {
          logger.error("Mqtt client could not subscribe to the topic " + config.mqttProd.mainTopic, err);
        }
        // Uncomment this lines if you want to test the publish method with the socket
        // this.publishEach(5000, {
        //   humidity: Math.round(Math.random() * 30 + 30)
        // });
      });
    });
    this.client.on('message', (topic, message) => {
      this.onMessage(topic, message);
    });
    this.client.on('err', (err) => {
      this.onError(err);
    });
    this.client.on('close', () => {
      this.onClose();
    });
  }
  
  onMessage(topic, message) {
    logger.info("Message received on topic : " + topic);
    logger.info(JSON.parse(message));
    this.ws.connections.forEach(connection => {
      this.ws.send(connection.socket, JSON.stringify(JSON.parse(message)));
    });
  }

  onError(error) {
    logger.error("An error occured");
    logger.error(error);
  }

  onClose() {
    logger.info("Mqtt connection closed");
    clearInterval(this.interval);
  }

  publishEach(seconds, data) {
    this.interval = setInterval(() => {
      console.log("Publish");
      this.client.publish(config.mqttProd.dataTopic + '/humidite/humidity', JSON.stringify(data));
    }, seconds);
  }

}

module.exports = MQTT;