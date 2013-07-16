var
  util = require('util'),
  AbstractError = require('./AbstractError'),
  CustomError;

CustomError = function (msg) {
  CustomError.super_.call(this, msg, this.constructor)
};

util.inherits(CustomError, AbstractError);
module.exports = CustomError;

CustomError.prototype.code = 26;
CustomError.prototype.name = 'UnexpectedAlertOpen';
CustomError.prototype.message = 'A modal dialog was open, blocking this operation.';