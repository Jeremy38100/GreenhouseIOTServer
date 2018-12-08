"use strict";

const chai      = require('chai');
const chaiHttp  = require('chai-http');
const expect    = require('chai').expect;

chai.use(chaiHttp);

class RoutesTestBase {

  constructor(name, db) {
    this.name = name;
  }

  preRequestCheck(params) {
    expect(params.config).to.exist;
    expect(params.config.host).to.exist;
    expect(params.config.port).to.exist;
  }

  post(params, cb) {

    this.preRequestCheck(params);
    expect(params.body).to.exist;

    let body = params.body;
    let url = params.url ? params.url : '/api/' + this.name;
    chai.request('http://' + params.config.host + ':' + params.config.port)
    .post(url)
    .set('Content-Type', 'application/json')
    .send(body)
    .end((err, res) => {

      if (err) return cb(err);

      expect(err).to.be.null;
      expect(res).to.not.be.null;
      expect(res.status).to.equal(200);
      expect(res.body).to.not.be.null;
      expect(res.body._id).to.not.be.null;

      cb(null, res);

    });
  }

  put(params, cb) {

    this.preRequestCheck(params);
    expect(params.id).to.exist;
    expect(params.body).to.exist;

    let body = params.body;
    chai.request('http://' + params.config.host + ':' + params.config.port)
    .put('/api/' + this.name + '/' + params.id)
    .set('Content-Type', 'application/json')
    .send(body)
    .end((err, res) => {

      if (err) return cb(err);

      expect(err).to.be.null;
      expect(res).to.not.be.null;
      expect(res.status).to.equal(200);
      expect(res.body).to.not.be.null;
      expect(res.body._id).to.not.be.null;

      cb(null, res);

    });

  }

  getOne(params, cb) {

    this.preRequestCheck(params);
    expect(params.id).to.exist;

    chai.request('http://' + params.config.host + ':' + params.config.port)
    .get('/api/' + this.name + '/' + params.id)
    .set('Content-Type', 'application/json')
    .end((err, res) => {

      if (err) return cb(err);

      expect(err).to.be.null;
      expect(res).to.not.be.null;
      expect(res.status).to.equal(200);
      expect(res.body).to.not.be.null;
      expect(res.body._id).to.not.be.null;

      cb(null, res);

    });

  }

  get(params, cb) {

    this.preRequestCheck(params);

    chai.request('http://' + params.config.host + ':' + params.config.port)
    .get('/api/' + this.name)
    .set('Content-Type', 'application/json')
    .end((err, res) => {

      if (err) return cb(err);

      expect(err).to.be.null;
      expect(res).to.not.be.null;
      expect(res.status).to.equal(200);
      expect(res.body).to.not.be.null;
      expect(res.body._id).to.not.be.null;

      cb(null, res);

    });

  }

}

module.exports = RoutesTestBase;