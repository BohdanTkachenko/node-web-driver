var
  util = require('util'),
  AbstractError = require('./AbstractError'),
  CustomError;

CustomError = function (msg) {
  CustomError.super_.call(this, msg, this.constructor)
};

util.inherits(CustomError, AbstractError);
module.exports = CustomError;

CustomError.prototype.code = 21;
CustomError.prototype.name = 'Timeout';
CustomError.prototype.message = 'An operation did not complete before its timeout expired.';