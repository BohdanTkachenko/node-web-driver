var
  util = require('util'),
  AbstractError = require('./AbstractError'),
  CustomError;

CustomError = function (msg) {
  CustomError.super_.call(this, msg, this.constructor)
};

util.inherits(CustomError, AbstractError);
module.exports = CustomError;

CustomError.prototype.code = 29;
CustomError.prototype.name = 'InvalidElementCoordinates';
CustomError.prototype.message = 'The coordinates provided to an interactions operation are invalid.';