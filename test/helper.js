const mongoose = require('mongoose');

function connectionState() {
  return mongoose.connection.readyState;
}

function connected() {
  return new Promise(resolve => {
    resolve(mongoose.connection.readyState === 1 ? true : false)
  });
}

function disconnected() {
  return new Promise(resolve => {
    resolve(mongoose.connection.readyState === 0 ? true : false)
  });
}

function disconnect() {
  return new Promise(resolve => {
    mongoose.connection.db.close(() => {
      resolve();
    });
  });
}

function dropCollectionsAndModels() {
  return new Promise((resolve, reject) => {

    let collections = [];
    for (let key in mongoose.connection.collections) {
      collections.push(key);
    }

    dropCollection = (collection) => {
      return new Promise((resolve, reject) => {
        mongoose.connection.collections[collection].drop(() => {
          delete mongoose.connection.models[collection];
          resolve(true);
        });
      });
    }

    let lastPromise = collections.reduce((promise, collection) => {
      return promise.then((res) => {
        if (collection !== undefined) {
          return dropCollection(collection);
        }
      });
    }, Promise.resolve());

    lastPromise.then((collection) => {
      resolve();
    });

  });
}

module.exports = (function() {
  return {
    dropCollectionsAndModels: dropCollectionsAndModels,
    disconnect              : disconnect,
    connected               : connected,
    disconnected            : disconnected
  }
})();