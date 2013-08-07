var
  _ = require('underscore'),
  http = require('http-sync'),
  url = require('url'),
  fs = require('fs'),
  WebDriver,

  WebElement = require('./WebElement'),
  Cookie = require('./Cookie'),
  SpecialKeys = require('./SpecialKeys'),

  UnknownCommand = require('./errors/UnknownCommand'),
  UnknownError = require('./errors/UnknownError'),
  NoSuchDriver = require('./errors/NoSuchDriver'),
  NoSuchElement = require('./errors/NoSuchElement'),
  Timeout = require('./errors/Timeout');
  NoAlertOpenError = require('./errors/NoAlertOpenError');

/**
 * @constructor
 */
WebDriver = function () {
  var
    session = null,
    remoteDriverHttpParams = {
      protocol: 'http',
      port: 9515,
      host: 'localhost'
    };

  function _constructor (remoteDriverUrl) {
    if (!remoteDriverUrl) {
      return;
    }

    var parsedUrl = url.parse(remoteDriverUrl);

    remoteDriverHttpParams = {
      protocol: parsedUrl.protocol === 'http:' ? 'http' : 'https',
      port: parseInt(parsedUrl.port, 10),
      host: parsedUrl.hostname
    };
  }

  /**
   * Do not do anything for some time.
   *
   * <p>Some functions are need this to do interval checks for element appearing or disappearing.</p>
   *
   * @private
   *
   * @param {Number} seconds Time to wait.
   *
   * @returns {WebDriver}
   */
  function _sleep (seconds) {
    var ms = seconds * 1000;

    ms += new Date().getTime();

    // sorry, but there is no other way if we want to make it really simple and sync
    while (new Date() < ms) { }

    return this;
  }

  /**
   * Throw error by error code.
   *
   * @private
   *
   * @param {Number} code Error code.
   * @param {String} [msg] Text to omit default error message.
   *
   * @throws {AbstractError}
   */
  function _errorByCode (code, msg) {
    var
      dir = __dirname + '/errors/',
      errors = fs.readdirSync(dir),
      i, fn,
      error, obj;

    for (i = 0; i < errors.length; i++) {
      fn = errors[i];

      if (!/\.js$/.test(fn)) {
        continue;
      }

      error = require(dir + fn);
      obj = new error(msg);

      if (obj.code !== code) {
        continue;
      }

      throw obj;
    }

    throw new UnknownError(msg);
  }

  /**
   * Make a request to webdriver with given params
   *
   * @private
   *
   * @param {String} [path] webdriver path (method) to call.
   * @param {String} [method] HTTP method for request (e.g. GET, POST, PUT, ...).
   * @param {String} [data] Data for POST payload
   *
   * @return {Object} Request result.
   */
  function _request (path, method, data) {
    method = method || 'GET';
    data = data || null;

    if (/:sessionId/.test(path)) {
      if (!session.sessionId) {
        throw new NoSuchDriver();
      }

      path = path.replace(':sessionId', session.sessionId);
    }

    var req, res, resObj;

    req = http.request({
      protocol: remoteDriverHttpParams.protocol,
      port: remoteDriverHttpParams.port,
      host: remoteDriverHttpParams.host,
      method: method,
      path: path,
      headers: {},
      body: data
    });

    res = req.end();

    res.statusCode = parseInt(res.statusCode, 10);

    if (res.statusCode === 303) {
      if (!res.headers.Location) {
        throw new UnknownError;
      }

      return res.headers.Location;
    } else if (res.statusCode === 404) {
      throw new UnknownCommand();
    } else if (res.statusCode !== 200) {
      throw new UnknownError('Unknown status code: ' + req.statusCode);
    }

    if (res.headers['Content-Type'] !== 'application/json; charset=utf-8') {
      throw method + ' ' + path + ': got content-type ' + res.headers['Content-Type'] +
        '. should be "application/json; charset=utf-8"';
    }

    try {
      resObj = JSON.parse(res.body.toString());
    } catch (e) {
      throw method + ' ' + path + ': cannot parse JSON';
    }

    if (resObj.status > 0) {
      _errorByCode(resObj.status, (resObj.value && resObj.value.message) ? resObj.value.message : null);
    }

    return resObj;
  }

  /**
   * GET request to webdriver on given path.
   *
   * @see WebDriver#_request
   * @private
   *
   * @param {String} path
   *
   * @returns {Object}
   */
  function _get (path) {
    return _request(path, 'GET');
  }

  /**
   * POST request to webdriver on given path.
   *
   * @see WebDriver#_request
   * @private
   *
   * @param {String} path
   * @param {Object} [data] POST data.
   *
   * @returns {Object}
   */
  function _post (path, data) {
    return _request(path, 'POST', JSON.stringify(data));
  }

  _constructor.apply(this, arguments);

  /**
   * Constant object with special keys.
   *
   * @constant
   * @type {SpecialKeys}
   */
  this.SPECIAL_KEYS = SpecialKeys;

  /**
   * Create a new session and remembers sessionId for future calls.
   *
   * <p>The server should attempt to create a session that most closely matches the desired and required capabilities.</p>
   * <p>Required capabilities have higher priority than desired capabilities and must be set for the session to be created.</p>
   *
   * @param {Object} desiredCapabilities
   * @param {Object} requiredCapabilities
   *
   * @returns {Object} Session capabilities and sessionId.
   */
  this.init = function (desiredCapabilities, requiredCapabilities) {
    desiredCapabilities = _.defaults(desiredCapabilities || {}, {
      browserName: 'chrome',
      version: '',
      platform: 'ANY',
      javascriptEnabled: true,
      takesScreenshot: true,
      handlesAlerts: true,
      databaseEnabled: true,
      locationContextEnabled: true,
      applicationCacheEnabled: true,
      browserConnectionEnabled: true,
      cssSelectorsEnabled: true,
      webStorageEnabled: true,
      rotatable: true,
      acceptSslCerts: true,
      nativeEvents: true,
      proxy: undefined
    });

    requiredCapabilities = requiredCapabilities || {};

    session = _get(_post('/session', {
      desiredCapabilities: desiredCapabilities,
      requiredCapabilities: requiredCapabilities
    }));

    session = {
      sessionId: session.sessionId,
      capabilities: session.value
    };

    return session;
  };

  /**
   * Delete the session.
   *
   * @returns {WebDriver}
   */
  this.stop = function () {
    _request('/session/:sessionId', 'DELETE');

    return this;
  };

  /**
   * Retrieve the capabilities of the specified session.
   *
   * @returns {Object}
   */
  this.getCapabilities = function () {
    return session.capabilities;
  };

  /**
   * Set the amount of time the driver should wait when loading a page.
   *
   * @param {Number} seconds The amount of time to wait. This value has a lower bound of 0.
   */
  this.setPageLoadTimeout = function (seconds) {
    var ms = seconds * 1000;

    _post('/session/:sessionId/timeouts', {
      type: 'page load',
      ms: ms || 15000
    });

    return this;
  };

  /**
   * Set the amount of time the driver should wait when searching for elements.
   *
   * <p>When searching for a single element, the driver should poll the page until an element
   * is found or the timeout expires, whichever occurs first. When searching for multiple elements,
   * the driver should poll the page until at least one element is found or the timeout expires, at
   * which point it should return an empty list.</p>
   *
   * <p>If this command is never sent, the driver should default to an implicit wait of 0ms.</p>
   *
   * @param {Number} seconds The amount of time to wait. This value has a lower bound of 0.
   */
  this.setImplicitTimeout = function (seconds) {
    var ms = seconds * 1000;

    _post('/session/:sessionId/timeouts', {
      type: 'implicit',
      ms: ms || 15000
    });

    return this;
  };

  /**
   * Set the amount of time, in milliseconds, that asynchronous scripts executed by /session/:sessionId/execute_async
   * are permitted to run before they are aborted and a {Timeout} error is returned to the client.
   *
   * @param {Number} seconds The amount of time, that time-limited commands are permitted to run.
   */
  this.setScriptTimeout = function (seconds) {
    var ms = seconds * 1000;

    _post('/session/:sessionId/timeouts', {
      type: 'script',
      ms: ms || 15000
    });

    return this;
  };

  /**
   * Retrieve the current window handle.
   *
   * @returns {String} The current window handle.
   */
  this.getWindowHandle = function () {
    return _get('/session/:sessionId/window_handle').value;
  };

  /**
   * Retrieve the list of all window handles available to the session.
   *
   * @returns {string[]} A list of window handles.
   */
  this.getWindowHandles = function () {
    return _get('/session/:sessionId/window_handles').value;
  };

  /**
   * Retrieve the URL of the current page.
   *
   * @returns {String}
   */
  this.getCurrentUrl = function () {
    return _get('/session/:sessionId/url').value;
  };

  /**
   * Navigate to a new URL.
   *
   * @param url {String} The URL to navigate to.
   */
  this.get = function (url) {
    _post('/session/:sessionId/url', {
      url: url
    });

    return this;
  };

  /**
   * Navigate forwards in the browser history, if possible.
   */
  this.forward = function () {
    _post('/session/:sessionId/forward');

    return this;
  };

  /**
   * Navigate backwards in the browser history, if possible.
   */
  this.back = function () {
    _post('/session/:sessionId/back');

    return this;
  };

  /**
   * Refresh the current page.
   */
  this.refresh = function () {
    _post('/session/:sessionId/refresh');

    return this;
  };

  /**
   * Inject a snippet of JavaScript into the page for execution in the context of the currently selected frame.
   *
   * <p>The executed script is assumed to be synchronous and the result of evaluating the script is returned to the client.</p>
   *
   * <p>The script argument defines the script to execute in the form of a function body. The value returned by that
   * function will be returned to the client. The function will be invoked with the provided args array and the
   * values may be accessed via the arguments object in the order specified.</p>
   *
   * <p>Arguments may be any JSON-primitive, array, or JSON object. JSON objects that define a {WebElement} reference
   * will be converted to the corresponding DOM element. Likewise, any WebElements in the script result will be
   * returned to the client as {WebElement} JSON objects.</p>
   *
   * @param {String} script The script to execute.
   * @param {Object} args The script arguments.
   *
   * @returns {WebDriver} The script result.
   */
  this.execute = function (script, args) {
    return _post('/session/:sessionId/execute', {
      script: script,
      args: args
    }).value;
  };

  /**
   * Inject a snippet of JavaScript into the page for execution in the context of the currently selected frame.
   *
   * <p>The executed script is assumed to be asynchronous and must signal that is done by invoking the provided callback,
   * which is always provided as the final argument to the function. The value to this callback will be returned to the
   * client.</p>
   *
   * <p>Asynchronous script commands may not span page loads. If an unload event is fired while waiting for a script result,
   * an error should be returned to the client.</p>
   *
   * <p>The script argument defines the script to execute in teh form of a function body. The function will be invoked with
   * the provided args array and the values may be accessed via the arguments object in the order specified. The final
   * argument will always be a callback function that must be invoked to signal that the script has finished.</p>
   *
   * <p>Arguments may be any JSON-primitive, array, or JSON object. JSON objects that define a {WebElement} reference will be
   * converted to the corresponding DOM element. Likewise, any WebElements in the script result will be returned to the
   * client as {WebElement} JSON objects.</p>
   *
   * @param {String} script The script to execute.
   * @param {Object} args The script arguments.
   *
   * @returns {WebDriver} The script result.
   */
  this.executeAsync = function (script, args) {
    return _post('/session/:sessionId/execute_async', {
      script: script,
      args: args
    }).value;
  };

  /**
   * Take a screenshot of the current page.
   *
   * @returns {String} The screenshot as a base64 encoded PNG.
   */
  this.takeScreenshot = function () {
    return _post('/session/:sessionId/screenshot').value;
  };

  /**
   * Get the current page source.
   *
   * @returns {String} The current page source.
   */
  this.getSource = function () {
    return _get('/session/:sessionId/source').value;
  };

  /**
   * Get the current page title.
   *
   * @returns {String} The current page title.
   */
  this.getTitle = function () {
    return _get('/session/:sessionId/title').value;
  };

  /**
   * Check if given text present in page source.
   *
   * @param {String} text Text to search.
   *
   * @returns {Boolean}
   */

  this.isTextPresent = function (text) {
    return this.getSource().indexOf(text) !== -1;
  };

  /**
   * Search for an element on the page, starting from the identified element.
   *
   * <p>The located element will be returned as a WebElement object.<p>
   *
   * <p>The table below lists the locator strategies that each server should support.
   * Each locator must return the first matching element located in the DOM.</p>
   *
   * <ul>
   * <li><strong>class name</strong> &mdash; Returns an element whose class name contains the search value;
   *                                         compound class names are not permitted</li>
   * <li><strong>css selector</strong> &mdash; Returns an element matching a CSS selector</li>
   * <li><strong>id</strong> &mdash; Returns an element whose ID attribute matches the search value</li>
   * <li><strong>name</strong> &mdash; Returns an element whose NAME attribute matches the search value</li>
   * <li><strong>link text</strong> &mdash; Returns an anchor element whose visible text matches the search value</li>
   * <li><strong>partial link text</strong> &mdash; Returns an anchor element whose visible text partially matches
   *                                                the search value</li>
   * <li><strong>tag name</strong> &mdash; Returns an element whose tag name matches the search value</li>
   * <li><strong>xpath</strong> &mdash; Returns an element matching an XPath expression.
   *                                    The provided XPath expression must be applied to the
   *                                    server "as is"; if the expression is not relative to the element root,
   *                                    the server should not modify it.
   *                                    Consequently, an XPath query may return elements not contained in the root
   *                                    element's subtree</li>
   *
   * @param {String} using The locator strategy to use.
   * @param {String} value The search target.
   *
   * @returns {WebElement} Located element.
   */
  this.getElement = function (using, value) {
    var res = _post('/session/:sessionId/element', {
      using: using,
      value: value
    });

    if (!res.value.ELEMENT) {
      throw new UnknownError();
    }

    return new WebElement(res.value.ELEMENT, this);
  };

  /**
   * Search for multiple elements on the page, starting from the identified element.
   *
   * @see WebDriver#getElement
   *
   * @param {String} using The locator strategy to use.
   * @param {String} value The search target.
   *
   * @returns {WebElement[]} Located elements.
   */
  this.getElements = function (using, value) {
    var res = _post('/session/:sessionId/elements', {
      using: using,
      value: value
    });

    return res.value.map(function (item) {
      if (!item.ELEMENT) {
        throw new UnknownError();
      }

      return new WebElement(item.ELEMENT, this);
    }, this);
  };

  /**
   * Get WebElement if query was success full. Otherwise will return null.
   *
   * <p>It handles only NoSuchElement error. Any other errors will be re-thrown.</p>
   *
   * @param {String} using See WebDriver.getElement() for details.
   * @param {String} value Value for query.
   *
   * @returns {WebElement|null}
   */
  this.getElementOrNull = function (using, value) {
    var element;

    try {
      element = this.getElement(using, value);
    } catch (e) {
      if (e instanceof NoSuchElement) {
        return null;
      }

      throw e;
    }

    return element;
  };

  /**
   * Returns true if element exists. Otherwise returns false.
   *
   * @param {String} using See WebDriver.getElement() for details.
   * @param {String} value Value for query.
   *
   * @returns {Boolean}
   */
  this.hasElement = function (using, value) {
    return this.getElementOrNull(using, value) !== null;
  };

  /**
   * Click on an element.
   *
   * @param {WebElement} element
   *
   * @returns {WebDriver}
   */
  this.clickElement = function (element) {
    _post('/session/:sessionId/element/' + element.getElementId() + '/click');

    return this;
  };

  /**
   * Submit a FORM element.
   *
   * <p>The submit command may also be applied to any element that is a descendant of a FORM element.</p>
   *
   * @param {WebElement} element
   *
   * @returns {WebDriver}
   */
  this.submitElement = function (element) {
    _post('/session/:sessionId/element/' + element.getElementId() + '/submit');

    return this;
  };

  /**
   * Returns the visible text for the element.
   *
   * @param {WebElement} element
   *
   * @returns {WebDriver}
   */
  this.getElementText = function (element) {
    return _get('/session/:sessionId/element/' + element.getElementId() + '/text').value;
  };

  /**
   * Send a sequence of key strokes to an element.
   *
   * <p>The server must process the key sequence as follows:</p>
   * <ul>
   * <li>- Each key that appears on the keyboard without requiring modifiers are sent as a keydown followed by a key up.</li>
   * <li>- If the server does not support native events and must simulate key strokes with JavaScript, it must generate
   *   keydown, keypress, and keyup events, in that order. The keypress event should only be fired when the
   *   corresponding key is for a printable character;</li>
   * <li>- If a key requires a modifier key (e.g. "!" on a standard US keyboard), the sequence is: modifier down, key down,
   *   key up, modifier up, where key is the ideal unmodified key value (using the previous example, a "1");</li>
   * <li>- Modifier keys (Ctrl, Shift, Alt, and Command/Meta) are assumed to be "sticky"; each modifier should be held down
   *   (e.g. only a keydown event) until either the modifier is encountered again in the sequence, or the NULL (U+E000)
   *   key is encountered;</li>
   * <li>- Each key sequence is terminated with an implicit NULL key. Subsequently, all depressed modifier keys must be
   *   released (with corresponding keyup events) at the end of the sequence.</li>
   * </ul>
   *
   * @param {WebElement} element
   * @param {String} value
   *
   * @returns {WebDriver}
   */
  this.type = function (element, value) {
    if (typeof value !== 'string') {
      throw new TypeError('value should be a string');
    }

    _post('/session/:sessionId/element/' + element.getElementId() + '/value', {
      value: [ value ]
    });

    return this;
  };

  /**
   * Send a sequence of key strokes to the active element.
   *
   * <p>This command is similar to the WebDriver.type command in every aspect except the implicit termination:
   * The modifiers are not released at the end of the call. Rather, the state of the modifier keys is kept
   * between calls, so mouse interactions can be performed while modifier keys are depressed.</p>
   *
   * @param {String} value
   *
   * @returns {WebDriver}
   */
  this.keys = function (value) {
    if (typeof value !== 'string') {
      throw new TypeError('value should be a string');
    }

    _post('/session/:sessionId/keys', {
      value: [ value ]
    });

    return this;
  };

  /**
   * Query for an element's tag name.
   *
   * @param {WebElement} element
   *
   * @returns {String} The element's tag name, as a lowercase string.
   */
  this.getElementTagName = function (element) {
    return _get('/session/:sessionId/element/' + element.getElementId() + '/name').value;
  };

  /**
   * Clear a TEXTAREA or text INPUT element's value.
   *
   * @param {WebElement} element
   *
   * @returns {WebDriver}
   */
  this.clear = function (element) {
    _post('/session/:sessionId/element/' + element.getElementId() + '/clear');

    return this;
  };

  /**
   * Determine if an OPTION element, or an INPUT element of type checkbox or radiobutton is currently selected.
   *
   * @param {WebElement} element
   *
   * @returns {Boolean}
   */
  this.isSelected = function (element) {
    return _get('/session/:sessionId/element/' + element.getElementId() + '/selected').value;
  };

  /**
   * Determine if an element is currently enabled.
   *
   * @param {WebElement} element
   *
   * @returns {Boolean}
   */
  this.isEnabled = function (element) {
    return _get('/session/:sessionId/element/' + element.getElementId() + '/enabled').value;
  };

  /**
   * Determine if an element is currently displayed.
   *
   * @param {WebElement} element
   *
   * @returns {Boolean}
   */
  this.isDisplayed = function (element) {
    return _get('/session/:sessionId/element/' + element.getElementId() + '/displayed').value;
  };

  /**
   * Get the value of an element's attribute.
   *
   * @param {WebElement} element
   * @param {String} name
   *
   * @returns {String}
   */
  this.getAttribute = function (element, name) {
    return _get('/session/:sessionId/element/' + element.getElementId() + '/attribute/' + name).value;
  };

  /**
   * Determine an element's location on the page. The point (0, 0) refers to the upper-left corner of the page.
   *
   * @param {WebElement} element
   *
   * @returns {Object} The X and Y coordinates for the element on the page.
   */
  this.getLocation = function (element) {
    return _get('/session/:sessionId/element/' + element.getElementId() + '/location').value;
  };

  /**
   * Determine an element's location on the screen once it has been scrolled into view.
   *
   * <p>Note: This is considered an internal command and should only be used to determine an element's location for
   *       correctly generating native events.</p>
   *
   * @param {WebElement} element
   *
   * @returns {Object} The X and Y coordinates for the element on the page.
   */
  this.getLocationInView = function (element) {
    return _get('/session/:sessionId/element/' + element.getElementId() + '/location_in_view').value;
  };

  /**
   * Determine an element's size in pixels.
   *
   * @param {WebElement} element
   *
   * @returns {width, height}
   */
  this.getElementSize = function (element) {
    return _get('/session/:sessionId/element/' + element.getElementId() + '/size').value;
  };

  /**
   * Query the value of an element's computed CSS property.
   *
   * <p>The CSS property to query should be specified using the CSS property name,
   * not the JavaScript property name (e.g. background-color instead of backgroundColor).</p>
   *
   * @param {WebElement} element
   * @param {String} propertyName
   *
   * @returns {String}
   */
  this.getCssProperty = function (element, propertyName) {
    return _get('/session/:sessionId/element/' + element.getElementId() + '/css/' + propertyName).value;
  };

  /**
   * Gets the text of the currently displayed JavaScript alert(), confirm(), or prompt() dialog.
   *
   * @returns {String}
   */
  this.getAlertText = function () {
    return _get('/session/:sessionId/alert_text').value;
  };

  /**
   * The same as WebDriver.getAlertText(), but returns null if there is no alert dialog.
   *
   * @returns {String|null}
   */
  this.getAlertTextOrNull = function () {
    var text;

    try {
      text = this.getAlertText();
    } catch (e) {
      if (e instanceof NoAlertOpenError) {
        return null;
      }

      throw e;
    }

    return text;
  };

  /**
   * Returns true if there is alert window.
   *
   * @returns {boolean}
   */
  this.isAlertOpened = function () {
    return this.getAlertTextOrNull() !== null;
  };

  /**
   * Sends keystrokes to a JavaScript prompt() dialog.
   *
   * @param {String} value
   *
   * @returns {WebDriver}
   */
  this.setPromptValue = function (value) {
    _post('/session/:sessionId/alert_text', {
      text: value
    });

    return this;
  };

  /**
   * Accepts the currently displayed alert dialog.
   *
   * <p>Usually, this is equivalent to clicking on the 'OK' button in the dialog.</p>
   *
   * @returns {WebDriver}
   */
  this.acceptAlert = function () {
    _post('/session/:sessionId/accept_alert');

    return this;
  };

  /**
   * Dismisses the currently displayed alert dialog.
   *
   * <p>For confirm() and prompt() dialogs, this is equivalent to clicking
   * the 'Cancel' button. For alert() dialogs, this is equivalent to clicking the 'OK' button.</p>
   *
   * @returns {WebDriver}
   */
  this.dismissAlert = function () {
    _post('/session/:sessionId/dismiss_alert');

    return this;
  };

  /**
   * Move the mouse by an offset of the specificed element.
   *
   * If no element is specified, the move is relative to the current mouse cursor.
   * If an element is provided but no offset, the mouse will be moved to the center of the element.
   * If the element is not visible, it will be scrolled into view.
   *
   * @param {WebElement|null} el
   * @param {Number|null} offsetX
   * @param {Number|null} offsetY
   *
   * @return {WebDriver}
   */
  this.moveTo = function (el, offsetX, offsetY) {
    _post('/session/:sessionId/moveto', {
      element: el instanceof WebElement ? el.getElementId() : null,
      xoffset: parseInt(offsetX, 10) || null,
      yoffset: parseInt(offsetY, 10) || null
    });

    return this;
  };

  /**
   * Click any mouse button (at the coordinates set by the last moveto command).
   *
   * <p>Note that calling this command after calling buttondown and before calling button up (or any out-of-order
   * interactions sequence) will yield undefined behaviour).</p>
   *
   * @param {Number} button Which button, enum: {LEFT = 0, MIDDLE = 1 , RIGHT = 2}. Defaults to the left mouse button
   *                        if not specified.
   *
   * @returns {WebDriver}
   */
  this.click = function (button) {
    _post('/session/:sessionId/click', {
      button: button
    });

    return this;
  };

  /**
   * Double-clicks at the current mouse coordinates (set by moveto).
   *
   * @returns {WebDriver}
   */
  this.doubleClick = function () {
    _post('/session/:sessionId/doubleclick');

    return this;
  };

  /**
   * Click and hold the left mouse button (at the coordinates set by the last moveto command).
   *
   * <p>Note that the next mouse-related command that should follow is buttonup .
   * Any other mouse command (such as click or another call to buttondown) will yield undefined behaviour.</p>
   *
   * @param {Number} button Which button, enum: {LEFT = 0, MIDDLE = 1 , RIGHT = 2}. Defaults to the left mouse button
   *                        if not specified.
   *
   * @returns {WebDriver}
   */
  this.buttonDown = function (button) {
    _post('/session/:sessionId/buttondown', {
      button: button
    });

    return this;
  };

  /**
   * Releases the mouse button previously held (where the mouse is currently at).
   *
   * <p>Must be called once for every buttondown command issued. See the note in click and buttondown about implications
   * of out-of-order commands.</p>
   *
   * @param {Number} button Which button, enum: {LEFT = 0, MIDDLE = 1 , RIGHT = 2}. Defaults to the left mouse button
   *                        if not specified.
   *
   * @returns {WebDriver}
   */
  this.buttonUp = function (button) {
    _post('/session/:sessionId/buttonup', {
      button: button
    });

    return this;
  };

  /**
   * Polls specified function.
   *
   * @param conditionFn Function to poll. It should return true or false.
   * @param thisArg
   * @param {Number} [timeout] Timeout in seconds. Defaults to 15 s.
   * @param {Number} [interval] Interval in seconds. Defaults to 0.5 s.
   * @returns {Boolean}
   */
  this.waitForCondition = function (conditionFn, thisArg, timeout, interval) {
    if (typeof conditionFn !== 'function') {
      throw new TypeError('condition must be a function that returns a Boolean');
    }

    timeout = timeout || 15;
    interval = interval || 0.5;

    var timeLeft = timeout;
    while (timeLeft > 0) {
      if (conditionFn.call(thisArg || this)) {
        return true;
      }

      timeLeft -= interval;
      _sleep(interval);
    }

    return false;
  };

  /**
   * Wait for element and return it when it appears.
   *
   * @param {String} using See WebDriver.getElement() for details.
   * @param {String} value Value for query.
   * @param {Number} [timeout] Timeout in seconds.
   * @param {Number} [interval] Interval in seconds.
   *
   * @returns {WebElement}
   */
  this.waitForElement = function (using, value, timeout, interval) {
    timeout = timeout || 15;
    interval = interval || 0.5;

    var conditionFn = function () {
      if (!this.hasElement(using, value)) {
        return false;
      }

      if (!this.getElement(using, value).isDisplayed()) {
        return false;
      }

      return true;
    };

    if (!this.waitForCondition(conditionFn, this, timeout, interval)) {
      throw new Timeout('Element "' + value + '" was not found using "' + using + '" after ' + timeout +
        ' seconds with polling interval of ' + interval + ' seconds.');
    }

    return this.getElement(using, value);
  };

  this.waitForElementByXpath = function (value) {
    return this.waitForElement('xpath', value);
  };

  this.waitForElementByName = function (value) {
    return this.waitForElement('name', value);
  };

  this.waitForElementById = function (value) {
    return this.waitForElement('id', value);
  };

  /**
   * Wait for element will be not present on a page.
   *
   * @param {String} using See WebDriver.getElement() for details.
   * @param {String} value Value for query.
   * @param {Number} [timeout] Timeout in seconds.
   * @param {Number} [interval] Interval in seconds.
   */
  this.waitForElementDisappear = function (using, value, timeout, interval) {
    var conditionFn = function () {
      return !this.hasElement(using, value);
    };

    if (!this.waitForCondition(conditionFn, this, timeout, interval)) {
      throw new Timeout('Element "' + value + '" was not found using "' + using + '" after ' + timeout +
        ' seconds with polling interval of ' + interval + ' seconds.');
    }
  };

  /**
   * Waits for alert dialog appear and returns it's text.
   *
   * @param {Number} [timeout] Timeout in seconds.
   * @param {Number} [interval] Interval in seconds.
   *
   * @returns {String}
   */
  this.waitForAlert = function (timeout, interval) {
    var conditionFn = function () {
      return this.isAlertOpened();
    };

    if (!this.waitForCondition(conditionFn, this, timeout, interval)) {
      throw new Timeout('Alert was not found using after ' + timeout + ' seconds with polling interval of ' +
        interval + ' seconds.');
    }

    return this.getAlertText();
  };

  /**
   * Waits for alert dialog not appear.
   *
   * @param {Number} [timeout] Timeout in seconds.
   * @param {Number} [interval] Interval in seconds.
   */
  this.waitForNoAlert = function (timeout, interval) {
    try {
      this.waitForAlert(timeout, interval);
    } catch (e) {
      if (e instanceof Timeout) {
        return;
      }

      throw e;
    }

    throw new Timeout('There was an alert dialog still opened during ' + timeout + ' seconds.');
  };

  /**
   * Retrieve all cookies visible to the current page.
   *
   * @returns {Cookie[]} A list of cookies.
   */
  this.getCookies = function () {
    return _get('/session/:sessionId/cookie').value;
  };

  /**
   * Set a cookie.
   *
   * @param {Cookie} cookie
   *
   * @returns {WebDriver}
   */
  this.setCookie = function (cookie) {
    if (! cookie instanceof Cookie) {
      throw new TypeError('Wrong cookie object');
    }

    _post('/session/:sessionId/cookie', {
      cookie: cookie.toObject()
    });

    return this;
  };

  /**
   * Method for more simple way to add cookie.
   *
   * @param {String} name The name of the cookie.
   * @param {String} value The cookie value.
   * @param {String} [path] The cookie path.
   * @param {String} [domain] The domain the cookie is visible to.
   * @param {Boolean} [secure] Whether the cookie is a secure cookie.
   * @param {Number} [expiry] Count of hours from now when the cookie expires.
   */
  this.cookie = function (name, value, path, domain, secure, expiry) {
    var cookie = new Cookie({
      name: name,
      value: value,
      path: path,
      domain: domain,
      secure: secure,
      expiryHours: expiry || 24
    }, this);

    this.setCookie(cookie);
  };

  /**
   * Delete all cookies visible to the current page.
   *
   * @returns {WebDriver}
   */
  this.deleteCookies = function () {
    _request('/session/:sessionId/cookie', 'DELETE');

    return this;
  };

  /**
   * Delete cookie with given name.
   *
   * @param {String} name
   *
   * @returns {WebDriver}
   */
  this.deleteCookie = function (name) {
    _request('/session/:sessionId/cookie', 'DELETE', JSON.stringify({
      name: name
    }));

    return this;
  }
};

module.exports = WebDriver;
