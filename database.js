var promise = require('bluebird');
var config = require('./config');

var options = {
    promiseLib: promise
};

var pgp = require('pg-promise')(options);
var db = pgp(config);

module.exports = db;