module.exports = {
  port : process.env.PORT || 8102,
  host : process.env.HOST || 'localhost',
  mongodb : {
    host 		: process.env.MONGO_HOST || '127.0.0.1',
    user 		: process.env.MONGO_USER || null,
    password 	: process.env.MONGO_PASSWORD || null,
    port 		: process.env.MONGO_PORT || '27017',
    dbName 		: process.env.MONGO_DBNAME || 'greenhouseiot'
  },
  mqtt : {
    method: 'tcp',
    host: '152.77.47.50',
    port: 6883
  }
};
