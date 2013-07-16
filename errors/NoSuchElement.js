var
  util = require('util'),
  AbstractError = require('./AbstractError'),
  CustomError;

CustomError = function (msg) {
  CustomError.super_.call(this, msg, this.constructor)
};

util.inherits(CustomError, AbstractError);
module.exports = CustomError;

CustomError.prototype.code = 7;
CustomError.prototype.name = 'NoSuchElement';
CustomError.prototype.message = 'An element could not be located on the page using the given search parameters.';