var
  WebElement;

/**
 * @constructor
 */
WebElement = function (elementId, wd) {
  /**
   * Get element ID for current session.
   *
   * @returns {String} Element ID.
   */
  this.getElementId = function () {
    return elementId;
  };

  /**
   * Click on an element.
   *
   * @returns {*}
   */
  this.click = function () {
    wd.clickElement(this);

    return this;
  };

  /**
   * Submit a FORM element.
   *
   * The submit command may also be applied to any element that is a descendant of a FORM element.
   *
   * @returns {*}
   */
  this.submit = function () {
    wd.submitElement(this);

    return this;
  };

  /**
   * Returns the visible text for the element.
   *
   * @returns {String}
   */
  this.getText = function () {
    return wd.getElementText(this);
  };

  /**
   * Send a sequence of key strokes to the active element. This command is similar to the WebDriver.type command in
   * every aspect except the implicit termination: The modifiers are not released at the end of the call. Rather, the
   * state of the modifier keys is kept between calls, so mouse interactions can be performed while modifier keys are
   * depressed.
   *
   * @param {String} value
   *
   * @returns {*}
   */
  this.type = function (value) {
    wd.type(this, value);

    return this;
  };

  /**
   * Query for an element's tag name.
   *
   * @returns {String}
   */
  this.getTagName = function () {
    return wd.getElementTagName(this);
  };

  /**
   * Clear a TEXTAREA or text INPUT element's value.
   *
   * @returns {*}
   */
  this.clear = function () {
    wd.clear(this);

    return this;
  };

  /**
   * Determine if an OPTION element, or an INPUT element of type checkbox or radiobutton is currently selected.
   *
   * @returns {Boolean}
   */
  this.isSelected = function () {
    return wd.isSelected(this);
  };

  /**
   * Determine if an element is currently enabled.
   *
   * @returns {Boolean}
   */
  this.isEnabled = function () {
    return wd.isEnabled(this);
  };

  /**
   * Determine if an element is currently displayed.
   *
   * @returns {Boolean}
   */
  this.isDisplayed = function () {
    return wd.isDisplayed(this);
  };

  /**
   * Get the value of an element's attribute.
   *
   * @param {String} name
   *
   * @returns {String}
   */
  this.getAttribute = function (name) {
    return wd.getAttribute(this, name);
  };

  /**
   * Determine an element's location on the page. The point (0, 0) refers to the upper-left corner of the page.
   *
   * @returns {x, y}
   */
  this.getLocation = function () {
    return wd.getLocation(this);
  };

  /**
   * Determine an element's location on the screen once it has been scrolled into view.
   *
   * Note: This is considered an internal command and should only be used to determine an element's location for
   *       correctly generating native events.
   *
   * @returns {x, y} The X and Y coordinates for the element on the page.
   */
  this.getLocationInView = function () {
    return wd.getLocationInView(this);
  };

  /**
   * Determine an element's size in pixels.
   *
   * @returns {width, height}
   */
  this.getSize = function () {
    return wd.getElementSize(this);
  };

  /**
   * Query the value of an element's computed CSS property. The CSS property to query should be specified using the CSS
   * property name, not the JavaScript property name (e.g. background-color instead of backgroundColor).
   *
   * @param {String} propertyName
   *
   * @returns {String}
   */
  this.getCssProperty = function (propertyName) {
    return wd.getCssProperty(this, propertyName);
  };

  /**
   * Start dragging current element and drop it over the second element.
   *
   * @param {WebElement} element Second element.
   *
   * @returns {*}
   */
  this.dragAndDropTo = function (element) {
    wd.moveTo(this);
    wd.buttonDown();
    wd.moveTo(element);
    wd.buttonUp();

    return this;
  };
};

module.exports = WebElement;
