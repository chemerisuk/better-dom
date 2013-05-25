/*!
 * better-dom (https://github.com/chemerisuk/better-dom)
 * Modern javascript library for working with DOM
 *
 * Copyright (c) 2013 Maksim Chemerisuk
 */
(function(window, document, _, undefined) {
    "use strict";

    // VARIABLES
    // ---------

    var htmlEl = document.documentElement,
        scripts = document.scripts,
        // helpers
        supports = function(prop, tag) {
            var el = typeof tag === "string" ? document.createElement(tag) : tag || document,
                isSupported = prop in el;

            if (!isSupported && !prop.indexOf("on")) {
                // http://perfectionkills.com/detecting-event-support-without-browser-sniffing/
                
                el.setAttribute(prop, "return;");
                isSupported = typeof el[prop] === "function";
            }
                
            return isSupported;
        },
        makeError = function(method, type) {
            type = type || "DOMElement";

            return "Error: " + type + "." + method + " was called with illegal arguments. Check http://chemerisuk.github.io/better-dom/" + type + ".html#" + method + " to verify the function call";
        },
        handleObjectParam = function(name) {
            var cache = {};

            return cache[name] || (cache[name] = function(key, index, obj) {
                this[name](key, obj[key]);
            });
        },
        getComputedStyle = window.getComputedStyle || function(el) {
            return el.currentStyle;
        };
        
    // DOMNode
    // -------
    
    /**
     * Prototype for limited/protected elements in better-dom
     * @name DOMNode
     * @constructor
     * @param node native object
     */
    function DOMNode(node) {
        if (!(this instanceof DOMNode)) {
            return new DOMNode(node);
        }

        this._node = node;
        this._data = {};
        this._events = [];
        this._extends = {};
    }

    DOMNode.prototype = {
        /**
         * Finds element by selector
         * @memberOf DOMNode.prototype
         * @param  {String} selector css selector
         * @return {DOMElement} element or null if nothing was found
         * @example
         * var domBody = DOM.find("body");
         *
         * domBody.find("#element");
         * // returns DOMElement with id="element"
         * domBody.find(".link");
         * // returns first element with class="link"
         */
        find: function() {
            // big part of code inspired by Sizzle:
            // https://github.com/jquery/sizzle/blob/master/sizzle.js

            // TODO: disallow to use buggy selectors?
            var rquickExpr = /^(?:#([\w\-]+)|(\w+)|\.([\w\-]+))$/,
                rsibling = /[\x20\t\r\n\f]*[+~>]/,
                rescape = /'|\\/g,
                tmpId = "DOM" + new Date().getTime();

            if (!supports("getElementsByClassName")) {
                // exclude getElementsByClassName from pattern
                rquickExpr = /^(?:#([\w\-]+)|(\w+))$/;
            }
            
            return function(selector, /*INTERNAL*/multiple) {
                if (typeof selector !== "string") {
                    throw makeError("find");
                }

                var node = this._node,
                    quickMatch, m, elem, elements;

                if (quickMatch = rquickExpr.exec(selector)) {
                    // Speed-up: "#ID"
                    if (m = quickMatch[1]) {
                        elem = document.getElementById(m);
                        // Handle the case where IE, Opera, and Webkit return items
                        // by name instead of ID
                        if ( elem && elem.parentNode && elem.id === m && (node === document || this.contains(elem)) ) {
                            elements = [elem];
                        }
                    // Speed-up: "TAG"
                    } else if (quickMatch[2]) {
                        elements = node.getElementsByTagName(selector);
                    // Speed-up: ".CLASS"
                    } else if (m = quickMatch[3]) {
                        elements = node.getElementsByClassName(m);
                    }

                    if (elements && !multiple) {
                        elements = elements[0];
                    }
                } else {
                    var old = true,
                        nid = tmpId,
                        context = node;

                    if (node !== document) {
                        // qSA works strangely on Element-rooted queries
                        // We can work around this by specifying an extra ID on the root
                        // and working up from there (Thanks to Andrew Dupont for the technique)
                        if ( (old = node.getAttribute("id")) ) {
                            nid = old.replace(rescape, "\\$&");
                        } else {
                            node.setAttribute("id", nid);
                        }

                        nid = "[id='" + nid + "'] ";

                        context = rsibling.test(selector) && node.parentNode || node;
                        selector = nid + selector.split(",").join("," + nid);
                    }

                    try {
                        elements = context[multiple ? "querySelectorAll" : "querySelector"](selector);
                    } finally {
                        if ( !old ) {
                            node.removeAttribute("id");
                        }
                    }
                }

                return multiple ? new DOMElementCollection(elements) : DOMElement(elements);
            };
        }(),

        /**
         * Finds all elements by selector
         * @memberOf DOMNode.prototype
         * @param  {String} selector css selector
         * @return {DOMElementCollection} elements collection
         */
        findAll: function(selector) {
            return this.find(selector, true);
        },

        /**
         * Read data entry value
         * @memberOf DOMNode.prototype
         * @param  {String} key data entry key
         * @return {Object} data entry value
         * @example
         * var domLink = DOM.find(".link");
         *
         * domLink.setData("test", "message");
         * domLink.getData("test");
         * // returns string "message"
         */
        getData: function(key) {
            if (typeof key !== "string") {
                throw makeError("getData");
            }

            var node = this._node,
                result = this._data[key];

            if (result === undefined && node.hasAttribute("data-" + key)) {
                result = this._data[key] = node.getAttribute("data-" + key);
            }

            return result;
        },

        /**
         * Store data entry value(s)
         * @memberOf DOMNode.prototype
         * @param {String|Object} key data entry key | key/value pairs
         * @param {Object} value data to store
         * @example
         * var domLink = DOM.find(".link");
         * 
         * domLink.setData("test", "message");
         * domLink.setData({a: "b", c: "d"});
         */
        setData: function(key, value) {
            var keyType = typeof key;

            if (keyType === "string") {
                this._data[key] = value;
            } else if (keyType === "object") {
                _.forOwn(key, handleObjectParam("setData"), this);
            } else {
                throw makeError("setData");
            }

            return this;
        },

        /**
         * Check if element is inside of context
         * @memberOf DOMNode.prototype
         * @param  {DOMElement} element element to check
         * @return {Boolean} true if success
         * @example
         * DOM.find("html").contains(DOM.find("body"));
         * // returns true
         */
        contains: function() {
            var containsElement;

            if (supports("contains", "a")) {
                containsElement = function(parent, child) {
                    return parent.contains(child);
                };
            } else {
                containsElement = function(parent, child) {
                    return !!(parent.compareDocumentPosition(child) & 16);
                };
            }
            
            return function(element, /*INTERNAL*/reverse) {
                var node = this._node, result = true;

                if (element instanceof Element) {
                    result = containsElement(reverse ? element : node, reverse ? node : element);
                } else if (element instanceof DOMElement) {
                    result = element.contains(node, true);
                } else if (element instanceof DOMElementCollection) {
                    element.each(function(element) {
                        result = result && element.contains(node, true);
                    });
                } else {
                    throw makeError("contains");
                }

                return result;
            };
        }(),

        /**
         * Check element capability
         * @memberOf DOMNode.prototype
         * @param {String} prop property to check
         * @param {String} [tag] name of element to test
         * @example
         * input.supports("placeholder");
         * // => true if an input supports placeholders
         * DOM.supports("addEventListener");
         * // => true if browser supports document.addEventListener
         * DOM.supports("oninvalid", "input");
         * // => true if browser supports `invalid` event
         */
        supports: function() {
            var cache = {};

            return function(prop, tag) {
                var key = prop + ":" + (tag || this._node.nodeName.toLowerCase());

                return cache[key] || ( cache[key] = supports(prop, tag || this._node) );
            };
        }()
    };

    // EVENTS
    
    (function() {
        var eventHooks = {},
            veto = false,
            createEventHandler = function(thisPtr, callback, selector, eventType) {
                var currentTarget = thisPtr._node,
                    matcher = SelectorMatcher(selector),
                    simpleEventHandler = function(e) {
                        if (veto !== eventType) callback.call(thisPtr, DOMEvent(e || window.event, currentTarget));
                    };

                return !selector ? simpleEventHandler : function(e) {
                    var elem = window.event ? window.event.srcElement : e.target;

                    for (; elem && elem !== currentTarget; elem = elem.parentNode) {
                        if (matcher.test(elem)) {
                            return simpleEventHandler(e);
                        }
                    }
                };
            },
            createCustomEventHandler = function(originalHandler) {
                var handler = function() {
                        if (window.event._type === originalHandler.type) originalHandler();
                    };

                handler.type = originalHandler.type;
                handler._type = "dataavailable";
                handler.callback = originalHandler.callback;

                return handler;
            };

        // firefox doesn't support focusin/focusout events
        if (supports("onfocusin", "input")) {
            _.forOwn({focus: "focusin", blur: "focusout"}, function(prop, index, obj) {
                eventHooks[prop] = function(handler) { handler._type = obj[prop]; };
            });
        } else {
            eventHooks.focus = eventHooks.blur = function(handler) {
                handler.capturing = true;
            };
        }

        if (supports("oninvalid", "input")) {
            eventHooks.invalid = function(handler) {
                handler.capturing = true;
            };
        }

        if (!document.addEventListener) {
            // input event fix via propertychange
            document.attachEvent("onfocusin", function() {
                var propertyChangeEventHandler = function() {
                        var e = window.event;

                        if (e.propertyName === "value") {
                            var event = document.createEventObject();

                            event._type = "input";

                            // trigger special event that bubbles
                            e.srcElement.fireEvent("ondataavailable", event);
                        }
                    },
                    capturedEl;

                return function() {
                    var target = window.event.srcElement;

                    if (capturedEl) {
                        capturedEl.detachEvent("onpropertychange", propertyChangeEventHandler);
                        capturedEl = null;
                    }

                    if (target.type === "input" || target.type === "textarea") {
                        (capturedEl = target).attachEvent("onpropertychange", propertyChangeEventHandler);
                    }
                };
            }());

            // submit event bubbling fix
            document.attachEvent("onkeydown", function() {
                var target = window.event.srcElement,
                    form = target.form;

                if (form && target.type !== "textarea" && window.event.keyCode === 13) {
                    DOMElement(form).fire("submit");

                    return false;
                }
            });

            document.attachEvent("onclick", function() {
                var handleSubmit = function() {
                        var form = window.event.srcElement;

                        form.detachEvent("onsubmit", handleSubmit);

                        DOMElement(form).fire("submit");

                        return false;
                    };

                return function() {
                    var target = window.event.srcElement,
                        form = target.form;

                    if (form && target.type === "submit") {
                        form.attachEvent("onsubmit", handleSubmit);
                    }
                };
            }());

            eventHooks.submit = eventHooks.input = function(handler) {
                handler.custom = true;
            };
        }

        /**
         * Bind a DOM event to the context
         * @memberOf DOMNode.prototype
         * @param  {String}   type    event type
         * @param  {String}   [selector] css selector to filter
         * @param  {DOMNode#eventCallback} callback event handler
         * @return {DOMNode} current context
         */
        DOMNode.prototype.on = function(type, selector, callback) {
            var eventType = typeof type,
                hook, handler;

            if (eventType === "string") {
                if (typeof selector === "function") {
                    callback = selector;
                    selector = null;
                }

                if (!~type.indexOf(" ")) {
                    handler = createEventHandler(this, callback, selector, type);
                    handler.type = type;
                    handler.callback = callback;

                    if (hook = eventHooks[type]) hook(handler);

                    if (document.addEventListener) {
                        this._node.addEventListener(handler._type || type, handler, !!handler.capturing);
                    } else {
                        if (~type.indexOf(":") || handler.custom) {
                            // handle custom events for IE8
                            handler = createCustomEventHandler(handler);
                        }

                        this._node.attachEvent("on" + (handler._type || type), handler);
                    }
                    
                    // store event entry
                    this._events.push(handler);
                } else {
                    _.forEach(type.split(" "), function(type) {
                        this.on(type, selector, callback);
                    }, this);
                }
            } else if (eventType === "object") {
                _.forOwn(type, handleObjectParam("on"), this);
            } else {
                throw makeError("on");
            }

            return this;
        };

        /**
         * Unbind a DOM event from the context
         * @memberOf DOMNode.prototype
         * @param  {String} type event type
         * @param  {DOMNode#eventCallback} [callback]  event handler
         * @return {DOMNode} current context
         */
        DOMNode.prototype.off = function(type, callback) {
            if (typeof type !== "string" || callback !== undefined && typeof callback !== "function") {
                throw makeError("off");
            }

            _.forEach(this._events, function(handler, index, events) {
                var node = this._node;

                if (handler && type === handler.type && (!callback || callback === handler.callback)) {
                    type = handler._type || handler.type;

                    if (document.removeEventListener) {
                        node.removeEventListener(type, handler, !!handler.capturing);
                    } else {
                        node.detachEvent("on" + type, handler);
                    }

                    delete events[index];
                }
            }, this);

            return this;
        };

        /**
         * Event handler definition
         * @callback DOMNode#eventCallback
         * @param {DOMEvent} event instance of event
         */

        /**
         * Triggers an event of specific type
         * @memberOf DOMNode.prototype
         * @param  {String} eventType type of event
         * @param  {Object} [detail] data to attach
         * @return {DOMNode} current context
         * @example
         * var domLink = DOM.find(".link");
         *
         * domLink.fire("focus");
         * // receive focus to the element
         * domLink.fire("custom:event", {x: 1, y: 2});
         * // trigger a custom:event on the element
         */
        DOMNode.prototype.fire = function(type, detail) {
            if (typeof type !== "string") {
                throw makeError("fire");
            }

            var node = this._node,
                isCustomEvent = ~type.indexOf(":"),
                hook = eventHooks[type],
                event, isDefaultPrevented, handler = {};

            if (hook) hook(handler);

            if (document.dispatchEvent) {
                event = document.createEvent(isCustomEvent ? "CustomEvent" : "Event");

                if (isCustomEvent) {
                    event.initCustomEvent(handler._type || type, true, false, detail);
                } else {
                    event.initEvent(handler._type || type, true, true);
                }
                
                node.dispatchEvent(event);

                isDefaultPrevented = event.defaultPrevented;
            } else {
                event = document.createEventObject();

                isCustomEvent = isCustomEvent || handler.custom;

                if (isCustomEvent) {
                    // use private attribute to store custom event name
                    event._type = type;
                    event.detail = detail;
                }

                node.fireEvent("on" + (isCustomEvent ? "dataavailable" : handler._type || type), event);

                isDefaultPrevented = event.returnValue === false;
            }

            // Call a native DOM method on the target with the same name as the event
            // IE<9 dies on focus/blur to hidden element
            if (!isDefaultPrevented && node[type] && (type !== "focus" && type !== "blur" || node.offsetWidth)) {
                // Prevent re-triggering of the same event
                veto = type;
                
                node[type]();

                veto = false;
            }

            return this;
        };
    })();

    // DOMElement
    // ----------

    /**
     * Prototype for elements in better-dom
     * @name DOMElement
     * @constructor
     * @param element native element
     * @extends DOMNode
     */
    function DOMElement(element) {
        if (!(this instanceof DOMElement)) {
            return element ? element.__dom__ || new DOMElement(element) : new MockElement();
        }

        DOMNode.call(this, element);

        if (element) element.__dom__ = this;
    }

    DOMElement.prototype = new DOMNode();

    /**
     * Check if the element matches selector
     * @memberOf DOMElement.prototype
     * @param  {String} selector css selector
     * @return {DOMElement} reference to this
     */
    DOMElement.prototype.matches = function(selector) {
        if (!selector || typeof selector !== "string") {
            throw makeError("matches");
        }

        return new SelectorMatcher(selector).test(this._node);
    };

    /**
     * Clone element
     * @memberOf DOMElement.prototype
     * @return {DOMElement} reference to this
     */
    DOMElement.prototype.clone = function() {
        return new DOMElement(_.cloneNode(this._node));
    };

    /**
     * Calculates offset of current context
     * @memberOf DOMElement.prototype
     * @return {{top: Number, left: Number, right: Number, bottom: Number}} offset object
     */
    DOMElement.prototype.offset = function() {
        var bodyEl = document.body,
            boundingRect = this._node.getBoundingClientRect(),
            clientTop = htmlEl.clientTop || bodyEl.clientTop || 0,
            clientLeft = htmlEl.clientLeft || bodyEl.clientLeft || 0,
            scrollTop = window.pageYOffset || htmlEl.scrollTop || bodyEl.scrollTop,
            scrollLeft = window.pageXOffset || htmlEl.scrollLeft || bodyEl.scrollLeft;

        return {
            top: boundingRect.top + scrollTop - clientTop,
            left: boundingRect.left + scrollLeft - clientLeft,
            right: boundingRect.right + scrollLeft - clientLeft,
            bottom: boundingRect.bottom + scrollTop - clientTop
        };
    };

    /**
     * Show element
     * @memberOf DOMElement.prototype
     * @return {DOMElement} reference to this
     */
    DOMElement.prototype.show = function() {
        return this.set("hidden", false);
    };

    /**
     * Hide element
     * @memberOf DOMElement.prototype
     * @return {DOMElement} reference to this
     */
    DOMElement.prototype.hide = function() {
        return this.set("hidden", true);
    };

    /**
     * Check is element is hidden
     * @memberOf DOMElement.prototype
     * @return {Boolean} true if element is hidden
     */
    DOMElement.prototype.isHidden = function() {
        return !!this.get("hidden");
    };

    /**
     * Check if element has focus
     * @memberOf DOMElement.prototype
     * @return {Boolean} true if current element is focused
     */
    DOMElement.prototype.isFocused = function() {
        return this._node === document.activeElement;
    };
        
    DOMElement.prototype.serialize = function() {
        var el = this._node, result,
            makePair = function(name, value) {
                return encodeURIComponent(name) + "=" +encodeURIComponent(value);
            };

        if (el.elements) {
            result = _.reduce(el.elements, function(parts, field) {
                if (field.name) { // don't include form fields without names
                    switch(field.type) {
                    case "select-one":
                    case "select-multiple":
                        _.forEach(field.options, function(option) {
                            if (option.selected) {
                                parts.push(makePair(field.name, option.hasAttribute("value") ? option.value : option.text));
                            }
                        });
                        break; 
    
                    case undefined: // fieldset
                    case "file": // file input
                    case "submit": // submit button
                    case "reset": // reset button
                    case "button": // custom button
                        break; 
    
                    case "radio": // radio button
                    case "checkbox": // checkbox
                        if (!field.checked) break;
                        /* falls through */
                    default:
                        parts.push(makePair(field.name, field.value));
                    }

                    return parts;
                }
            }, []);

            result = result.join("&");
        } else if (el.form) {
            result = makePair(el.name, el.value);
        } else {
            return el.outerHTML;
        }

        return result.replace(/%20/g, "+");
    };

    // GETTER / SETTER

    (function() {
        var propHooks = {},
            throwIllegalAccess = function() { throw makeError("get"); };
        // protect access to some properties
        _.forEach("children childNodes elements parentNode firstElementChild lastElementChild nextElementSibling previousElementSibling".split(" "), function(key) {
            propHooks[key] = propHooks[key.replace("Element", "")] = {
                get: throwIllegalAccess,
                set: throwIllegalAccess
            };
        });

        if (document.attachEvent) {
            // fix NoScope elements in IE < 10
            propHooks.innerHTML = {
                set: function(el, value) {
                    el.innerHTML = "";
                    el.appendChild(_.parseFragment(value));
                }
            };

            if (!document.addEventListener) {
                propHooks.tagName = propHooks.nodeName = {
                    get: function(el) {
                        return el.nodeName.toUpperCase();
                    }
                };
            }
        }

        if (!supports("hidden", "a")) {
            propHooks.hidden = {
                set: function(el, value) {
                    if (typeof value !== "boolean") {
                        throw makeError("set");
                    }

                    el.hidden = value;

                    if (value) {
                        el.setAttribute("hidden", "hidden");
                    } else {
                        el.removeAttribute("hidden");
                    }

                    // trigger redraw in IE
                    el.style.zoom = value ? "1" : "0";
                }
            };
        }

        /**
         * Get property or attribute by name
         * @memberOf DOMElement.prototype
         * @param  {String} [name] property/attribute name
         * @return {String} property/attribute value
         */
        DOMElement.prototype.get = function(name) {
            var el = this._node,
                hook = propHooks[name];

            if (name === undefined) {
                name = el.type && "value" in el ? "value" : "innerHTML";
            } else if (typeof name !== "string") {
                throw makeError("get");
            }

            if (hook) hook = hook.get;

            return hook ? hook(el) : name in el ? el[name] : el.getAttribute(name);
        };

        /**
         * Set property/attribute value
         * @memberOf DOMElement.prototype
         * @param {String} [name] property/attribute name
         * @param {String} value property/attribute value
         * @return {DOMElement} reference to this
         */
        DOMElement.prototype.set = function(name, value) {
            var el = this._node,
                nameType = typeof name,
                valueType = typeof value;

            if (nameType === "object") {
                _.forOwn(name, handleObjectParam("set"), this);
            } else {
                if (value === undefined) {
                    valueType = nameType;
                    value = name;
                    name = el.type && "value" in el ? "value" : "innerHTML";
                    nameType = "string";
                }

                if (valueType === "function") {
                    value = value.call(this, this.get(name));
                    valueType = typeof value;
                }

                if (nameType === "string") {
                    _.forEach(name.split(" "), function(name) {
                        var hook = propHooks[name];

                        if (hook) {
                            hook.set(el, value);
                        } else if (value === null) {
                            el.removeAttribute(name);
                        } else if (name in el) {
                            el[name] = value;
                        } else {
                            el.setAttribute(name, value);
                        }
                    });
                } else {
                    throw makeError("set");
                }
            }

            return this;
        };
    })();

    // TRAVERSING
    
    (function() {
        function makeTraversingMethod(propertyName, multiple) {
            return function(selector) {
                var matcher = SelectorMatcher(selector),
                    nodes = multiple ? [] : null,
                    it = this._node;

                while (it = it[propertyName]) {
                    if (it.nodeType === 1 && (!matcher || matcher.test(it))) {
                        if (!multiple) break;

                        nodes.push(it);
                    }
                }

                return multiple ? new DOMElementCollection(nodes) : DOMElement(it);
            };
        }

        function makeChildTraversingMethod(multiple) {
            return function(index, selector) {
                if (multiple) {
                    selector = index;
                } else if (typeof index !== "number") {
                    throw makeError("child");
                }

                var children = this._node.children,
                    matcher = SelectorMatcher(selector),
                    el;

                if (!document.addEventListener) {
                    // fix IE8 bug with children collection
                    children = _.filter(children, function(el) {
                        return el.nodeType === 1;
                    });
                }

                if (multiple) {
                    return new DOMElementCollection(!matcher ? children : 
                        _.filter(children, matcher.test, matcher));
                }

                if (index < 0) index = children.length + index;

                el = children[index];

                return DOMElement(!matcher || matcher.test(el) ? el : null);
            };
        }

        /**
         * Find next sibling element filtered by optional selector
         * @memberOf DOMElement.prototype
         * @param {String} [selector] css selector
         * @return {DOMElement} matched element
         * @function
         */
        DOMElement.prototype.next = makeTraversingMethod("nextSibling");

        /**
         * Find previous sibling element filtered by optional selector
         * @memberOf DOMElement.prototype
         * @param {String} [selector] css selector
         * @return {DOMElement} matched element
         * @function
         */
        DOMElement.prototype.prev = makeTraversingMethod("previousSibling");

        /**
         * Find all next sibling elements filtered by optional selector
         * @memberOf DOMElement.prototype
         * @param {String} [selector] css selector
         * @return {DOMElementCollection} matched elements
         * @function
         */
        DOMElement.prototype.nextAll = makeTraversingMethod("nextSibling", true);

        /**
         * Find all previous sibling elements filtered by optional selector
         * @memberOf DOMElement.prototype
         * @param {String} [selector] css selector
         * @return {DOMElementCollection} matched elements
         * @function
         */
        DOMElement.prototype.prevAll = makeTraversingMethod("previousSibling", true);

        /**
         * Find parent element filtered by optional selector
         * @memberOf DOMElement.prototype
         * @param {String} [selector] css selector
         * @return {DOMElement} matched element
         * @function
         */
        DOMElement.prototype.parent = makeTraversingMethod("parentNode");

        /**
         * Return child element by index filtered by optional selector
         * @memberOf DOMElement.prototype
         * @param  {Number} index child index
         * @param  {String} [selector] css selector
         * @return {DOMElement} matched child
         * @function
         * @example
         * var body = DOM.find("body");
         *
         * body.child(0); // => first child
         * body.child(-1); // => last child
         */
        DOMElement.prototype.child = makeChildTraversingMethod(false);

        /**
         * Fetch children elements filtered by optional selector
         * @memberOf DOMElement.prototype
         * @param  {String} [selector] css selector
         * @return {DOMElementCollection} matched elements
         * @function
         */
        DOMElement.prototype.children = makeChildTraversingMethod(true);
    })();

    // MANIPULATION
    // http://www.w3.org/TR/domcore/
    // 5.2.2 Mutation methods
    
    (function() {
        function makeManipulationMethod(methodName, fasterMethodName, strategy) {
            // always use _.parseFragment because of HTML5 elements bug 
            // and NoScope bugs in IE
            if (document.attachEvent) fasterMethodName = null;

            return function(element, /*INTERNAL*/reverse) {
                var el = reverse ? element : this._node,
                    relatedNode = el.parentNode;

                if (reverse) element = this._node;

                if (typeof element === "string") {
                    relatedNode = fasterMethodName ? null : _.parseFragment(element);
                } else if (element && (element.nodeType === 1 || element.nodeType === 11)) {
                    relatedNode = element;
                } else if (element instanceof DOMElement) {
                    element[methodName](el, true);

                    return this;
                } else if (element !== undefined) {
                    throw makeError(methodName);
                }

                if (relatedNode) {
                    strategy(el, relatedNode);
                } else {
                    el.insertAdjacentHTML(fasterMethodName, element);
                }

                return this;
            };
        }

        /**
         * Insert html string or native element after the current
         * @memberOf DOMElement.prototype
         * @param {String|Element|DOMElement} content HTML string or Element
         * @return {DOMElement} reference to this
         * @function
         */
        DOMElement.prototype.after = makeManipulationMethod("after", "afterend", function(node, relatedNode) {
            node.parentNode.insertBefore(relatedNode, node.nextSibling);
        });

        /**
         * Insert html string or native element before the current
         * @memberOf DOMElement.prototype
         * @param {String|Element|DOMElement} content HTML string or Element
         * @return {DOMElement} reference to this
         * @function
         */
        DOMElement.prototype.before = makeManipulationMethod("before", "beforebegin", function(node, relatedNode) {
            node.parentNode.insertBefore(relatedNode, node);
        });

        /**
         * Prepend html string or native element to the current
         * @memberOf DOMElement.prototype
         * @param {String|Element|DOMElement} content HTML string or Element
         * @return {DOMElement} reference to this
         * @function
         */
        DOMElement.prototype.prepend = makeManipulationMethod("prepend", "afterbegin", function(node, relatedNode) {
            node.insertBefore(relatedNode, node.firstChild);
        });

        /**
         * Append html string or native element to the current
         * @memberOf DOMElement.prototype
         * @param {String|Element|DOMElement} content HTML string or Element
         * @return {DOMElement} reference to this
         * @function
         */
        DOMElement.prototype.append = makeManipulationMethod("append", "beforeend", function(node, relatedNode) {
            node.appendChild(relatedNode);
        });

        /**
         * Replace current element with html string or native element
         * @memberOf DOMElement.prototype
         * @param {String|Element|DOMElement} content HTML string or Element
         * @return {DOMElement} reference to this
         * @function
         */
        DOMElement.prototype.replace = makeManipulationMethod("replace", "", function(node, relatedNode) {
            node.parentNode.replaceChild(relatedNode, node);
        });

        /**
         * Remove current element from DOM
         * @memberOf DOMElement.prototype
         * @return {DOMElement} reference to this
         * @function
         */
        DOMElement.prototype.remove = makeManipulationMethod("remove", "", function(node, parentNode) {
            parentNode.removeChild(node);
        });
    })();

    // classes manipulation
    (function() {
        var rclass = /[\n\t\r]/g;

        function makeClassesMethod(nativeStrategyName, strategy) {
            var arrayMethod = nativeStrategyName === "contains" ? "every" : "forEach",
                methodName = nativeStrategyName === "contains" ? "hasClass" : nativeStrategyName + "Class";

            if (htmlEl.classList) {
                strategy = function(className) {
                    return this._node.classList[nativeStrategyName](className);
                };
            }

            return function(classNames) {
                if (typeof classNames !== "string") {
                    throw makeError(methodName);
                }

                var result = _[arrayMethod](classNames.split(" "), strategy, this);

                return result === undefined ? this : result;
            };
        }

        /**
         * Check if element contains class name(s)
         * @memberOf DOMElement.prototype
         * @param  {String} classNames space-separated class name(s)
         * @return {Boolean} true if the element contains all classes
         * @function
         */
        DOMElement.prototype.hasClass = makeClassesMethod("contains", function(className) {
            return !!~((" " + this._node.className + " ")
                        .replace(rclass, " ")).indexOf(" " + className + " ");
        });

        /**
         * Add class(es) to element
         * @memberOf DOMElement.prototype
         * @param  {String} classNames space-separated class name(s)
         * @return {DOMElement} reference to this
         * @function
         */
        DOMElement.prototype.addClass = makeClassesMethod("add", function(className) {
            if (!this.hasClass(className)) {
                this._node.className += " " + className;
            }
        });

        /**
         * Remove class(es) from element
         * @memberOf DOMElement.prototype
         * @param  {String} classNames space-separated class name(s)
         * @return {DOMElement} reference to this
         * @function
         */
        DOMElement.prototype.removeClass = makeClassesMethod("remove", function(className) {
            this._node.className = _.trim((" " + this._node.className + " ")
                    .replace(rclass, " ").replace(" " + className + " ", " "));
        });

        /**
         * Toggle class(es) on element
         * @memberOf DOMElement.prototype
         * @param  {String} classNames space-separated class name(s)
         * @return {DOMElement} reference to this
         * @function
         */
        DOMElement.prototype.toggleClass = makeClassesMethod("toggle", function(className) {
            var oldClassName = this._node.className;

            this.addClass(className);

            if (oldClassName === this._node.className) {
                this.removeClass(className);
            }
        });
    })();

    // style manipulation
    (function() {
        var getStyleHooks = {},
            setStyleHooks = {},
            rdash = /\-./g,
            rcamel = /[A-Z]/g,
            dashSeparatedToCamelCase = function(str) { return str[1].toUpperCase(); },
            camelCaseToDashSeparated = function(str) { return "-" + str.toLowerCase(); },
            computed = getComputedStyle(htmlEl),
            // In Opera CSSStyleDeclaration objects returned by getComputedStyle have length 0
            props = computed.length ? _.slice(computed) : _.map(_.keys(computed), function(key) { return key.replace(rcamel, camelCaseToDashSeparated); });
        
        _.forEach(props, function(propName) {
            var prefix = propName[0] === "-" ? propName.substr(1, propName.indexOf("-", 1) - 1) : null,
                unprefixedName = prefix ? propName.substr(prefix.length + 2) : propName,
                stylePropName = propName.replace(rdash, dashSeparatedToCamelCase);

            // some browsers start vendor specific props in lowecase
            if (!(stylePropName in computed)) {
                stylePropName = stylePropName[0].toLowerCase() + stylePropName.substr(1);
            }

            if (stylePropName !== propName) {
                getStyleHooks[unprefixedName] = function(style) {
                    return style[stylePropName];
                };

                setStyleHooks[unprefixedName] = function(name, value) {
                    return propName + ":" + value;
                };
            }
        });

        // shortcuts
        _.forOwn({
            font: ["fontStyle", "fontSize", "/", "lineHeight", "fontFamily"],
            padding: ["paddingTop", "paddingRight", "paddingBottom", "paddingLeft"],
            margin: ["marginTop", "marginRight", "marginBottom", "marginLeft"],
            "border-width": ["borderTopWidth", "borderRightWidth", "borderBottomWidth", "borderLeftWidth"],
            "border-style": ["borderTopStyle", "borderRightStyle", "borderBottomStyle", "borderLeftStyle"]
        }, function(key, index, obj) {
            getStyleHooks[key] = function(style) {
                var result = [],
                    hasEmptyStyleValue = function(prop, index) {
                        result.push(prop === "/" ? prop : style[prop]);

                        return !result[index];
                    };

                return _.some(obj[key], hasEmptyStyleValue) ? "" : result.join(" ");
            };
        });

        // normalize float css property
        if ("cssFloat" in htmlEl.style) {
            getStyleHooks.float = function(style) {
                return style.cssFloat; 
            };
        } else {
            getStyleHooks.float = function(style) {
                return style.styleFloat; 
            };
        }

        _.forEach("fill-opacity font-weight line-height opacity orphans widows z-index zoom".split(" "), function(propName) {
            // Exclude the following css properties to add px
            setStyleHooks[propName] = function(name, value) {
                return name + ":" + value;
            };
        });

        /**
         * Get css style from element
         * @memberOf DOMElement.prototype
         * @param  {String} name property name
         * @return {String} property value
         */
        DOMElement.prototype.getStyle = function(name) {
            var style = this._node.style,
                hook, result;

            if (typeof name !== "string") {
                throw makeError("getStyle"); 
            }

            hook = getStyleHooks[name];

            result = hook ? hook(style) : style[name];

            if (!result) {
                style = getComputedStyle(this._node);

                result = hook ? hook(style) : style[name];
            }

            return result || "";
        };

        /**
         * Set css style for element
         * @memberOf DOMElement.prototype
         * @param {String} name  property name
         * @param {String} value property value
         * @return {DOMElement} reference to this
         */
        DOMElement.prototype.setStyle = function(name, value) {
            var nameType = typeof name,
                hook, cssText;

            if (nameType === "string") {
                hook = setStyleHooks[name];

                cssText = ";" + (hook ? hook(name, value) : name + ":" + (typeof value === "number" ? value + "px" : value));
            } else if (nameType === "object") {
                cssText = _.reduce(_.keys(name), function(cssText, key) {
                    value = name[key];
                    hook = setStyleHooks[key];

                    return cssText + ";" + (hook ? hook(key, value) : key + ":" + (typeof value === "number" ? value + "px" : value));
                }, "");
            } else {
                throw makeError("setStyle");
            }

            this._node.style.cssText += cssText;

            return this;
        };
    })();

    // DOMEvent
    // --------
    
    /**
     * Prototype for events in better-dom
     * @name DOMEvent
     * @constructor
     * @param event native event
     */
    function DOMEvent(event, currentTarget) {
        if (!(this instanceof DOMEvent)) {
            return event.__dom__ || ( event.__dom__ = new DOMEvent(event, currentTarget) );
        }

        this._event = event;

        if (!document.addEventListener) {
            this.target = DOMElement(event.srcElement);
            this.currentTarget = DOMElement(currentTarget);
            this.relatedTarget = DOMElement(event[( event.toElement === currentTarget ? "from" : "to" ) + "Element"]);
        }
    }

    DOMEvent.prototype = {
        /**
         * Read event property by name
         * @memberOf DOMEvent.prototype
         * @param  {String} name property name
         * @return {Object} property value
         */
        get: function(name) {
            if (typeof name !== "string" || name in DOMEvent.prototype) {
                throw makeError("get", "DOMEvent");
            }

            return this._event[name];
        }
    };

    (function() {
        var makeFuncMethod = function(name, legacyHandler) {
                return !document.addEventListener ? legacyHandler : function() {
                    this._event[name]();
                };
            },
            defineProperty = function(name) {
                Object.defineProperty(DOMEvent.prototype, name, {
                    enumerable: true,
                    get: function() {
                        return DOMElement(this._event[name]);
                    }
                });
            };

        /**
         * Prevent default event action
         * @memberOf DOMEvent.prototype
         * @function
         */
        DOMEvent.prototype.preventDefault = makeFuncMethod("preventDefault", function() {
            this._event.returnValue = false;
        });

        /**
         * Stop event propagation
         * @memberOf DOMEvent.prototype
         * @function
         */
        DOMEvent.prototype.stopPropagation = makeFuncMethod("stopPropagation", function() {
            this._event.cancelBubble = true;
        });

        /**
         * Check if default event handler is prevented
         * @memberOf DOMEvent.prototype
         * @return {Boolean} true, if default event handler is prevented
         */
        DOMEvent.prototype.isDefaultPrevented = function() {
            return this._event.defaultPrevented || this._event.returnValue === false;
        };

        if (document.addEventListener) {
            // in ie we will set these properties in constructor
            defineProperty("target");
            defineProperty("currentTarget");
            defineProperty("relatedTarget");
        }
    })();

    // DOMElementCollection
    // --------------------

    /**
     * Prototype for collection of elements in better-dom
     * @name DOMElementCollection
     * @constructor
     */
    function DOMElementCollection(elements) {
        this._nodes = _.map(elements || [], DOMElement);
        this.length = this._nodes.length;
    }

    DOMElementCollection.prototype = {
        /**
         * Execute callback for each element in collection
         * @memberOf DOMElementCollection.prototype
         * @param  {Function} callback action to execute
         * @return {DOMElementCollection} reference to this
         */
        each: function(callback) {
            _.forEach(this._nodes, callback, this);

            return this;
        }
    };

    (function() {
        function makeCollectionMethod(name) {
            var process = DOMElement.prototype[name];

            return function() {
                var args = _.slice(arguments);

                return this.each(function(elem) {
                    process.apply(elem, args);
                });
            };
        }

        /**
         * Shortcut to {@link DOMNode#on} method
         * @memberOf DOMElementCollection.prototype
         * @param  {String}   event    event type
         * @param  {String}   [selector] css selector to filter
         * @param  {Function} callback event handler
         * @return {DOMElementCollection} reference to this
         * @function
         * @see DOMElement#on
         */
        DOMElementCollection.prototype.on = makeCollectionMethod("on");

        /**
         * Shortcut to {@link DOMNode#off} method
         * @memberOf DOMElementCollection.prototype
         * @param  {String}   eventType event type
         * @param  {Function} [callback]  event handler
         * @return {DOMElementCollection} reference to this
         * @function
         * @see DOMElement#off
         */
        DOMElementCollection.prototype.off = makeCollectionMethod("off");

        /**
         * Shortcut to {@link DOMNode#fire} method
         * @memberOf DOMElementCollection.prototype
         * @param  {String} eventType type of event
         * @param  {Object} [detail] data to attach
         * @return {DOMElementCollection} reference to this
         * @function
         * @see DOMElement#fire
         */
        DOMElementCollection.prototype.fire = makeCollectionMethod("fire");

        /**
         * Shortcut to {@link DOMNode#setData} method
         * @memberOf DOMElementCollection.prototype
         * @param {String|Object} key data entry key | key/value pairs
         * @param {Object} value data to store
         * @return {DOMElementCollection} reference to this
         * @function
         * @see DOMElement#setData
         */
        DOMElementCollection.prototype.setData = makeCollectionMethod("setData");

        /**
         * Shortcut to {@link DOMElement#set} method
         * @memberOf DOMElementCollection.prototype
         * @param {String} name  property/attribute name
         * @param {String} value property/attribute value
         * @return {DOMElementCollection} reference to this
         * @function
         * @see DOMElement#set
         */
        DOMElementCollection.prototype.set = makeCollectionMethod("set");

        /**
         * Shortcut to {@link DOMElement#setStyle} method
         * @memberOf DOMElementCollection.prototype
         * @param {String} name  property name
         * @param {String} value property value
         * @return {DOMElementCollection} reference to this
         * @function
         * @see DOMElement#setStyle
         */
        DOMElementCollection.prototype.setStyle = makeCollectionMethod("setStyle");

        /**
         * Shortcut to {@link DOMElement#addClass} method
         * @memberOf DOMElementCollection
         * @param {String} classNames space-separated class name(s)
         * @return {DOMElementCollection} reference to this
         * @function
         * @see DOMElement#addClass
         */
        DOMElementCollection.prototype.addClass = makeCollectionMethod("addClass");

        /**
         * Shortcut to {@link DOMElement#removeClass} method
         * @memberOf DOMElementCollection.prototype
         * @param {String} classNames space-separated class name(s)
         * @return {DOMElementCollection} reference to this
         * @function
         * @see DOMElement#removeClass
         */
        DOMElementCollection.prototype.removeClass = makeCollectionMethod("removeClass");

        /**
         * Shortcut to {@link DOMElement#toggleClass} method
         * @memberOf DOMElementCollection.prototype
         * @param {String} classNames space-separated class name(s)
         * @return {DOMElementCollection} reference to this
         * @function
         * @see DOMElement#toggleClass
         */
        DOMElementCollection.prototype.toggleClass = makeCollectionMethod("toggleClass");
    })();

    // Mock Element
    // ------------

    function MockElement() {
        DOMNode.call(this, null);
    }

    MockElement.prototype = new DOMElement();

    _.forIn(DOMElement.prototype, function(functor, key) {
        var isSetter = key in DOMElementCollection.prototype;

        MockElement.prototype[key] = isSetter ? function() { return this; } : function() { };
    });

    _.forEach("next prev find firstChild lastChild".split(" "), function(key) {
        MockElement.prototype[key] = function() { return new MockElement(); };
    });

    _.forEach("nextAll prevAll children findAll".split(" "), function(key) {
        MockElement.prototype[key] = function() { return new DOMElementCollection(); };
    });

    /**
     * @private
     * @constructor
     */
    var SelectorMatcher = (function() {
        // Quick matching inspired by
        // https://github.com/jquery/jquery
        var rquickIs = /^(\w*)(?:#([\w\-]+))?(?:\[([\w\-]+)\])?(?:\.([\w\-]+))?$/,
            ctor =  function(selector) {
                if (this instanceof SelectorMatcher) {
                    this.selector = selector;

                    var quick = rquickIs.exec(selector);
                    // TODO: support attribute value check
                    if (this.quick = quick) {
                        //   0  1    2   3          4
                        // [ _, tag, id, attribute, class ]
                        if (quick[1]) quick[1] = quick[1].toLowerCase();
                        if (quick[4]) quick[4] = " " + quick[4] + " ";
                    }    
                } else {
                    return selector ? new SelectorMatcher(selector) : null;
                }                
            },
            matchesProp = _.reduce("m oM msM mozM webkitM".split(" "), function(result, prefix) {
                var propertyName = prefix + "atchesSelector";

                return result || htmlEl[propertyName] && propertyName;
            }, null),
            matches = function(el, selector) {
                var nodeList = document.querySelectorAll(selector);

                for (var i = 0, n = nodeList.length; i < n; ++i) {
                    if (nodeList[i] === el) return true;
                }

                return false; 
            };

        ctor.prototype = {
            test: function(el) {
                if (this.quick) {
                    return (
                        (!this.quick[1] || el.nodeName.toLowerCase() === this.quick[1]) &&
                        (!this.quick[2] || el.id === this.quick[2]) &&
                        (!this.quick[3] || el.hasAttribute(this.quick[3])) &&
                        (!this.quick[4] || !!~((" " + el.className  + " ").indexOf(this.quick[4])))
                    );
                }

                return matchesProp ? el[matchesProp](this.selector) : matches(el, this.selector);
            }
        };

        return ctor;
    })();

    // finish prototypes
    
    // fix constructor property
    _.forEach([DOMNode, DOMElement, DOMEvent, MockElement], function(ctr) {
        ctr.prototype.constructor = ctr;
    });

    /**
     * Global object to access DOM. Contains all methods of the {@link DOMNode}
     * @namespace DOM
     */
    var DOM = new DOMNode(document), extensions = {};

    /**
     * Create DOMElement instance
     * @memberOf DOM
     * @param  {String|Element} content native element, element name or html string
     * @return {DOMElemen} element
     */
    DOM.create = function(content) {
        var elem = content;

        if (typeof content === "string") {
            if (content[0] === "<") {
                elem = _.parseFragment(content).firstChild;

                while (elem.nodeType !== 1) elem = elem.nextSibling;
            } else {
                elem = _.createElement(content);
            }
        } else if (!(content instanceof Element)) {
            throw makeError("create", "DOM");
        }

        return DOMElement(elem);
    };

    /**
     * Register callback on dom ready
     * @memberOf DOM
     * @param {Function} callback event handler
     */
    DOM.ready = function() {
        var readyCallbacks = [],
            scrollIntervalId,
            safeExecution = function(callback) {
                // wrap callback with setTimeout to protect from unexpected exceptions
                setTimeout(callback, 0);
            },
            pageLoaded = function() {
                if (scrollIntervalId) {
                    clearInterval(scrollIntervalId);
                }

                if (readyCallbacks) {
                    // trigger callbacks
                    _.forEach(readyCallbacks, safeExecution);
                    // cleanup
                    readyCallbacks = null;
                }
            };

        // https://raw.github.com/requirejs/domReady/latest/domReady.js
        
        if (document.addEventListener) {
            document.addEventListener("DOMContentLoaded", pageLoaded, false);
            window.addEventListener("load", pageLoaded, false);
        } else {
            window.attachEvent("onload", pageLoaded);

            (function() {
                var testDiv = document.createElement("div"), 
                    isTop;
                
                try {
                    isTop = window.frameElement === null;
                } catch (e) {}

                //DOMContentLoaded approximation that uses a doScroll, as found by
                //Diego Perini: http://javascript.nwbox.com/IEContentLoaded/,
                //but modified by other contributors, including jdalton
                if (testDiv.doScroll && isTop && window.external) {
                    scrollIntervalId = setInterval(function () {
                        try {
                            testDiv.doScroll();
                            pageLoaded();
                        } catch (e) {}
                    }, 30);
                }
            })();
        }

        // Catch cases where ready is called after the browser event has already occurred.
        // IE10 and lower don't handle "interactive" properly... use a weak inference to detect it
        // discovered by ChrisS here: http://bugs.jquery.com/ticket/12282#comment:15
        if ( document.attachEvent ? document.readyState === "complete" : document.readyState !== "loading") {
            pageLoaded();
        }

        // return implementation
        return function(callback) {
            if (typeof callback !== "function") {
                throw makeError("ready", "DOM");
            }

            if (readyCallbacks) {
                readyCallbacks.push(callback);
            } else {
                safeExecution(callback);
            }
        };
    }();

    /**
     * Import css styles on page
     * @memberOf DOM
     * @param {String|Object} selector css selector or object with selector/rules pairs
     * @param {String} styles css rules
     */
    DOM.importStyles = function() {
        var styleSheet = (function() {
                var headEl = scripts[0].parentNode;

                headEl.insertBefore(_.createElement("style"), headEl.firstChild);

                return document.styleSheets[0];
            })(),
            obj = {_node: {style: {cssText: ""}}};

        return function(selector, styles) {
            if (typeof styles === "object") {
                DOMElement.prototype.setStyle.call(obj, styles);

                styles = obj._node.style.cssText.substr(1); // remove leading comma
            }

            if (typeof selector !== "string" || typeof styles !== "string") {
                throw makeError("importStyles", "DOM");
            }

            if (styleSheet.cssRules) {
                // w3c browser
                styleSheet.insertRule(selector + " {" + styles + "}", styleSheet.cssRules.length);
            } else {
                // ie doesn't support multiple selectors in addRule 
                _.forEach(selector.split(","), function(selector) {
                    styleSheet.addRule(selector, styles);
                });
            }
        };
    }();

    /**
     * Execute callback when element with specified selector matches
     * @memberOf DOM
     * @param {String} selector css selector
     * @param {Fuction} callback event handler
     */
    DOM.watch = function() {
        DOM._watchers = {};

        if (htmlEl.addBehavior) {
            var behaviorUrl = scripts[scripts.length - 1].getAttribute("data-htc");

            return function(selector, callback) {
                var entry = DOM._watchers[selector];

                if (entry) {
                    entry.push(callback);
                    // need to call the callback manually for each element 
                    // because behaviour is already attached to the DOM
                    DOM.findAll(selector).each(callback);
                } else {
                    DOM._watchers[selector] = [callback];
                    // append style rule at the last step
                    DOM.importStyles(selector, { behavior: "url(" + behaviorUrl + ")" });
                }
            };
        } else {
            // use trick discovered by Daniel Buchner: 
            // https://github.com/csuwldcat/SelectorListener
            var startNames = ["animationstart", "oAnimationStart", "webkitAnimationStart"],
                computed = getComputedStyle(htmlEl),
                cssPrefix = window.CSSKeyframesRule ? "" : (_.slice(computed).join("").match(/-(moz|webkit|ms)-/) || (computed.OLink === "" && ["-o-"]))[0];

            return function(selector, callback) {
                var animationName = "DOM" + new Date().getTime(),
                    allAnimationNames = DOM._watchers[selector] || animationName;

                DOM.importStyles(
                    "@" + cssPrefix + "keyframes " + animationName,
                    "from { clip: rect(1px, auto, auto, auto) } to { clip: rect(0px, auto, auto, auto) }"
                );

                // use comma separated animation names in case of multiple
                if (allAnimationNames !== animationName) allAnimationNames += "," + animationName;

                DOM.importStyles(
                    selector,
                    cssPrefix + "animation-duration:0.001s;" + cssPrefix + "animation-name:" + allAnimationNames + " !important"
                );

                _.forEach(startNames, function(name) {
                    document.addEventListener(name, function(e) {
                        var el = e.target;

                        if (e.animationName === animationName) {
                            callback(DOMElement(el));
                        }
                    }, false);
                });

                DOM._watchers[selector] = allAnimationNames;
            };
        }
    }();

    /**
     * Extend DOM with custom widget. Templates support limited edition of emmet-like 
     * syntax - see html section in http://docs.emmet.io/cheat-sheet/
     * @memberOf DOM
     * @param  {String} selector extension css selector
     * @param  {{after: String, before: String, append: String, prepend: String}} [template] extension templates
     * @param  {Object} mixins extension mixins
     * @example
     * // simple example
     * DOM.extend(".myplugin", {
     *     append: "&#60;span&#62;myplugin text&#60;/span&#62;"
     * }, {
     *     constructor: function() {
     *         // initialize extension
     *     }
     * });
     *
     * // emmet-like syntax example
     * DOM.extend(".mycalendar", {
     *     after: "table>(tr>th*7)+(tr>td*7)*6"
     * }, {
     *     constructor: function() {
     *         // initialize extension
     *     },
     *     method1: function() {
     *         // this method will be mixed into every instance
     *     },
     *     method2: function() {
     *         // this method will be mixed into evety instance
     *     }
     * });
     */
    DOM.extend = function(selector, template, mixins) {
        if (mixins === undefined) {
            mixins = template;
            template = undefined;
        }

        if (typeof mixins === "function") {
            mixins = {constructor: mixins};
        }

        if (!mixins || typeof mixins !== "object") {
            throw makeError("extend", "DOM");
        }

        if (template) {
            _.forOwn(template, function(key) {
                var tpl = template[key];

                if (tpl[0] !== "<") {
                    tpl = _.parseTemplate(tpl);
                } else {
                    tpl = _.parseFragment(tpl);
                }

                template[key] = tpl;
            });
        }

        extensions[selector] = mixins;

        DOM.watch(selector, function(el) {
            if (el._extends[selector]) return;

            if (template) {
                _.forOwn(template, function(key) {
                    if (key !== "constructor") {
                        el[key](_.cloneNode(template[key]));    
                    }
                });
            }

            _.mixin(el, mixins);

            if (mixins.hasOwnProperty("constructor")) {
                mixins.constructor.call(el);
            }

            el._extends[selector] = true;
        });
    };

    /**
     * Return an {@link DOMElement} mock specified for optional selector
     * @memberOf DOM
     * @param  {String} [selector] selector of mock
     * @return {DOMElement} mock instance
     */
    DOM.mock = function(selector) {
        var el = DOMElement(), mixins;

        if (selector) {
            mixins = extensions[selector];

            _.mixin(el, mixins);

            if (mixins.hasOwnProperty("constructor")) {
                el.constructor = MockElement;

                mixins.constructor.call(el);
            }
        }

        return el;
    };

    if (!supports("hidden", "a")) {
        // corrects block display not defined in IE8/9
        DOM.importStyles("article,aside,figcaption,figure,footer,header,hgroup,main,nav,section", "display:block");
        // adds styling not present in IE6/7/8/9
        DOM.importStyles("mark", "background:#FF0;color:#000");
        // hides non-rendered elements
        DOM.importStyles("template,[hidden]", "display:none");
    }

    // REGISTER GLOBALS
    
    window.DOM = DOM;

})(window, document, (function(undefined) {
    "use strict";

    // UTILITES
    // --------

    var _ = {
        
            // Collection utilites
            
            slice: function(list, index) {
                return Array.prototype.slice.call(list, index || 0);
            },
            forEach: function(list, callback, thisPtr) {
                for (var i = 0, n = list ? list.length : 0; i < n; ++i) {
                    callback.call(thisPtr, list[i], i, list);
                }
            },
            filter: function(list, testFn, thisPtr) {
                var result = [];

                _.forEach(list, function(el, index) {
                    if (testFn.call(thisPtr, el, index, list)) result.push(el);
                });

                return result;
            },
            every: function(list, testFn, thisPtr) {
                var result = true;

                _.forEach(list, function(el) {
                    result = result && testFn.call(thisPtr, el, list);
                });

                return result;
            },
            some: function(list, testFn, thisPtr) {
                for (var i = 0, n = list ? list.length : 0; i < n; ++i) {
                    if (testFn.call(thisPtr, list[i], i, list) === true) {
                        return true;
                    }
                }

                return false;
            },
            reduce: function(list, callback, result) {
                _.forEach(list, function(el, index) {
                    if (!index && result === undefined) {
                        result = el;
                    } else {
                        result = callback(result, el, index, list);
                    }
                });

                return result;
            },
            map: function(list, callback, thisPtr) {
                var result = [];

                _.forEach(list, function(el, index) {
                    result.push(callback.call(thisPtr, el, index, list));
                });

                return result;
            },
            times: function(n, callback, thisArg) {
                for (var i = 0; i < n; ++i) {
                    callback.call(thisArg, i);
                }
            },

            // Object utilites

            keys: Object.keys || function(obj) {
                var objType = typeof obj,
                    result = [], 
                    prop;

                if (objType !== "object" && objType !== "function" || obj === null) {
                    throw new TypeError("Object.keys called on non-object");
                }
         
                for (prop in obj) {
                    if (Object.prototype.hasOwnProperty.call(obj, prop)) result.push(prop);
                }

                return result;
            },
            forOwn: function(obj, callback, thisPtr) {
                for (var list = this.keys(obj), i = 0, n = list.length; i < n; ++i) {
                    callback.call(thisPtr, list[i], i, obj);
                }
            },
            forIn: function(obj, callback, thisPtr) {
                for (var key in obj) {
                    callback.call(thisPtr, obj[key], key, obj);
                }
            },
            mixin: function(obj, name, value) {
                if (arguments.length === 3) {
                    obj[name] = value;
                } else if (name) {
                    _.forOwn(name, function(key) {
                        _.mixin(obj, key, name[key]);
                    });
                }

                return obj; 
            }
        },
        parser = document.createElement("body"),
        operators = { // operatorName / operatorPriority object
            "(": 0,
            ")": 1,
            ">": 2,
            "+": 3,
            "*": 4,
            "#": 5,
            ".": 5,
            "[": 5,
            "]": 5
        },
        rindex = /\$/g,
        rattr = /[\w\-_]+(=[^\s'"]+|='[^']+.|="[^"]+.)?/g,
        modifyAttr = function(attr) {
            if (attr.specified) {
                // changing attribute name doesn't work in IE
                // attr.name = attr.name.replace(rindex, this);
                if (attr.value) attr.value = attr.value.replace(rindex, this);
            }
        },
        parseAttrs = function(str) {
            var attrParts = str.split("="),
                key = attrParts[0],
                value = attrParts[1];

            this.setAttribute(key, _.unquote(value));
        },
        createElement, cloneNode, createFragment;

    if (document.addEventListener) {
        createElement = function(tagName) {
            return document.createElement(tagName);
        };
        cloneNode = function(node) {
            return node.cloneNode(true);
        };
        createFragment = function() {
            return document.createDocumentFragment();
        };
    } else {
        // Add html5 elements support via:
        // https://github.com/aFarkas/html5shiv
        (function(){
            var elements = "abbr article aside audio bdi canvas data datalist details figcaption figure footer header hgroup main mark meter nav output progress section summary template time video",
                // Used to skip problem elements
                reSkip = /^<|^(?:button|map|select|textarea|object|iframe|option|optgroup)$/i,
                // Not all elements can be cloned in IE
                saveClones = /^(?:a|b|code|div|fieldset|h1|h2|h3|h4|h5|h6|i|label|li|ol|p|q|span|strong|style|table|tbody|td|th|tr|ul)$/i,
                create = document.createElement,
                frag = document.createDocumentFragment(),
                cache = {};

            frag.appendChild(parser);

            createElement = function(nodeName) {
                var node;

                if (cache[nodeName]) {
                    node = cache[nodeName].cloneNode();
                } else if (saveClones.test(nodeName)) {
                    node = (cache[nodeName] = create(nodeName)).cloneNode();
                } else {
                    node = create(nodeName);
                }

                return node.canHaveChildren && !reSkip.test(nodeName) ? frag.appendChild(node) : node;
            };

            createFragment = Function("f", "return function(){" +
                "var n=f.cloneNode(),c=n.createElement;" +
                "(" +
                    // unroll the `createElement` calls
                    elements.split(" ").join().replace(/\w+/g, function(nodeName) {
                        create(nodeName);
                        frag.createElement(nodeName);
                        return "c('" + nodeName + "')";
                    }) +
                ");return n}"
            )(frag);

            // IE<=8 does not properly clone detached, unknown element nodes
            cloneNode = function(node) {
                if (node.nodeType === 1) {
                    parser.innerHTML = node.outerHTML;
                    return parser.firstChild;    
                } else if (node.nodeType === 11) {
                    var result = "", el;

                    for (el = node.firstChild; el; el = el.nextSibling) {
                        result += el.outerHTML;
                    }

                    return _.parseFragment(result);
                }

                return node.cloneNode(true);
            };
        })();
    }

    return _.mixin(_, {

        // String utilites

        trim: function() {
            if (String.prototype.trim) {
                return function(str) {
                    return str.trim();
                };
            } else {
                var rwsleft = /^\s\s*/,
                    rwsright = /\s\s*$/;

                return function(str) {
                    return str.replace(rwsleft, "").replace(rwsright, "");
                };
            }
        }(),

        unquote: function() {
            var rquotes = /^["']|["']$/g;

            return function(str) {
                return str ? str.replace(rquotes, "") : "";
            };
        }(),

        // DOM utilites

        createElement: createElement,
        cloneNode: cloneNode,
        parseFragment: function(html) {
            var fragment = createFragment();

            // fix NoScope bug
            parser.innerHTML = "<br/>" + html;
            parser.removeChild(parser.firstChild);

            while (parser.firstChild) {
                fragment.appendChild(parser.firstChild);
            }

            return fragment;
        },
        parseTemplate: function(expr) {
            // use emmet-like syntax to describe html templates:
            // http://docs.emmet.io/cheat-sheet/

            var stack = [],
                output = [],
                term = "";

            // parse exrpression into RPN
        
            _.forEach(expr, function(str) {
                var top = stack[0], priority;

                if (str in operators && (top !== "[" || str === "]")) {
                    if (top === "." && str === ".") {
                        term += " "; // concat .c1.c2 into single space separated class string

                        return;
                    }

                    if (term) {
                        output.push(term);
                        term = "";
                    }

                    if (str === "(") {
                        stack.unshift(str);
                    } else {
                        priority = operators[str];
                        if (str === ">") ++priority; // nested ">" should have higher priority
                        while (operators[stack[0]] >= priority) {
                            output.push(stack.shift());
                        }

                        if (str === ")") {
                            stack.shift(); // remove "(" symbol from stack
                        } else if (str !== "]") { // don't need to have "]" in stack
                            stack.unshift(str); 
                        }
                    }
                } else {
                    term += str;
                }
            });

            if (term) stack.unshift(term);

            output.push.apply(output, stack);

            stack = [];

            // transform RPN into html nodes

            _.forEach(output, function(str) {
                var term, node, proto;

                if (str in operators) {
                    term = stack.shift();
                    node = stack.shift() || "div";

                    if (typeof node === "string") {
                        createFragment().appendChild( node = createElement(node) );
                    }

                    switch(str) {
                    case ".":
                        node.className = term;
                        break;

                    case "#":
                        node.id = term;
                        break;

                    case "[":
                        _.forEach(term.match(rattr), parseAttrs, node);
                        break;

                    case "+":
                        node = node.parentNode || node;
                        /* falls through */
                    case ">":
                        if (typeof term === "string") {
                            term = createElement(term);
                        }

                        if (!node.parentNode && str === ">") {
                            _.forEach(node.childNodes, function(child) {
                                child.appendChild(cloneNode(term));
                            });
                        } else {
                            node.appendChild(term);
                        }
                        break;

                    case "*":
                        proto = node.parentNode || node;
                        node = createFragment();

                        _.times(parseInt(term, 10), function(i) {
                            node.appendChild(cloneNode(proto));

                            _.forEach(node.childNodes, function(child) {
                                _.forEach(child.attributes, modifyAttr, i + 1);
                            });
                        });
                        break;
                    }

                    str = node;
                }

                stack.unshift(str);
            });

            for (output = stack[0]; output.parentNode; output = output.parentNode);

            return output;
        }
    }); 
})());
