'use strict';

const Controller      = require('./controller');
const RouteBase       = require('../base/routes');
const logger          = require('../../logger');
const Q               = require('q');

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

  deleteOne() {
    this.router.delete('/fakeData', (req, response) => { this.deleteAllBadData(req, response); });
    this.router.delete('/:id', (req, response, next) => { this.deleteOneHandler(req, response, next);       });
  }

  deleteAllBadData(req, response) {
    logger.info("DELETE " + req.originalUrl);
    this.ctrl.all((err, docs) => {
      if (err) {
        logger.error(err);
        return response.status(err.code || 500).send(err);
      } else {
        let promises = [];
        docs.forEach(doc => {
          if (doc.data.humidity === 0 || doc.data.humidity === 1024) {
            promises.push(this.ctrl.removeOnePromise(doc._id));
          }
        });
        Q.all(promises)
        .then(() => {
          logger.info({"status" : "ok", "code": 200});
          return response.status(200).send({"status": "ok"});
        })
        .catch(err => {
          return response.status(err.code || 500).send(err);
        }); 
      }
    });
  }

}

module.exports = DeviceData;
