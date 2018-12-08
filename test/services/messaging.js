"use strict";

const io      = require('socket.io-client');
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

describe('#messaging', () => {

  let server = require('../../server/server');
  let mqttClient;
  let socketClient;
  let messaging;

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
    mqttClient = mqtt.connect(config.mqttProd.method + "://" + config.mqttProd.host + ":" + config.mqttProd.port);
    mqttClient.on('connect', () => {
      logger.info("MQTT connected");
      done();
    });
    mqttClient.on('err', (err) => {
      logger.error(err);
    });
  });

  it('#should create a web socket client', (done) => {
    socketClient = io.connect('ws://' + config.host + ':' + config.port);
    socketClient.on('connect', () => {
      done();
    });
    socketClient.on('disconnect', () => {
      logger.warn('socket disconnected');
    });
  });

  it('#should have one connection in the web socket server', (done) => {
    messaging = require('../../server/services/messaging');

    expect(messaging.connections).to.not.be.equal([]);
    expect(messaging.connections.length).to.be.equal(1);

    done();

  });

  it('#should publish a message on mqtt topic and receive it through socket', (done) => {
    socketClient.on('message', message => {

      expect(message.data).to.exist;
      let payload = JSON.parse(message.data);

      expect(payload).to.not.be.null;
      expect(payload.data).to.exist;
      expect(payload.data.humidity).to.exist;
      expect(payload.data.humidity).to.equal(45);

      done();

    });
    setTimeout(() => {
      mqttClient.publish(config.mqttProd.dataTopic + '/humidite/humidity', JSON.stringify({
        humidity: 45
      }));
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