const logger  = require('../../server/logger');
const config  = require('../../server/config');
const helper  = require('../helper');
const DeviceDataRoutes = require('./device.data.routes.test');

const expect    = require('chai').expect;

const deviceData = {
  deviceId: 'deviceId',
  sensor: 'sensor',
  data: {
    data: 0
  }
};

describe('#deviceData', () => {

  let server = require('../../server/server');

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

  it('#can create a device data', (done) => {
    let params = {
      config: config,
      body: deviceData
    };
    DeviceDataRoutes.post(params, (err, res) => {

      if (err) logger.error(err);

      expect(err).to.be.null;
      expect(res).to.not.be.null;
      expect(res.status).to.equal(200);
      expect(res.body).to.not.be.null;
      expect(res.body._id).to.not.be.null;

      done();

    });
  });

  it('#can create two device data', (done) => {
    let params = {
      config: config,
      body: [deviceData, deviceData]
    };
    DeviceDataRoutes.post(params, (err, res) => {

      if (err) logger.error(err);

      expect(err).to.be.null;
      expect(res).to.not.be.null;
      expect(res.status).to.equal(200);
      expect(res.body).to.not.be.null;
      expect(res.body.length).to.be.equal(2);
      expect(res.body[0]._id).to.not.be.null;
      expect(res.body[1]._id).to.not.be.null;

      done();

    });
  });

  it('#can get all device data', (done) => {
    let params = {
      config: config
    };
    DeviceDataRoutes.get(params, (err, res) => {

      if (err) logger.error(err);

      expect(err).to.be.null;
      expect(res).to.not.be.null;
      expect(res.status).to.equal(200);
      expect(res.body).to.not.be.null;
      expect(res.body.length).to.be.equal(3);

      done();

    });
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