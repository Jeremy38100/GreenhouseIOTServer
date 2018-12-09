"use strict";

const express      = require('express');
const _            = require('underscore');
const logger       = require('../../logger');
const Q            = require('q');
const mongoose     = require('mongoose');

class RouteBase {
  constructor(db) {
    this.db = db;
    this.router = express.Router();
    this.publicRouter = express.Router();
    this.get();
    this.getOne();
    this.put();
    this.post();
    this.deleteOne();
  }

  get() {
    this.router.get('/', (req, response, next) =>       { this.getHandle(req, response); });
  }

  getHandle(req, response) {
    logger.info("GET " + req.originalUrl);
    this.ctrl.all((err, docs) => {
      if (err) {
        logger.error(err);
        return response.status(err.code || 500).send(err);
      } else {
        logger.info({"response" : "ok", "code" : 200});
        return response.status(200).send(docs);
      }
    });
  }

  getOne() {
    this.router.get('/:id', (req, response) =>       { this.getOneHandler(req, response); });
  }

  getOneHandler(req, response) {
    logger.info("GET " + req.originalUrl);
    this.ctrl.findOne({_id: req.params.id}, (err, doc) => {
      if (err) {
        logger.error(err);
        return response.status(err.code || 500).send(err);
      } else {
        return response.status(200).send(doc);
      }
    });
  }

  put() {
    this.router.put('/:id', (req, response, next) => { this.putHandler(req, response, next);           });
  }

  putHandler(req ,response, next) {
    logger.info("PUT - base router - put handler - " + req.originalUrl + " (id: " + req.params.id + ")");

    this.ctrl.update(_.extend(req.body, {_id:req.params.id}), (err, entity) => {
      if (err) {
        logger.error(err);
        return response.status(err.code || 500).send(err);
      } else {
        // returning the updated document to prevent read failure
        this.ctrl.findById(req.params.id, (err, doc) => {
          if (err) {
            logger.error(err);
            return response.status(err.code || 500).send(err);
          }
          return response.status(200).send(doc);
        }); // ctrl.findById
      }
    }); // ctrl.update

  }

  deleteOne() {
    this.router.delete('/:id', (req, response, next) => { this.deleteOneHandler(req, response, next);       });
  }

  deleteOneHandler(req, response, next) {
    logger.info("DELETE " + req.originalUrl + " id: " + req.params.id + ")");
    this.ctrl.removeOnePromise(req.params.id).then(res => {
      logger.info("document successfully deleted");
      return response.status(200).send({"status":"ok"});
    })
    .catch(err => {
      logger.error(err);
      return response.status(err.code || 500).send(err);
    });
  }

  post() {
    this.router.post('/', (req, response, next) => { this.postHandler(req, response, next);          });
  }

  postHandler(req, response) {
    logger.info("POST " + req.originalUrl);
    this.parseEntities(req, (err, entities) => {
      if (err) {
        return response.status(400).send(err);
      }
      else {
        let promises = [];
        entities.forEach((entity) => {
          promises.push(this.ctrl.insertPromise(entity));
        });
        Q.all(promises)
        .then((res) => {
          logger.info({"response" : "ok", "code" : 200});
          return response.status(200).send(res);
        })
        .catch(err => {
          logger.error(err);
          let code = 500;
          if (err.name && err.name === 'ValidatorError') {
            code = 400;
          }
          return response.status(code || err.code || 500).send(err);
        });
      }
    });
  }

  parseEntities(req, cb) {
    var keys          = Object.keys(req.body).map(key => key);
    let isEntityArray = Object.keys(req.body).length === 0 ? false : true;
    keys.forEach(function(item) {
      if ( isNaN(item) ) { isEntityArray = false; }
    });

    let entities = [];
    if (isEntityArray) {
      entities = Object.keys(req.body).map(key => req.body[key]);
    } else {
      entities.push(req.body);
    }
    cb(null, entities);
  }

}

module.exports = RouteBase;
