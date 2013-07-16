var
  util = require('util'),
  AbstractError = require('./AbstractError'),
  CustomError;

CustomError = function (msg) {
  CustomError.super_.call(this, msg, this.constructor)
};

util.inherits(CustomError, AbstractError);
module.exports = CustomError;

CustomError.prototype.code = 8;
CustomError.prototype.name = 'NoSuchFrame';
CustomError.prototype.message = 'A request to switch to a frame could not be satisfied because the frame could not be found.';