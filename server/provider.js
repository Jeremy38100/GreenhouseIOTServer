var logger = require('./logger'),
    mongoose = require('mongoose');

mongoose.connection.on('connecting', function () {
  logger.info('connecting to mongodb');
});

mongoose.connection.on('connected', function () {
  logger.info('successfully connected to mongodb');
});

mongoose.connection.on('error', function (err) {
  logger.error('Error on mongodb : ');
  throw err;
});

module.exports = function(host, port, dbName, user, password, done) {
  if (user) {
    if (password) {
      logger.info('DbURI: mongodb://'+ user + ':' + password + '@' +host+':'+port+'/'+dbName);
      mongoose.connect('mongodb://'+ user + ':' + password + '@' +host+':'+port+'/'+dbName, done);
    } else {
      logger.info('DbURI: mongodb://'+ user + '@' +host+':'+port+'/'+dbName);
      mongoose.connect('mongodb://'+ user + '@' +host+':'+port+'/'+dbName, done);
    }
  } else {
    logger.info('DbURI: mongodb://'+host+':'+port+'/'+dbName);
    mongoose.connect('mongodb://'+host+':'+port+'/'+dbName, done);
  }
};
