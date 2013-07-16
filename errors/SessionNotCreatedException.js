var
  util = require('util'),
  AbstractError = require('./AbstractError'),
  CustomError;

CustomError = function (msg) {
  CustomError.super_.call(this, msg, this.constructor)
};

util.inherits(CustomError, AbstractError);
module.exports = CustomError;

CustomError.prototype.code = 33;
CustomError.prototype.name = 'SessionNotCreatedException';
CustomError.prototype.message = 'A new session could not be created.';