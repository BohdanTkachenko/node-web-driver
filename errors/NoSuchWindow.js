var
  util = require('util'),
  AbstractError = require('./AbstractError'),
  CustomError;

CustomError = function (msg) {
  CustomError.super_.call(this, msg, this.constructor)
};

util.inherits(CustomError, AbstractError);
module.exports = CustomError;

CustomError.prototype.code = 23;
CustomError.prototype.name = 'NoSuchWindow';
CustomError.prototype.message = 'A request to switch to a different window could not be satisfied because the window could not be found.';