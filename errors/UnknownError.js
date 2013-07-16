var
  util = require('util'),
  AbstractError = require('./AbstractError'),
  CustomError;

CustomError = function (msg) {
  CustomError.super_.call(this, msg, this.constructor)
};

util.inherits(CustomError, AbstractError);
module.exports = CustomError;

CustomError.prototype.code = 13;
CustomError.prototype.name = 'UnknownError';
CustomError.prototype.message = 'An unknown server-side error occurred while processing the command.';