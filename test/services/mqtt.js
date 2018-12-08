"use strict";

const mqtt    = require('mqtt');
const logger  = require('../../server/logger');
const config  = require('../../server/config');
const helper  = require('../helper');
const DeviceDataRoutes = require('../routes/device.data.routes.test');

const expect    = require('chai').expect;

const deviceData = {
  deviceId: 'deviceId',
  sensor: 'sensor',
  data: {
    data: 0
  }
};

describe('#mqtt', () => {

  let server = require('../../server/server');
  let client;

  before((done) => {
    logger.info("before - start");

    config.mongodb.dbName = process.env.MONGO_DBNAME || 'greenhouseiot-test';

    server.boot(config)
    .then(() => {
      return helper.dropCollectionsAndModels();
    })
    .then(() => {
      logger.info("before - end");
      done();
    })

  });

  it('#should create a mqtt client', (done) => {
    client = mqtt.connect(config.mqttProd.method + "://" + config.mqttProd.host + ":" + config.mqttProd.port);
    client.on('connect', () => {
      logger.info("MQTT connected");
      done();
    });
    client.on('err', (err) => {
      logger.error(err);
    });
  });

  it('#should publish a message on mqtt topic', (done) => {
    setTimeout(() => {
      client.publish(config.mqttProd.dataTopic + '/humidite/humidity', JSON.stringify({
        humidity: 45
      }), {}, () => {
        done();
      });
    }, 500);
  });

  it('#should have saved the message from the mqtt topic and get it', (done) => {
    let params = {
      config: config
    };
    setTimeout(() => {
      DeviceDataRoutes.get(params, (err, res) => {
  
        if (err) return logger.error(err);
        expect(err).to.be.null;
        expect(res).to.not.be.null;
        expect(res.status).to.equal(200);
        expect(res.body).to.not.be.null;
        expect(res.body.length).to.be.equal(1);
        expect(res.body[0]._id).to.not.be.null;
        expect(res.body[0].data.humidity).to.be.equal(45);
  
        done();
      });
    }, 500);

  });

  after((done) => {

    helper.dropCollectionsAndModels()
    .then(() => {
      return helper.disconnect();
    })
    .then(() => {
      return server.shutdown();
    })
    .then(() => {
      done();
    });

  });

});