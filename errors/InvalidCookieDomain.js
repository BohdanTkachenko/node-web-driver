var
  util = require('util'),
  AbstractError = require('./AbstractError'),
  CustomError;

CustomError = function (msg) {
  CustomError.super_.call(this, msg, this.constructor)
};

util.inherits(CustomError, AbstractError);
module.exports = CustomError;

CustomError.prototype.code = 24;
CustomError.prototype.name = 'InvalidCookieDomain';
CustomError.prototype.message = 'An illegal attempt was made to set a cookie under a different domain than the current page.';