var
  util = require('util'),
  AbstractError = require('./AbstractError'),
  CustomError;

CustomError = function (msg) {
  CustomError.super_.call(this, msg, this.constructor)
};

util.inherits(CustomError, AbstractError);
module.exports = CustomError;

CustomError.prototype.code = 32;
CustomError.prototype.name = 'InvalidSelector';
CustomError.prototype.message = 'Argument was an invalid selector (e.g. XPath/CSS).';