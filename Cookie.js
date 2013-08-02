var
  url = require('url'),
  Cookie;

/**
 * @param {Object} data
 * @param {String} data.name The name of the cookie.
 * @param {String} data.value The cookie value.
 * @param {String} data.path The cookie path. Defaults to '/'.
 * @param {String} data.domain The domain the cookie is visible to. Defaults to current domain.
 * @param {Boolean} data.secure Whether the cookie is a secure cookie. Defaults to false.
 * @param {Number} data.expiry When the cookie expires, specified in seconds since midnight, January 1, 1970 UTC.
 * @param {WebDriver} wd
 *
 * @constructor
 */
Cookie = function (data, wd) {
  var name, value, path, domain, secure, expiry;

  /**
   * @returns {String}
   */
  this.getName = function () {
    return name;
  };

  /**
   * @param {String} name_
   */
  this.setName = function (name_) {
    if (typeof name !== 'string' || !name) {
      throw new TypeError('Cookie name should be a non-empty string');
    }

    name = name_;
  };

  /**
   * @returns {String}
   */
  this.getValue = function () {
    return data.value;
  };

  /**
   * @param {String} value_
   */
  this.setValue = function (value_) {
    if (data.value === undefined) {
      throw new TypeError('Cookie value is not defined');
    }

    value = value_;
  };

  /**
   * @returns {String}
   */
  this.getPath = function () {
    return path;
  };

  /**
   * @param {String|undefined} path_
   */
  this.setPath = function (path_) {
    path = path_ || '/';
  };

  /**
   * @returns {String}
   */
  this.getDomain = function () {
    return this.domain;
  };

  /**
   * @param {String|undefined} domain_
   */
  this.setDomain = function (domain_) {
    domain = domain_ || url.parse(wd.getCurrentUrl()).host;
  };

  /**
   * @returns {Boolean}
   */
  this.getSecure = function () {
    return secure;
  };

  /**
   * @param {Boolean} secure_
   */
  this.setSecure = function (secure_) {
    secure = !!secure_;
  };

  /**
   * @returns {Number}
   */
  this.getExpiry = function () {
    return expiry;
  };

  /**
   * @param {Number} expiry_
   */
  this.setExpiry = function (expiry_) {
    expiry = parseInt(expiry_, 10) || (new Date).getTime() + 3600 * 12;
  };

  /**
   * @returns {Cookie}
   */
  this.save = function () {
    wd.setCookie(this);

    return this;
  };

  /**
   * @returns {{name: String, value: String, path: String, domain: String, secure: Boolean, expiry: Number}}
   */
  this.toObject = function () {
    return {
      name: this.getName(),
      value: this.getValue(),
      path: this.getPath(),
      domain: this.getDomain(),
      secure: this.getSecure(),
      expiry: this.getExpiry()
    };
  };

  data = data || {};
  this.setName(data.name);
  this.setValue(data.value);
  this.setPath(data.path);
  this.setDomain(data.domain);
  this.setSecure(data.secure);
  this.setExpiry(data.expiry);
};

module.exports = Cookie;