var
  util = require('util'),
  AbstractError = require('./AbstractError'),
  CustomError;

CustomError = function (msg) {
  CustomError.super_.call(this, msg, this.constructor)
};

util.inherits(CustomError, AbstractError);
module.exports = CustomError;

CustomError.prototype.code = 9;
CustomError.prototype.name = 'UnknownCommand';
CustomError.prototype.message = 'The requested resource could not be found, or a request was received using an HTTP method that is not supported by the mapped resource.';