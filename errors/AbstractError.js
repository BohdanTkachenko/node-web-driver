var util = require('util');

var AbstractError = function (msg, constr) {
  Error.captureStackTrace(this, constr || this);

  function lowerCaseName (name) {
    name = name.replace(/\s+/, '');
    name = name.toLowerCase();

    return name;
  }

  var re = /^(.+):\s/;

  if (msg) {
    if (re.test(msg) && lowerCaseName(re.exec(msg)[1]) == lowerCaseName(this.name)) {
      this.message = msg.replace(re, '');
    } else {
      this.message = msg;
    }
  }
};

util.inherits(AbstractError, Error);
AbstractError.prototype.name = 'Abstract Error';

module.exports = AbstractError;