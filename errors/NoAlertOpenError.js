var
  util = require('util'),
  AbstractError = require('./AbstractError'),
  CustomError;

CustomError = function (msg) {
  CustomError.super_.call(this, msg, this.constructor)
};

util.inherits(CustomError, AbstractError);
module.exports = CustomError;

CustomError.prototype.code = 27;
CustomError.prototype.name = 'NoAlertOpenError';
CustomError.prototype.message = 'An attempt was made to operate on a modal dialog when one was not open.';