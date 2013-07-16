var
  util = require('util'),
  AbstractError = require('./AbstractError'),
  CustomError;

CustomError = function (msg) {
  CustomError.super_.call(this, msg, this.constructor)
};

util.inherits(CustomError, AbstractError);
module.exports = CustomError;

CustomError.prototype.code = 25;
CustomError.prototype.name = 'UnableToSetCookie';
CustomError.prototype.message = 'A request to set a cookie\'s value could not be satisfied.';