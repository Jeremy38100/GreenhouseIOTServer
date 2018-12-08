'use strict';

const mqtt = require('mqtt');
const mongoose = require('mongoose');
const logger = require('../../logger');
const _ = require('underscore');
const config = require('../../config');
const DeviceDataCtrl = require('../../entities/devicedata/controller');

class MQTT {
  
  constructor() {
    this.interval = null;
    this.deviceDataCtrl = new DeviceDataCtrl(mongoose);
  }

  listen(ws) {
    return new Promise((resolve, reject) => {
      this.firstMessageReceived = false;
      this.ws = ws;
      this.client = mqtt.connect(config.mqttProd.method + "://" + config.mqttProd.host + ":" + config.mqttProd.port);
      this.client.on('connect', () => {
        resolve()
        logger.info("MQTT connected");
        this.client.subscribe(config.mqttProd.mainTopic, (err) => {
          if (err) {
            logger.error("Mqtt client could not subscribe to the topic " + config.mqttProd.mainTopic, err);
          }
          // Uncomment this lines if you want to test the publish method with the socket
          // this.publishEach(60);
        });
      });
      this.client.on('message', (topic, message) => {
        if (this.firstMessageReceived) {
          this.onMessage(topic, message);
        } else {
          this.firstMessageReceived = true;
        }
      });
      this.client.on('err', (err) => {
        this.onError(err);
        reject(err);
      });
      this.client.on('close', () => {
        this.onClose();
      });
    });
  }
  
  onMessage(topic, message) {
    logger.info("Message received on topic : " + topic);
    logger.info(JSON.parse(message));
    let splittedTopic = topic.split('/');
    let jsonMessage = JSON.parse(message);
    if (Object.keys(jsonMessage).length > 0) {
      let deviceData = {
        deviceId: splittedTopic[0],
        sensor: splittedTopic[3],
        data: jsonMessage
      };
      this.deviceDataCtrl.insertPromise(deviceData).then(res => {
        logger.info("Successfully saved device data");
      });
      this.ws.connections.forEach(connection => {
        this.ws.send(connection.socket, JSON.stringify(deviceData));
      });
    } else {
      logger.warn("No data received");
    }
  }

  onError(error) {
    logger.error("An error occured");
    logger.error(error);
    clearInterval(this.interval);
  }

  onClose() {
    logger.info("Mqtt connection closed");
    clearInterval(this.interval);
  }

  publishEach(seconds) {
    this.interval = setInterval(() => {
      this.client.publish(config.mqttProd.dataTopic + '/humidite/humidity', JSON.stringify({
        humidity: Math.round(Math.random() * 30 + 30)
      }));
    }, seconds * 1000); // Convert seconds into milliseconds
  }

  close() {
    return new Promise((resolve, reject) => {
      this.client.end(true, () => {
        resolve();
      });
    });
  }

}

module.exports = new MQTT();