var
  util = require('util'),
  AbstractError = require('./AbstractError'),
  CustomError;

CustomError = function (msg) {
  CustomError.super_.call(this, msg, this.constructor)
};

util.inherits(CustomError, AbstractError);
module.exports = CustomError;

CustomError.prototype.code = 34;
CustomError.prototype.name = 'MoveTargetOutOfBounds';
CustomError.prototype.message = 'Target provided for a move action is out of bounds.';