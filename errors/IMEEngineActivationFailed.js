var
  util = require('util'),
  AbstractError = require('./AbstractError'),
  CustomError;

CustomError = function (msg) {
  CustomError.super_.call(this, msg, this.constructor)
};

util.inherits(CustomError, AbstractError);
module.exports = CustomError;

CustomError.prototype.code = 31;
CustomError.prototype.name = 'IMEEngineActivationFailed';
CustomError.prototype.message = 'An IME engine could not be started.';