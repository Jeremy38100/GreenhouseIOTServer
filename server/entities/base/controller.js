"use strict";

const logger       = require("../../logger");
const mongoose     = require('mongoose');
const _            = require('underscore');
const Q            = require('q');

class EntityBase {
  constructor(name, db) {
    this.name = name;
  }

  all(cb) {
    logger.info("[" + this.name + ".baseController] find all");
    this.find(null, (err, entities) => {
      if (err) cb(err);
      cb(null, entities);
    });
  }

  findById(id, cb) {
    logger.debug("[" + this.name + ".baseController] findById, id: " + id);
    this.dao.findOne({_id: id}, cb);
  }

  find(params, cb) {
    logger.info("[" + this.name + ".baseController] find (baseCtrl) params:");
    logger.info(params);
    this.dao.find(params, null, (err, docs) => {
      if (err) { return cb(err); }
      cb(null, docs);
    });
  }

  findPromise(params) {
    let q = Q.defer();
    logger.info("[" + this.name + ".baseController] findPromise (params) :");
    logger.info(JSON.stringify(params));
    this.dao.find(params, (err, docs) => {
      if (err) { q.reject(err); }
      else { q.resolve(docs); }
    });
    return q.promise;
  }

  findOnePromise(params) {
    let q = Q.defer();
    logger.info("[" + this.name + ".baseController] findOnePromise (params) :");
    logger.info(JSON.stringify(params));
      this.dao.findOne(params, (err, docs) => {
      if (err) { q.reject(err); }
      else { q.resolve(docs); }
    });
    return q.promise;
  }

  findOne(params, cb) {
   logger.info("[" + this.name + ".baseController] findOne (baseCtrl) params:");
   logger.info(params);
     this.dao.findOne(params, null, (err, docs) => {
     if (err) { return cb(err); }
     cb(null, docs);
   });
  }

  deleteOne(id, cb) {
    logger.debug("[" + this.name + ".baseController] delete (baseCtrl), id: " + id);
    this.dao.findByIdAndRemove(id, cb); // executes
  }

  beforeUpdate(entity, cb) {
    logger.debug("[" + this.name + ".baseController] beforeUpdate");
    cb(null, entity);
  }

  update(entity, cb) {
    this.beforeUpdate(entity, (err, res) => {
      logger.debug("[" + this.name + ".baseController] update (baseCtrl), entity: ");
      logger.debug(entity);
      if (entity._id) {
        this.dao.update({_id: entity._id}, entity, {multi:true}, (err, doc) => {
          this.afterUpdate(doc);
          cb(err, doc);
        });
      } else {
        return cb({"code":500,"message":"no _id in the entity to update"});
      }
    });
  }

  updatePromise(entity) {
    let q = Q.defer();
    this.beforeUpdate(entity, (err, res) => {
      logger.debug("[" + this.name + ".baseController] update (baseCtrl), entity: ");
      logger.debug(entity);
      if (entity._id) {
        this.dao.update({_id: entity._id}, entity, {multi:true}, (err, doc) => {
          if (err) q.reject(err);
          this.afterUpdate(doc);
          q.resolve(doc);
        });
      } else {
        q.reject({"code":500,"message":"no _id in the entity to update"});
      }
    });
    return q.promise;
  }

  afterUpdate(entity) {
    logger.debug("[" + this.name + ".baseController] afterUpdate");
  }

  afterInsert(doc) {
    logger.debug("[" + this.name + ".baseController] afterInsert");
  }

  beforeInsert(entity, cb) {
    logger.debug("[" + this.name + ".baseController] beforeInsert");
    cb(null, entity);
  }

  insert(entity, cb) {
    logger.info("[" + this.name + ".controller] insert");
    this.beforeInsert(entity, (err, res) => {
      if (err) cb(err, 400);
      else {
        logger.debug("[" + this.name + ".controller] insert");
        logger.debug(entity);
        var instance = new this.dao(entity);
        instance.save().then((res) => {
          cb(null, res);
        }, (err) => {
          cb(err);
        });
      }
    });
  }

  insertPromise(entity) {
    let q = Q.defer();
    this.beforeInsert(entity, (err, res) => {
      if (err) q.reject(err, 400);
      else {
        logger.debug("[" + this.name + ".controller] insert");
        logger.debug(entity);
        var instance = new this.dao(entity);
        instance.save(instance, (err, doc) => {
          if (err) q.reject(err);
          this.afterInsert(doc);
          q.resolve(doc);
        });
      }
    });
    return q.promise;
  }

  remove(params, cb) {
    logger.info("[" + this.name + ".baseController] remove");
    logger.info(params);
    this.dao.remove(params, cb);
  }

  public(entity, host, cb) {
    logger.debug("[" + this.name + ".baseController] public");
    logger.debug(JSON.stringify(entity));
    this.dao.public(entity, {host:host}, cb);
  }

  owdPrep(req) {
    let deferred = Q.defer();
    req.owd = true;
    this.owd.parse(req)
      .then((values) => {
        req.owdParams = values[0];

        deferred.resolve();
      }, (reason) => {
        deferred.reject(reason);
      });
    return deferred.promise;
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

module.exports = EntityBase;
