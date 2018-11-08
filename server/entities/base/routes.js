"use strict";

const express      = require('express');
const mongoose     = require('mongoose');
const _            = require('underscore');
const UserCtrl     = require('../user/controller');
const logger       = require('../../logger');
const Q            = require('q');

class RouteBase {
  constructor(db) {
    this.db = db;
    this.router = express.Router();
    this.publicRouter = express.Router();
    this.userCtrl = new UserCtrl(db);
    this.get();
    this.getOne();
    this.put();
    this.post();
    this.deleteOne();
  }


  getOneMiddleware(req, response, next) {
    logger.info("base - get one middleware" + req.originalUrl);

    this.ctrl.findById(req.params.id, (err, doc) => {
      if (err) {
        logger.error(err);
        return response.status(err.code || 500).send(err);
      }
      else if (!doc) {
        return response.status(404).send({"code": 404, "message" : "Document not found"});
      }
      req.docs = doc;
      next();
    });
  }

  get() {
    this.router.get('/', (req, response, next) => { this.roleMiddleware(req, response, next); });
    this.router.get('/', (req, response, next) => { this.permissionMiddleware(req, response, next); });
    this.router.get('/', (req, response) =>       { this.getHandle(req, response); });
  }

  getHandle(req, response) {
    logger.info("GET " + req.originalUrl);
    if (req.role == 'admin') {
      this.ctrl.all((err, docs) => {
        if (err) {
          logger.error(err);
          return response.status(err.code || 500).send(err);
        } else {
          logger.info({"response" : "ok", "code" : 200});
          return response.status(200).send(docs);
        }
      });
    } else {

      this.ctrl.find({owner: req.userId}, (err, docs) => {
        if (err) {
          logger.error(err);
          return response.status(err.code || 500).send(err);
        } else {
          logger.info({"response" : "ok", "code" : 200});
          return response.status(200).send(docs);
        }
      });
    }
  }

  getOne() {
    this.router.get('/:id', (req, response, next) => { this.roleMiddleware(req, response, next); });
    this.router.get('/:id', (req, response, next) => { this.permissionMiddleware(req, response, next); });
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


  roleMiddleware(req, response, next) {
    logger.info("base routes - role middleware - " + this.ctrl.name + " - " + req.originalUrl);
    this.user(req, (err, userDoc) => {
      if (_.isEmpty(userDoc)) {
        req.role = 'user';
        return next();
      }

      if (userDoc.role.indexOf('admin') !== -1) {
        req.role = 'admin';
      } else {
        req.role = 'user';
      }

      next();
    });

  }

  put() {
    this.router.put('/:id', (req, response, next) => { this.roleMiddleware(req, response, next);       });
    this.router.put('/:id', (req, response, next) => { this.permissionMiddleware(req, response, next); });
    this.router.put('/:id', (req, response, next) => { this.putHandler(req, response, next);           });
  }

  permissionMiddleware(req, response, next) {
    next();
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
    this.router.delete('/:id', (req, response, next) => { this.getOneMiddleware(req, response, next);       });
    this.router.delete('/:id', (req, response, next) => { this.permissionMiddleware(req, response, next);   });
    this.router.delete('/:id', (req, response, next) => { this.deleteOneHandler(req, response, next);       });
  }

  deleteOneHandler(req, response, next) {
    logger.info("DELETE " + req.originalUrl + " id: " + req.params.id + ")");
    if (req.docs.active === false) {
      logger.info({"code" : 200, "message" : "Document already deleted"});
      return response.status(200).send({"code" : 200, "message" : "Document already deleted"});
    } else {
      this.ctrl.update({_id:req.docs._id.toString(), active:false}, (err, res) => {
        if (err) {
          logger.error(err);
          return response.status(err.code || 500).send(err);
        }
        logger.info({"response" : "ok", "code" : 200});
        return response.status(200).send(res);
      });
    }
  }

  post() {
    this.router.post('/', (req, response, next) => { this.roleMiddleware(req, response, next);              });
    this.router.post('/', (req, response, next) => { this.permissionMiddleware(req, response, next); });
    this.router.post('/', (req, response, next) => { this.postHandler(req, response, next);          });
  }

  postHandler(req, response) {
    logger.info("POST " + req.originalUrl);
    this.parseEntities(req, (err, entities) => {
      if (err) {
        return response.status(400).send(err);
      }
      else {
        entities.forEach((entity) => {
          _.extend(entity, {owner: mongoose.Types.ObjectId(req.userId)});
          this.ctrl.insert(entity, (err, res) => {
            if (err) {
              logger.error(err);
              return response.status(err.code || 500).send(err);
            } else {
              logger.info({"response" : "ok", "code" : 200});
              return response.status(200).send(res);
            }
          });
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

  user(req, cb) {
    if (req.userId === undefined) return cb(null, {});
    this.userCtrl.dao.findOne({_id: mongoose.Types.ObjectId(req.userId)}, (err, user) => {
      if (err) {
        logger.error(err);
        cb(null, {});
      }
      req.reqUser = user;
      cb(null, user);
    });
  }

}

module.exports = RouteBase;
