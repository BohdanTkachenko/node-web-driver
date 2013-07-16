var
  util = require('util'),
  AbstractError = require('./AbstractError'),
  CustomError;

CustomError = function (msg) {
  CustomError.super_.call(this, msg, this.constructor)
};

util.inherits(CustomError, AbstractError);
module.exports = CustomError;

CustomError.prototype.code = 11;
CustomError.prototype.name = 'ElementNotVisible';
CustomError.prototype.message = 'An element command could not be completed because the element is not visible on the page.';