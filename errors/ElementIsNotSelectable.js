var
  util = require('util'),
  AbstractError = require('./AbstractError'),
  CustomError;

CustomError = function (msg) {
  CustomError.super_.call(this, msg, this.constructor)
};

util.inherits(CustomError, AbstractError);
module.exports = CustomError;

CustomError.prototype.code = 15;
CustomError.prototype.name = 'UnknownError';
CustomError.prototype.message = 'An attempt was made to select an element that cannot be selected.';