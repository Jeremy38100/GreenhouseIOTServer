'use strict';

const Controller      = require('./controller');
const RouteBase       = require('../base/routes');
const logger          = require('../../logger');

class DeviceData extends RouteBase {

  constructor(db) {
    super(db);
    this.ctrl   = new Controller(db);
  }

  get() {
    super.get();
    this.router.get('/last', (req, response, next) =>   { this.getLastHandle(req, response);  });
  }

  getLastHandle(req, response) {
    logger.info("GET " + req.originalUrl);
    this.ctrl.all((err, docs) => {
      if (err) {
        logger.error(err);
        return response.status(err.code || 500).send(err);
      } else {
        logger.info({"response" : "ok", "code" : 200});
        return response.status(200).send(docs[docs.length - 1]);
      }
    });
  }

}

module.exports = DeviceData;
