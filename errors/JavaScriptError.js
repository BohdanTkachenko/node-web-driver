var
  util = require('util'),
  AbstractError = require('./AbstractError'),
  CustomError;

CustomError = function (msg) {
  CustomError.super_.call(this, msg, this.constructor)
};

util.inherits(CustomError, AbstractError);
module.exports = CustomError;

CustomError.prototype.code = 17;
CustomError.prototype.name = 'JavaScriptError';
CustomError.prototype.message = 'An error occurred while executing user supplied JavaScript.';