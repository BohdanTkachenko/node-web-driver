var
  util = require('util'),
  AbstractError = require('./AbstractError'),
  CustomError;

CustomError = function (msg) {
  CustomError.super_.call(this, msg, this.constructor)
};

util.inherits(CustomError, AbstractError);
module.exports = CustomError;

CustomError.prototype.code = 6;
CustomError.prototype.name = 'NoSuchDriver';
CustomError.prototype.message = 'A session is either terminated or not started.';