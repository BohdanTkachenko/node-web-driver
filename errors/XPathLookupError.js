var
  util = require('util'),
  AbstractError = require('./AbstractError'),
  CustomError;

CustomError = function (msg) {
  CustomError.super_.call(this, msg, this.constructor)
};

util.inherits(CustomError, AbstractError);
module.exports = CustomError;

CustomError.prototype.code = 19;
CustomError.prototype.name = 'XPathLookupError';
CustomError.prototype.message = 'An error occurred while searching for an element by XPath.';