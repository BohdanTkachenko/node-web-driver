var
  util = require('util'),
  AbstractError = require('./AbstractError'),
  CustomError;

CustomError = function (msg) {
  CustomError.super_.call(this, msg, this.constructor)
};

util.inherits(CustomError, AbstractError);
module.exports = CustomError;

CustomError.prototype.code = 28;
CustomError.prototype.name = 'ScriptTimeout';
CustomError.prototype.message = 'A script did not complete before its timeout expired.';