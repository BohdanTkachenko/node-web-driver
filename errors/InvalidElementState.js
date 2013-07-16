var
  util = require('util'),
  AbstractError = require('./AbstractError'),
  CustomError;

CustomError = function (msg) {
  CustomError.super_.call(this, msg, this.constructor)
};

util.inherits(CustomError, AbstractError);
module.exports = CustomError;

CustomError.prototype.code = 12;
CustomError.prototype.name = 'InvalidElementState';
CustomError.prototype.message = 'An element command could not be completed because the element is in an invalid state (e.g. attempting to click a disabled element).';