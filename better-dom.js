/**
 * @file better-dom
 * @version 1.0.0-beta.1
 * @overview Making DOM to be nice
 * @copyright Maksim Chemerisuk 2013
 * @license MIT
 * @see https://github.com/chemerisuk/better-dom
 */
(function(window, document, undefined) {
    "use strict";

    if (document.__dom__) return; // prevent double initialization
    
    // HELPERS
    // -------

    // jshint unused:false
    var _uniqueId = (function() {
            var idCounter = 0;

            return function(prefix) {
                var id = ++idCounter;
                return String(prefix || "") + id;
            };
        })(),
        _defer = function(callback) {
            return setTimeout(callback, 0);
        },
        _makeError = function(method, el) {
            var type;

            if (el instanceof DOMNode) {
                type = "DOMNode";
            } else if (el instanceof DOMElement) {
                type = "DOMElement";
            } else if (el instanceof DOMCollection) {
                type = "DOMCollection";
            } else {
                type = "DOM";
            }

            return "Error: " + type + "." + method + " was called with illegal arguments. Check http://chemerisuk.github.io/better-dom/" + type + ".html#" + method + " to verify the function call";
        },

        // COLLECTION UTILS
        // ----------------
        
        makeCollectionMethod = (function(){
            var tpl = "", args = {
                    BEFORE: "",
                    COUNT:  "a ? a.length : 0",
                    BODY:   "",
                    AFTER:  ""
                };

            tpl += "%BEFORE%";
            tpl += "\nfor (var i = 0, n = %COUNT%; i < n; ++i) {";
            tpl += "%BODY%";
            tpl += "}%AFTER%";

            return function(options) {
                var code = tpl, key;

                for (key in args) {
                    code = code.replace("%" + key + "%", options[key] || args[key]);
                }

                return Function("a", "cb", "that", "undefined", code);
            };
        })(),
        _forEach = makeCollectionMethod({
            BODY:   "cb.call(that, a[i], i, a)"
        }),
        _times = makeCollectionMethod({
            COUNT:  "a",
            BODY:   "cb.call(that, i)"
        }),
        _map = makeCollectionMethod({
            BEFORE: "var out = []",
            BODY:   "out.push(cb.call(that, a[i], i, a))",
            AFTER:  "return out"
        }),
        _some = makeCollectionMethod({
            BODY:   "if (cb.call(that, a[i], i, a) === true) return true",
            AFTER:  "return false"
        }),
        _filter = makeCollectionMethod({
            BEFORE: "var out = []",
            BODY:   "if (cb.call(that, a[i], i, a)) out.push(a[i])",
            AFTER:  "return out"
        }),
        _foldl = makeCollectionMethod({
            BODY:   "that = !i && that === undefined ? a[i] : cb(that, a[i], i, a)",
            AFTER:  "return that"
        }),
        _slice = function(list, index) {
            return Array.prototype.slice.call(list, index || 0);
        },
        _isArray = Array.isArray || function(obj) {
            return Object.prototype.toString.call(obj) === "[object Array]";
        },

        // OBJECT UTILS
        // ------------
        
        _forOwn = function(obj, callback, thisPtr) {
            for (var prop in obj) {
                if (Object.prototype.hasOwnProperty.call(obj, prop)) callback.call(thisPtr, obj[prop], prop, obj);
            }
        },
        _forIn = function(obj, callback, thisPtr) {
            for (var prop in obj) {
                callback.call(thisPtr, obj[prop], prop, obj);
            }
        },
        _keys = Object.keys || (function() {
            var collectKeys = function(value, key) { this.push(key); };

            return function(obj) {
                var result = [];

                _forOwn(obj, collectKeys, result);

                return result;
            };
        }()),
        _extend = function(obj, name, value) {
            if (arguments.length === 3) {
                obj[name] = value;
            } else if (name) {
                _forOwn(name, function(value, key) {
                    obj[key] = value;
                });
            }

            return obj;
        },

        // DOM UTILS
        // ---------

        _getComputedStyle = function(el) {
            return window.getComputedStyle ? window.getComputedStyle(el) : el.currentStyle;
        },
        _createElement = function(tagName) {
            return document.createElement(tagName);
        },
        _createFragment = function() {
            return document.createDocumentFragment();
        },
        _parseFragment = (function() {
            var parser = document.createElement("body");

            if (!document.addEventListener) {
                // Add html5 elements support via:
                // https://github.com/aFarkas/html5shiv
                (function(){
                    var elements = "abbr article aside audio bdi canvas data datalist details figcaption figure footer header hgroup main mark meter nav output progress section summary template time video",
                        // Used to skip problem elements
                        reSkip = /^<|^(?:button|map|select|textarea|object|iframe|option|optgroup)$/i,
                        // Not all elements can be cloned in IE
                        saveClones = /^(?:a|b|code|div|fieldset|h1|h2|h3|h4|h5|h6|i|label|li|ol|p|q|span|strong|style|table|tbody|td|th|tr|ul)$/i,
                        create = document.createElement,
                        frag = _createFragment(),
                        cache = {};

                    frag.appendChild(parser);

                    _createElement = function(nodeName) {
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

                    _createFragment = Function("f", "return function(){" +
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
                })();
            }

            return function(html) {
                var fragment = _createFragment();

                // fix NoScope bug
                parser.innerHTML = "<br/>" + html;
                parser.removeChild(parser.firstChild);

                while (parser.firstChild) {
                    fragment.appendChild(parser.firstChild);
                }

                return fragment;
            };
        })();

    // DOM NODE
    // --------

    /**
     * Prototype for a DOM node
     * @name DOMNode
     * @param node native object
     * @constructor
     * @private
     */
    function DOMNode(node) {
        this._node = node;
        this._data = {};
        this._listeners = [];

        if (node) node.__dom__ = this;
    }

    DOMNode.prototype = { };

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
    DOMNode.prototype.supports = function(prop, tagName) {
        tagName = tagName || this && this._node.nodeName.toLowerCase();

        var el = tagName ? _createElement(tagName) : document,
            isSupported = prop in el;

        if (!isSupported && !prop.indexOf("on")) {
            // http://perfectionkills.com/detecting-event-support-without-browser-sniffing/
            el.setAttribute(prop, "return;");

            isSupported = typeof el[prop] === "function";
        }
            
        return isSupported;
    };

    // SEARCH BY QUERY
    // ---------------

    (function() {
        // big part of code inspired by Sizzle:
        // https://github.com/jquery/sizzle/blob/master/sizzle.js

        // TODO: disallow to use buggy selectors?
        var rquickExpr = /^(?:#([\w\-]+)|(\w+)|\.([\w\-]+))$/,
            rsibling = /[\x20\t\r\n\f]*[+~>]/,
            rescape = /'|\\/g,
            tmpId = _uniqueId("DOM");

        if (!document.getElementsByClassName) {
            // exclude getElementsByClassName from pattern
            rquickExpr = /^(?:#([\w\-]+)|(\w+))$/;
        }
        
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
        DOMNode.prototype.find = function(selector, /*INTERNAL*/multiple) {
            if (typeof selector !== "string") {
                throw _makeError("find", this);
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

            return multiple ? new DOMCollection(elements) : DOMElement(elements);
        };

        /**
         * Finds all elements by selector
         * @memberOf DOMNode.prototype
         * @param  {String} selector css selector
         * @return {DOMCollection} elements collection
         */
        DOMNode.prototype.findAll = function(selector) {
            return this.find(selector, true);
        };
    })();

    // INTERNAL DATA
    // -------------

    (function() {
        var processObjectParam = function(value, name) { this.setData(name, value); };

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
        DOMNode.prototype.getData = function(key) {
            if (typeof key !== "string") {
                throw _makeError("getData", this);
            }

            var node = this._node,
                result = this._data[key];

            if (result === undefined && node.hasAttribute("data-" + key)) {
                result = this._data[key] = node.getAttribute("data-" + key);
            }

            return result;
        };

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
        DOMNode.prototype.setData = function(key, value) {
            var keyType = typeof key;

            if (keyType === "string") {
                this._data[key] = value;
            } else if (keyType === "object") {
                _forOwn(key, processObjectParam, this);
            } else {
                throw _makeError("setData", this);
            }

            return this;
        };
    })();

    // CONTAINS ELEMENT/COLLECTION
    // ---------------------------

    (function() {
        var containsElement;

        if (document.documentElement.contains) {
            containsElement = function(parent, child) {
                return parent.contains(child);
            };
        } else {
            containsElement = function(parent, child) {
                return !!(parent.compareDocumentPosition(child) & 16);
            };
        }
        
        /**
         * Check if element is inside of context
         * @memberOf DOMNode.prototype
         * @param  {DOMElement} element element to check
         * @return {Boolean} true if success
         * @example
         * DOM.find("html").contains(DOM.find("body"));
         * // returns true
         */
        DOMNode.prototype.contains = function(element, /*INTERNAL*/reverse) {
            var node = this._node, result = true;

            if (element.nodeType === 1) {
                result = containsElement(reverse ? element : node, reverse ? node : element);
            } else if (element instanceof DOMElement) {
                result = element.contains(node, true);
            } else if (element instanceof DOMCollection) {
                _forEach(element, function(element) {
                    result = result && element.contains(node, true);
                });
            } else {
                throw _makeError("contains", this);
            }

            return result;
        };
    })();

    // DOM EVENTS
    // ----------

    (function() {
        var eventHooks = {},
            veto = false,
            processObjectParam = function(value, name) { this.on(name, value); },
            createEventHandler = function(type, selector, options, callback, extras, context, thisArg) {
                var currentTarget = thisArg._node,
                    matcher = SelectorMatcher(selector),
                    defaultEventHandler = function(e) {
                        if (veto !== type) {
                            var eventHelper = new EventHelper(e || window.event, currentTarget),
                                fn = typeof callback === "string" ? context[callback] : callback,
                                args;

                            // handle modifiers
                            if (options.cancel) eventHelper.preventDefault();
                            if (options.stop) eventHelper.stopPropagation();

                            // populate extra event arguments
                            if (options.args) {
                                args = _map(options.args, eventHelper.get, eventHelper);
                                
                                if (extras) args.push.apply(args, extras);
                            } else {
                                args = extras ? extras.slice(0) : [];
                            }

                            if (fn) fn.apply(context, args);
                        }
                    };

                return !selector ? defaultEventHandler : function(e) {
                    var el = window.event ? window.event.srcElement : e.target;

                    for (; el && el !== currentTarget; el = el.parentNode) {
                        if (matcher.test(el)) {
                            defaultEventHandler(e);

                            break;
                        }
                    }
                };
            },
            createCustomEventHandler = function(originalHandler, type) {
                var handler = function() {
                        if (window.event._type === type) originalHandler();
                    };

                handler.type = originalHandler.type;
                handler._type = "dataavailable";
                handler.callback = originalHandler.callback;

                return handler;
            };

        /**
         * Bind a DOM event to the context
         * @memberOf DOMNode.prototype
         * @param  {String}   type event type
         * @param  {Object}   [options] callback options
         * @param  {Function|String} callback event callback
         * @param  {Array}    [args] extra arguments
         * @param  {Object}   [context] callback context
         * @return {DOMNode}  current context
         */
        DOMNode.prototype.on = function(type, options, callback, args, context) {
            var eventType = typeof type,
                hook, handler, selector;

            if (eventType === "string") {
                if (typeof options !== "object") {
                    context = args;
                    args = callback;
                    callback = options;
                    options = {};
                }

                if (!_isArray(args)) {
                    context = args;
                    args = null;
                }

                selector = type.substr(type.indexOf(" ") + 1);

                if (selector === type) {
                    selector = undefined;
                } else {
                    type = type.substr(0, type.length - selector.length - 1);
                }
                
                handler = createEventHandler(type, selector, options, callback, args || [], context || this, this);
                handler.type = selector ? type + " " + selector : type;
                handler.callback = callback;
                handler.context = context;

                if (hook = eventHooks[type]) hook(handler);

                if (document.addEventListener) {
                    this._node.addEventListener(handler._type || type, handler, !!handler.capturing);
                } else {
                    // handle custom events for IE8
                    if (~type.indexOf(":") || handler.custom) handler = createCustomEventHandler(handler, type);

                    this._node.attachEvent("on" + (handler._type || type), handler);
                }
                // store event entry
                this._listeners.push(handler);
            } else if (eventType === "object") {
                _forOwn(type, processObjectParam, this);
            } else {
                throw _makeError("on", this);
            }

            return this;
        };

        /**
         * Unbind a DOM event from the context
         * @memberOf DOMNode.prototype
         * @param  {String}   type event type
         * @param  {Object}   [context] callback context
         * @param  {Function} [callback] event handler
         * @return {DOMNode} current context
         */
        DOMNode.prototype.off = function(type, context, callback) {
            if (typeof type !== "string") {
                throw _makeError("off", this);
            }

            if (callback === undefined) {
                callback = context;
                context = undefined;
            }

            _forEach(this._listeners, function(handler, index, events) {
                var node = this._node;

                if (handler && type === handler.type && (!context || context === handler.context) && (!callback || callback === handler.callback)) {
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
                throw _makeError("fire", this);
            }

            var node = this._node,
                isCustomEvent = ~type.indexOf(":"),
                hook = eventHooks[type],
                canContinue, event, handler = {};

            if (hook) hook(handler);

            if (document.dispatchEvent) {
                event = document.createEvent(isCustomEvent ? "CustomEvent" : "Event");

                if (isCustomEvent) {
                    event.initCustomEvent(handler._type || type, true, false, detail);
                } else {
                    event.initEvent(handler._type || type, true, true);
                }

                canContinue = node.dispatchEvent(event);
            } else {
                event = document.createEventObject();

                isCustomEvent = isCustomEvent || handler.custom;

                if (isCustomEvent) {
                    // use private attribute to store custom event name
                    event._type = type;
                    event.detail = detail;
                }

                node.fireEvent("on" + (isCustomEvent ? "dataavailable" : handler._type || type), event);

                canContinue = event.returnValue !== false;
            }

            // Call a native DOM method on the target with the same name as the event
            // IE<9 dies on focus/blur to hidden element
            if (canContinue && node[type] && (type !== "focus" && type !== "blur" || node.offsetWidth)) {
                // Prevent re-triggering of the same event
                veto = type;
                
                node[type]();

                veto = false;
            }

            return this;
        };

        // firefox doesn't support focusin/focusout events
        if (DOMNode.prototype.supports("onfocusin", "input")) {
            _forOwn({focus: "focusin", blur: "focusout"}, function(value, prop) {
                eventHooks[prop] = function(handler) { handler._type = value; };
            });
        } else {
            eventHooks.focus = eventHooks.blur = function(handler) {
                handler.capturing = true;
            };
        }

        if (DOMNode.prototype.supports("oninvalid", "input")) {
            eventHooks.invalid = function(handler) {
                handler.capturing = true;
            };
        }

        if (!document.addEventListener) {
            // input event fix via propertychange
            document.attachEvent("onfocusin", (function() {
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
            })());

            // submit event bubbling fix
            document.attachEvent("onkeydown", function() {
                var target = window.event.srcElement,
                    form = target.form;

                if (form && target.type !== "textarea" && window.event.keyCode === 13) {
                    DOMElement(form).fire("submit");

                    return false;
                }
            });

            document.attachEvent("onclick", (function() {
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
            })());

            eventHooks.submit = eventHooks.input = function(handler) {
                handler.custom = true;
            };
        }
    }());

    /**
     * Helper for css selectors
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
            matchesProp = _foldl("m oM msM mozM webkitM".split(" "), function(result, prefix) {
                var propertyName = prefix + "atchesSelector";

                return result || document.documentElement[propertyName] && propertyName;
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
                        (!this.quick[1] || (el.nodeName || "").toLowerCase() === this.quick[1]) &&
                        (!this.quick[2] || el.id === this.quick[2]) &&
                        (!this.quick[3] || el.hasAttribute(this.quick[3])) &&
                        (!this.quick[4] || !!~((" " + (el.className || "") + " ").indexOf(this.quick[4])))
                    );
                }

                return matchesProp ? el[matchesProp](this.selector) : matches(el, this.selector);
            }
        };

        return ctor;
    })();

    
    // DOM ELEMENT
    // -----------

    /**
     * Prototype for a DOM element
     * @name DOMElement
     * @constructor
     * @param element native element
     * @extends DOMNode
     * @private
     */
    function DOMElement(element) {
        if (!(this instanceof DOMElement)) {
            return element ? element.__dom__ || new DOMElement(element) : new MockElement();
        }

        DOMNode.call(this, element);
    }

    DOMElement.prototype = new DOMNode();

    /**
     * Helper for events
     * @private
     * @constructor
     */
    function EventHelper(event, currentTarget) {
        this._event = event;
        this._currentTarget = currentTarget;
    }

    (function() {
        var hooks = {},
            returnTrue = function() { return true; },
            makeFuncMethod = function(name, propName, legacyHandler) {
                return !document.addEventListener ? legacyHandler : function() {
                    this._event[name]();

                    // IE9 behaves strangely with defaultPrevented so
                    // it's safer manually overwrite the getter
                    this[propName] = returnTrue;
                };
            };

        EventHelper.prototype = {
            get: function(name) {
                var hook = hooks[name];

                return hook ? hook(this) : this._event[name];
            },
            preventDefault: makeFuncMethod("preventDefault", "isDefaultPrevented", function() {
                this._event.returnValue = false;
            }),
            stopPropagation: makeFuncMethod("stopPropagation", "isBubbleCanceled", function() {
                this._event.cancelBubble = true;
            }),
            isDefaultPrevented: function() {
                return this._event.defaultPrevented || this._event.returnValue === false;
            },
            isBubbleCanceled: function() {
                return this._event.bubbleCanceled || this._event.cancelBubble === true;
            }
        };

        hooks.currentTarget = function(thisArg) {
            return DOMElement(thisArg._currentTarget);
        };

        if (document.addEventListener) {
            hooks.target = function(thisArg) {
                return DOMElement(thisArg._event.target);
            };
        } else {
            hooks.target = function(thisArg) {
                return DOMElement(thisArg._event.srcElement);
            };
        }
        
        if (document.addEventListener) {
            hooks.relatedTarget = function(thisArg) {
                return DOMElement(thisArg._event.relatedTarget);
            };
        } else {
            hooks.relatedTarget = function(thisArg) {
                var propName = ( thisArg._event.toElement === thisArg._currentTarget ? "from" : "to" ) + "Element";

                return DOMElement(thisArg._event[propName]);
            };
        }
    }());

    // CLASSES MANIPULATION
    // --------------------

    (function() {
        var rclass = /[\n\t\r]/g;

        function makeClassesMethod(nativeStrategyName, strategy) {
            var methodName = nativeStrategyName === "contains" ? "hasClass" : nativeStrategyName + "Class";

            return function() {
                var result = true;

                _forEach(_slice(arguments), function(className) {
                    if (typeof className !== "string") throw _makeError(methodName, this);

                    if (this._node.classList) {
                        result = this._node.classList[nativeStrategyName](className) && result;
                    } else {
                        result = strategy.call(this, className) && result;
                    }
                }, this);

                return nativeStrategyName === "contains" ? result : this;
            };
        }

        /**
         * Check if element contains class name(s)
         * @memberOf DOMElement.prototype
         * @param  {...String} classNames class name(s)
         * @return {Boolean}   true if the element contains all classes
         * @function
         */
        DOMElement.prototype.hasClass = makeClassesMethod("contains", function(className) {
            return !!~((" " + this._node.className + " ")
                        .replace(rclass, " ")).indexOf(" " + className + " ");
        });

        /**
         * Add class(es) to element
         * @memberOf DOMElement.prototype
         * @param  {...String}  classNames class name(s)
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
         * @param  {...String}  classNames class name(s)
         * @return {DOMElement} reference to this
         * @function
         */
        DOMElement.prototype.removeClass = makeClassesMethod("remove", function(className) {
            className = (" " + this._node.className + " ")
                    .replace(rclass, " ").replace(" " + className + " ", " ");

            this._node.className = className.substr(className[0] === " " ? 1 : 0, className.length - 2);
        });

        /**
         * Toggle class(es) on element
         * @memberOf DOMElement.prototype
         * @param  {...String}  classNames class name(s)
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

    /**
     * Clone element
     * @memberOf DOMElement.prototype
     * @return {DOMElement} reference to this
     */
    DOMElement.prototype.clone = function() {
        var el;

        if (document.addEventListener) {
            el = this._node.cloneNode(true);
        } else {
            el = _createElement("div");
            el.innerHTML = this._node.outerHTML;
            el = el.firstChild;
        }
        
        return new DOMElement(el);
    };

    // MANIPULATION
    // ------------
    
    (function() {
        function makeManipulationMethod(methodName, fasterMethodName, strategy) {
            // always use _parseFragment because of HTML5 and NoScope bugs in IE
            if (document.attachEvent) fasterMethodName = false;

            return function(value, /*INTERNAL*/reverse) {
                var el = reverse ? value : this._node,
                    relatedNode = el.parentNode;

                if (reverse) value = this._node;

                if (typeof value === "string") {
                    if (value[0] !== "<") value = DOM.parseTemplate(value);

                    relatedNode = fasterMethodName ? null : _parseFragment(value);
                } else if (value && (value.nodeType === 1 || value.nodeType === 11)) {
                    relatedNode = value;
                } else if (value instanceof DOMElement) {
                    value[methodName](el, true);

                    return this;
                } else if (value !== undefined) {
                    throw _makeError(methodName, this);
                }

                if (relatedNode) {
                    strategy(el, relatedNode);
                } else {
                    el.insertAdjacentHTML(fasterMethodName, value);
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

    /**
     * Check if the element matches selector
     * @memberOf DOMElement.prototype
     * @param  {String} selector css selector
     * @return {DOMElement} reference to this
     */
    DOMElement.prototype.matches = function(selector) {
        if (!selector || typeof selector !== "string") {
            throw _makeError("matches", this);
        }

        return new SelectorMatcher(selector).test(this._node);
    };

    
    /**
     * Calculates offset of current context
     * @memberOf DOMElement.prototype
     * @return {{top: Number, left: Number, right: Number, bottom: Number}} offset object
     */
    DOMElement.prototype.offset = function() {
        var htmlEl = document.documentElement,
            bodyEl = document.body,
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

    // GETTER / SETTER
    // ---------------

    (function() {
        var propHooks = {},
            throwIllegalAccess = function() { throw _makeError("get", this); },
            processObjectParam = function(value, name) { this.set(name, value); };
        // protect access to some properties
        _forEach("children childNodes elements parentNode firstElementChild lastElementChild nextElementSibling previousElementSibling".split(" "), function(key) {
            propHooks[key] = propHooks[key.replace("Element", "")] = {
                get: throwIllegalAccess,
                set: throwIllegalAccess
            };
        });

        propHooks.tagName = propHooks.nodeName = {
            get: function(el) {
                return el.nodeName.toLowerCase();
            }
        };

        if (document.attachEvent) {
            // fix NoScope elements in IE < 10
            propHooks.innerHTML = {
                set: function(el, value) {
                    el.innerHTML = "";
                    el.appendChild(_parseFragment(value));
                }
            };
            
            // fix hidden attribute for IE < 10
            propHooks.hidden = {
                set: function(el, value) {
                    if (typeof value !== "boolean") {
                        throw _makeError("set", this);
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
                throw _makeError("get", this);
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
                _forOwn(name, processObjectParam, this);
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
                    _forEach(name.split(" "), function(name) {
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
                    throw _makeError("set", this);
                }
            }

            return this;
        };
    })();

    // STYLES MANIPULATION
    // -------------------
    
    (function() {
        var getStyleHooks = {},
            setStyleHooks = {},
            rdash = /\-./g,
            rcamel = /[A-Z]/g,
            dashSeparatedToCamelCase = function(str) { return str[1].toUpperCase(); },
            camelCaseToDashSeparated = function(str) { return "-" + str.toLowerCase(); },
            computed = _getComputedStyle(document.documentElement),
            // In Opera CSSStyleDeclaration objects returned by _getComputedStyle have length 0
            props = computed.length ? _slice(computed) : _map(_keys(computed), function(key) { return key.replace(rcamel, camelCaseToDashSeparated); });
        
        _forEach(props, function(propName) {
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
        _forOwn({
            font: ["fontStyle", "fontSize", "/", "lineHeight", "fontFamily"],
            padding: ["paddingTop", "paddingRight", "paddingBottom", "paddingLeft"],
            margin: ["marginTop", "marginRight", "marginBottom", "marginLeft"],
            "border-width": ["borderTopWidth", "borderRightWidth", "borderBottomWidth", "borderLeftWidth"],
            "border-style": ["borderTopStyle", "borderRightStyle", "borderBottomStyle", "borderLeftStyle"]
        }, function(value, key) {
            getStyleHooks[key] = function(style) {
                var result = [],
                    hasEmptyStyleValue = function(prop, index) {
                        result.push(prop === "/" ? prop : style[prop]);

                        return !result[index];
                    };

                return _some(value, hasEmptyStyleValue) ? "" : result.join(" ");
            };
        });

        // normalize float css property
        if ("cssFloat" in computed) {
            getStyleHooks.float = function(style) {
                return style.cssFloat;
            };
        } else {
            getStyleHooks.float = function(style) {
                return style.styleFloat;
            };
        }
        
        _forEach("fill-opacity font-weight line-height opacity orphans widows z-index zoom".split(" "), function(propName) {
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
                throw _makeError("getStyle", this);
            }

            hook = getStyleHooks[name];

            result = hook ? hook(style) : style[name];

            if (!result) {
                style = _getComputedStyle(this._node);

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
                cssText = _foldl(_keys(name), function(cssText, key) {
                    value = name[key];
                    hook = setStyleHooks[key];

                    return cssText + ";" + (hook ? hook(key, value) : key + ":" + (typeof value === "number" ? value + "px" : value));
                }, "");
            } else {
                throw _makeError("setStyle", this);
            }

            this._node.style.cssText += cssText;

            return this;
        };
    })();

    // FORM SERIALIZATION
    // ------------------

    /**
     * Serialize element into query string
     * @memberOf DOMElement.prototype
     * @return {String} query string
     * @function
     */
    DOMElement.prototype.toQueryString = (function(){
        var makePair = function(name, value) {
                return encodeURIComponent(name) + "=" + encodeURIComponent(value);
            };

        return function() {
            var el = this._node,
                result = [];

            _forEach(el.elements || (el.form ? [el] : []), function(el) {
                if (el.name) { // don't include form fields without names
                    switch(el.type) {
                    case "select-one":
                    case "select-multiple":
                        _forEach(el.options, function(option) {
                            if (option.selected) {
                                result.push(makePair(el.name, option.hasAttribute("value") ? option.value : option.text));
                            }
                        });
                        break;
    
                    case undefined:
                    case "fieldset": // fieldset
                    case "file": // file input
                    case "submit": // submit button
                    case "reset": // reset button
                    case "button": // custom button
                        break;
    
                    case "radio": // radio button
                    case "checkbox": // checkbox
                        if (!el.checked) break;
                        /* falls through */
                    default:
                        result.push(makePair(el.name, el.value));
                    }
                }
            });

            return result.join("&").replace(/%20/g, "+");
        };
    }());

    // TRAVERSING
    // ----------
    
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

                return multiple ? new DOMCollection(nodes) : DOMElement(it);
            };
        }

        function makeChildTraversingMethod(multiple) {
            return function(index, selector) {
                if (multiple) {
                    selector = index;
                } else if (typeof index !== "number") {
                    throw _makeError("child", this);
                }

                var children = this._node.children,
                    matcher = SelectorMatcher(selector),
                    el;

                if (!document.addEventListener) {
                    // fix IE8 bug with children collection
                    children = _filter(children, function(el) {
                        return el.nodeType === 1;
                    });
                }

                if (multiple) {
                    return new DOMCollection(!matcher ? children :
                        _filter(children, matcher.test, matcher));
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
         * @return {DOMCollection} matched elements
         * @function
         */
        DOMElement.prototype.nextAll = makeTraversingMethod("nextSibling", true);

        /**
         * Find all previous sibling elements filtered by optional selector
         * @memberOf DOMElement.prototype
         * @param {String} [selector] css selector
         * @return {DOMCollection} matched elements
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
         * @return {DOMCollection} matched elements
         * @function
         */
        DOMElement.prototype.children = makeChildTraversingMethod(true);
    })();

    /**
     * Prepend extra arguments to the method with specified name
     * @memberOf DOMElement.prototype
     * @param  {String}    name  name of method to bind arguments with
     * @param  {...Object} args  extra arguments to prepend to the method
     * @return {DOMElement} reference to this
     */
    DOMElement.prototype.bind = function(name) {
        var args = _slice(arguments, 1),
            method = this[name];

        if (!args.length || typeof method !== "function" || method in DOMNode.prototype || method in DOMElement.prototype) {
            throw _makeError("bind", this);
        }

        this[name] = function() {
            return method.apply(this, args.concat(_slice(arguments)));
        };

        return this;
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

    // DOM COLLECTION
    // --------------

    /**
     * Read-only array-like collection of elements
     * @name DOMCollection
     * @constructor
     * @private
     */
    // jshint unused:false
    var DOMCollection = (function(){
        var initialize = function(element, index) {
                this[index] = DOMElement(element);
            },
            DOMCollection = function(elements) {
                elements = elements || [];

                this.length = elements.length;
            
                _forEach(elements, initialize, this);
            },
            props;

        DOMCollection.prototype = [];

        // clean DOMCollection prototype
        if (Object.getOwnPropertyNames) {
            props = Object.getOwnPropertyNames(Array.prototype);
        } else {
            props = "toLocaleString join pop push concat reverse shift unshift slice splice sort indexOf lastIndexOf".split(" ");
        }
        
        _forEach(props, function(key) {
            if (key !== "length") DOMCollection.prototype[key] = undefined;
        });

        /**
         * Number of elements in the collection
         * @memberOf DOMCollection.prototype
         * @type {Number}
         */
        DOMCollection.prototype.length = 0;

        /**
         * Executes callback on each element in the collection
         * @memberOf DOMCollection.prototype
         * @param  {Function} callback callback function
         * @param  {Object}   [thisArg]  callback context
         * @return {DOMCollection} reference to this
         */
        DOMCollection.prototype.each = function(callback, thisArg) {
            _some(this, callback, thisArg || this);

            return this;
        };

        /**
         * Calls the method named by name on each element in the collection
         * @memberOf DOMCollection.prototype
         * @param  {String}    name   name of the method
         * @param  {...Object} [args] arguments for the method call
         * @return {DOMCollection} reference to this
         */
        DOMCollection.prototype.invoke = function(name) {
            var args = _slice(arguments, 1);

            if (typeof name !== "string") {
                throw _makeError("invoke", this);
            }

            _forEach(this, function(el) {
                el[name].apply(el, args);
            });

            return this;
        };

        return DOMCollection;
    }());

    // MOCK ELEMENT
    // ------------

    function MockElement() {
        DOMNode.call(this, null);
    }

    MockElement.prototype = new DOMElement();

    _forIn(DOMElement.prototype, function(functor, key) {
        var isSetter = key in DOMCollection.prototype;

        MockElement.prototype[key] = isSetter ? function() { return this; } : function() { };
    });

    _forEach("next prev find child clone".split(" "), function(key) {
        MockElement.prototype[key] = function() { return new MockElement(); };
    });

    _forEach("nextAll prevAll children findAll".split(" "), function(key) {
        MockElement.prototype[key] = function() { return new DOMCollection(); };
    });

    // fix constructor property
    _forEach([DOMNode, DOMElement, MockElement, DOMCollection], function(ctr) {
        ctr.prototype.constructor = ctr;
    });

    // GLOBAL API
    // ----------

    /**
     * Global object to access DOM
     * @namespace DOM
     * @extends DOMNode
     */
    // jshint unused:false
    var DOM = new DOMNode(document);

    // WATCH CALLBACK
    // --------------

    /**
     * Execute callback when element with specified selector matches
     * @memberOf DOM
     * @param {String} selector css selector
     * @param {Fuction} callback event handler
     * @param {Boolean} [once] execute callback only at the first time
     * @function
     */
    DOM.watch = (function() {
        var docEl = document.documentElement,
            watchers = [];

        if (!docEl.addBehavior) {
            // use trick discovered by Daniel Buchner:
            // https://github.com/csuwldcat/SelectorListener
            var startNames = ["animationstart", "oAnimationStart", "webkitAnimationStart"],
                computed = _getComputedStyle(docEl),
                cssPrefix = window.CSSKeyframesRule ? "" : (_slice(computed).join("").match(/-(moz|webkit|ms)-/) || (computed.OLink === "" && ["-o-"]))[0];

            return function(selector, callback, once) {
                var animationName = _uniqueId("DOM"),
                    cancelBubbling = function(e) {
                        if (e.animationName === animationName) e.stopPropagation();
                    },
                    watcher = function(e) {
                        var el = e.target;

                        if (e.animationName === animationName) {
                            // MUST cancelBubbling first otherwise may have
                            // unexpected calls in firefox
                            if (once) el.addEventListener(e.type, cancelBubbling, false);

                            callback(DOMElement(el));
                        }
                    },
                    animationNames = _foldl(watchers, function(res, watcher) {
                        if (watcher.selector === selector) res.push(watcher.animationName);

                        return res;
                    }, [animationName]);

                watcher.selector = selector;
                watcher.animationName = animationName;

                DOM.importStyles(
                    "@" + cssPrefix + "keyframes " + animationName,
                    "from {clip: rect(1px,auto,auto,auto)} to {clip: rect(0px,auto,auto,auto)}"
                );

                DOM.importStyles(
                    selector,
                    cssPrefix + "animation-duration:0.001s;" + cssPrefix + "animation-name:" + animationNames.join(",") + " !important"
                );

                _forEach(startNames, function(name) {
                    document.addEventListener(name, watcher, false);
                });

                watchers.push(watcher);
            };
        } else {
            var scripts = document.scripts,
                behaviorUrl = scripts[scripts.length - 1].getAttribute("data-htc");

            return function(selector, callback, once) {
                var haveWatcherWithTheSameSelector = function(watcher) { return watcher.selector === selector; },
                    isEqualToCallback = function(otherCallback) { return otherCallback === callback; },
                    cancelCallback = function(canceledCallbacks) { canceledCallbacks.push(callback); },
                    watcher = function(canceledCallbacks, el) {
                        if (once) el.on("htc:watch", {args: ["detail"]}, cancelCallback);

                        // do not execute callback if it was previously excluded
                        if (!_some(canceledCallbacks, isEqualToCallback)) {
                            callback(el);
                        }
                    };

                watcher.selector = selector;

                DOM.on("htc:watch " + selector, {args: ["detail", "target"]}, watcher);

                if (_some(watchers, haveWatcherWithTheSameSelector)) {
                    // call the callback manually for each matched element
                    // because the behaviour is already attached to selector
                    // also execute the callback safely
                    _forEach(DOM.findAll(selector), function(el) {
                        _defer(function() { callback(el); });
                    });
                } else {
                    DOM.importStyles(selector, {behavior: "url(" + behaviorUrl + ")"});
                }

                watchers.push(watcher);
            };
        }
    }());

    // CREATE ELEMENT
    // --------------

    (function(){
        var rquick = /^[a-z]+$/;

        /**
         * Create a DOMElement instance
         * @memberOf DOM
         * @param  {String|Element} value native element or element tag name
         * @return {DOMElement} element
         */
        DOM.create = function(value) {
            if (typeof value === "string") {
                if (value.match(rquick)) {
                    value = _createElement(value);
                } else {
                    if (value[0] !== "<") value = DOM.parseTemplate(value);

                    value = _parseFragment(value);
                }
            }

            var nodeType = value.nodeType;

            if (nodeType === 11) {
                if (value.childNodes.length === 1) {
                    value = value.firstChild;
                } else {
                    var div = _createElement("div");

                    div.appendChild(value);

                    value = div;
                }
            } else if (nodeType !== 1) {
                this.error("create");
            }

            return DOMElement(value);
        };
    })();

    /**
     * Define a DOM extension
     * @memberOf DOM
     * @param  {String} selector extension css selector
     * @param  {Array}  [template] extension templates
     * @param  {Object} mixins extension mixins
     * @example
     * DOM.extend(".myplugin", [
     *     "&#60;span&#62;myplugin text&#60;/span&#62;"
     * ], {
     *     constructor: function(tpl) {
     *         // initialize extension
     *     }
     * });
     *
     * // emmet-like syntax example
     * DOM.extend(".mycalendar", [
     *     "table>(tr>th*7)+(tr>td*7)*6"
     * ], {
     *     constructor: function(tpl) {
     *         // initialize extension
     *     },
     *     method: function() {
     *         // this method will be mixed into every instance
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

        if (!mixins || typeof mixins !== "object" || (selector !== "*" && ~selector.indexOf("*"))) {
            throw _makeError("extend", this);
        }

        if (selector === "*") {
            // extending element prototype
            _extend(DOMElement.prototype, mixins);
        } else {
            template = _map(template || [], DOM.create);
            // update internal element mixins
            DOM.mock(selector, mixins);

            DOM.watch(selector, function(el) {
                _extend(el, mixins);

                if (mixins.hasOwnProperty("constructor")) {
                    mixins.constructor.apply(el, _map(template, function(value) {
                        return value.clone();
                    }));
                }
            }, true);
        }
    };

    // EMMET-LIKE PARSER
    // -----------------

    (function() {
        var operators = { // name / priority object
            "(": 0,
            ")": 1,
            ">": 2,
            "+": 2,
            "*": 3,
            "]": 3,
            "[": 4,
            ".": 5,
            "#": 6,
            ":": 7
        },
        rindex = /\$/g,
        rattr = /[\w\-_]+(=[^\s'"]+|='[^']+.|="[^"]+.)?/g,
        emptyElements = " area base br col hr img input link meta param command keygen source ",
        normalizeAttrs = function(term, str) {
            var index = str.indexOf("="),
                name = ~index ? str.substr(0, index) : str,
                value = ~index ? str.substr(index + 1) : "";

            if (value[0] !== "\"" && value[0] !== "'") value = "\"" + value + "\"";

            return term + " " + name + "=" + value;
        },
        toHtmlString = function(obj) {
            return _isArray(obj) ? obj.join("") : obj.toString();
        },
        appendToAll = function(node) {
            node.insertTerm(this, true);
        };

        // helper class
        function HtmlBuilder(term, noparse) {
            if (noparse) this.str = term;
            else {
                this.str = "<" + term + ">";

                if (!~emptyElements.indexOf(" " + term + " ")) {
                    this.str += "</" + term + ">";
                }
            }
        }

        HtmlBuilder.prototype = {
            insertTerm: function(term, toend) {
                var index = toend ? this.str.lastIndexOf("<") : this.str.indexOf(">");

                this.str = this.str.substr(0, index) + term + this.str.substr(index);
            },
            addTerm: function(term) {
                this.str += term;
            },
            toString: function() {
                return this.str;
            }
        };

        /**
         * Parse emmet-like template to HTML string
         * @memberOf DOM
         * @param  {String} template emmet-like expression
         * @return {String} HTML string
         * @see http://docs.emmet.io/cheat-sheet/
         */
        DOM.parseTemplate = function(template) {
            var stack = [],
                output = [],
                term = "";

            // parse exrpression into RPN
        
            _forEach(template, function(str) {
                var top = stack[0], priority;

                // concat .c1.c2 into single space separated class string
                if (top === "." && str === ".") str = " ";

                if (str in operators && (top !== "[" || str === "]")) {
                    if (str === ":") term = "input";

                    if (term) {
                        output.push(term);
                        term = "";
                    }

                    if (str !== "(") {
                        priority = operators[str];

                        while (operators[stack[0]] > priority) {
                            output.push(stack.shift());
                        }
                    }

                    if (str === ")") {
                        stack.shift(); // remove "(" symbol from stack
                    } else if (str !== "]") { // don't need to have "]" in stack
                        stack.unshift(str);
                    }
                } else {
                    term += str;
                }
            });

            if (term) stack.unshift(term);

            if (output.length) {
                output.push.apply(output, stack);

                stack = [];
            } else {
                stack.unshift(new HtmlBuilder(stack.shift()));
            }

            // transform RPN into html nodes

            _forEach(output, function(str) {
                var term, node;

                if (str in operators) {
                    term = stack.shift();
                    node = stack.shift() || "div";

                    if (typeof node === "string") node = new HtmlBuilder(node);

                    switch(str) {
                    case ".":
                        node.insertTerm(" class=\"" + term + "\"");
                        break;

                    case "#":
                        node.insertTerm(" id=\"" + term + "\"");
                        break;

                    case ":":
                        node.insertTerm(" type=\"" + term + "\"");
                        break;

                    case "[":
                        node.insertTerm(_foldl(term.match(rattr), normalizeAttrs, ""));
                        break;
                        
                    case "+":
                        term = toHtmlString(typeof term === "string" ? new HtmlBuilder(term) : term);

                        _isArray(node) ? node.push(term) : node.addTerm(term);
                        break;

                    case ">":
                        term = toHtmlString(typeof term === "string" ? new HtmlBuilder(term) : term);

                        _isArray(node) ? _forEach(node, appendToAll, term) : node.insertTerm(term, true);
                        break;

                    case "*":
                        str = toHtmlString(node);
                        node = [];

                        _times(parseInt(term, 10), function(i) {
                            node.push(new HtmlBuilder(str.replace(rindex, i + 1), true));
                        });
                        break;
                    }

                    str = node;
                }

                stack.unshift(str);
            });

            return toHtmlString(stack[0]);
        };
    })();

    // IMPORT STYLES
    // -------------

    (function() {
        var styleSheet = (function() {
                var headEl = document.scripts[0].parentNode;

                headEl.insertBefore(_createElement("style"), headEl.firstChild);

                return document.styleSheets[0];
            })(),
            obj = {_node: {style: {cssText: ""}}};

        /**
         * Import global css styles on page
         * @memberOf DOM
         * @param {String|Object} selector css selector or object with selector/rules pairs
         * @param {String} styles css rules
         */
        DOM.importStyles = function(selector, styles) {
            if (typeof styles === "object") {
                DOMElement.prototype.setStyle.call(obj, styles);

                styles = obj._node.style.cssText.substr(1); // remove leading comma
            }

            if (typeof selector !== "string" || typeof styles !== "string") {
                throw _makeError("importStyles", this);
            }

            if (styleSheet.cssRules) {
                styleSheet.insertRule(selector + " {" + styles + "}", styleSheet.cssRules.length);
            } else {
                // ie doesn't support multiple selectors in addRule
                _forEach(selector.split(","), function(selector) {
                    styleSheet.addRule(selector, styles);
                });
            }
        };

        if (document.attachEvent) {
            // corrects block display not defined in IE8/9
            DOM.importStyles("article,aside,figcaption,figure,footer,header,hgroup,main,nav,section", "display:block");
            // adds styling not present in IE6/7/8/9
            DOM.importStyles("mark", "background:#FF0;color:#000");
            // hides non-rendered elements
            DOM.importStyles("template,[hidden]", "display:none");
        }
    }());

    // READY CALLBACK
    // --------------

    (function() {
        var readyCallbacks = [],
            readyState = document.readyState,
            pageLoaded = function() {
                if (readyCallbacks) {
                    // safely trigger callbacks
                    _forEach(readyCallbacks, _defer);
                    // cleanup
                    readyCallbacks = null;
                }
            };

        if (document.addEventListener) {
            document.addEventListener("DOMContentLoaded", pageLoaded, false);
            window.addEventListener("load", pageLoaded, false);
        } else {
            DOM.watch("body", pageLoaded, true);
        }

        // Catch cases where ready is called after the browser event has already occurred.
        // IE10 and lower don't handle "interactive" properly... use a weak inference to detect it
        // discovered by ChrisS here: http://bugs.jquery.com/ticket/12282#comment:15
        if (document.attachEvent ? readyState === "complete" : readyState !== "loading") {
            pageLoaded();
        }

        /**
         * Execute callback when DOM will be ready
         * @memberOf DOM
         * @param {Function} callback event listener
         */
        DOM.ready = function(callback) {
            if (typeof callback !== "function") {
                throw _makeError("ready", this);
            }

            if (readyCallbacks) {
                readyCallbacks.push(callback);
            } else {
                _defer(callback);
            }
        };
    })();

    (function() {
        var extensions = {};

        /**
         * Return an {@link DOMElement} mock specified for optional selector
         * @memberOf DOM
         * @param  {String} [selector] selector of mock
         * @return {DOMElement} mock instance
         */
        DOM.mock = function(selector, mixins) {
            if (selector && typeof selector !== "string" || mixins && typeof mixins !== "object") {
                throw _makeError("mock", this);
            }

            if (!mixins) {
                var el = new MockElement();

                if (selector) {
                    _extend(el, extensions[selector]);

                    el.constructor = MockElement;
                }

                return el;
            }

            extensions[selector] = _extend(extensions[selector] || {}, mixins);
        };
    })();

    
    // REGISTER API
    // ------------

    if (typeof define === "function" && define.amd) {
        define("DOM", function() { return DOM; });
    } else {
        window.DOM = DOM;
    }
    
})(window, document);
