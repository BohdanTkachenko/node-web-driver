var
  util = require('util'),
  AbstractError = require('./AbstractError'),
  CustomError;

CustomError = function (msg) {
  CustomError.super_.call(this, msg, this.constructor)
};

util.inherits(CustomError, AbstractError);
module.exports = CustomError;

CustomError.prototype.code = 10;
CustomError.prototype.name = 'StaleElementReference';
CustomError.prototype.message = 'An element command failed because the referenced element is no longer attached to the DOM.';