/**
 * @file better-dom
 * @version 1.4.1 2013-09-15T12:46:14
 * @overview Sandbox for living DOM extensions
 * @copyright Maksim Chemerisuk 2013
 * @license MIT
 * @see https://github.com/chemerisuk/better-dom
 */
(function(window, document, documentElement, undefined) {
    "use strict";
    
    // HELPERS
    // -------

    // jshint unused:false
    var _defer = function(callback) {
            return setTimeout(callback, 0);
        },
        _makeError = function(method, el) {
            var type;

            if (el instanceof $Element) {
                type = "$Element";
            } else {
                type = "DOM";
            }

            return "Error: " + type + "." + method + " was called with illegal arguments. Check http://chemerisuk.github.io/better-dom/" + type + ".html#" + method + " to verify the function call";
        },
        makeLoopMethod = (function(){
            var rcallback = /cb\.call\(([^)]+)\)/g,
                defaults = {
                    BEFORE: "",
                    COUNT:  "a ? a.length : 0",
                    BODY:   "",
                    AFTER:  ""
                };

            return function(options) {
                var code = "%BEFORE%\nfor(var i=0,n=%COUNT%;i<n;++i){%BODY%}%AFTER%";

                _forIn(defaults, function(value, key) {
                    code = code.replace("%" + key + "%", options[key] || value);
                });

                // improve callback invokation by using call on demand
                code = code.replace(rcallback, function(expr, args) {
                    return "(that?" + expr + ":cb(" + args.split(",").slice(1).join() + "))";
                });

                return Function("a", "cb", "that", "undefined", code);
            };
        })(),

        // OBJECT UTILS
        // ------------

        _forIn = function(obj, callback, thisPtr) {
            for (var prop in obj) {
                callback.call(thisPtr, obj[prop], prop, obj);
            }
        },
        _forOwn = (function() {
            if (Object.keys) {
                return makeLoopMethod({
                    BEFORE: "var keys = Object.keys(a), k",
                    COUNT:  "keys.length",
                    BODY:   "k = keys[i]; cb.call(that, a[k], k, a)"
                });
            } else {
                return function(obj, callback, thisPtr) {
                    for (var prop in obj) {
                        if (Object.prototype.hasOwnProperty.call(obj, prop)) callback.call(thisPtr, obj[prop], prop, obj);
                    }
                };
            }
        }()),
        _keys = Object.keys || (function() {
            var collectKeys = function(value, key) { this.push(key); };

            return function(obj) {
                var result = [];

                _forOwn(obj, collectKeys, result);

                return result;
            };
        }()),
        _extend = function(obj, mixins) {
            _forOwn(mixins, function(value, key) {
                obj[key] = value;
            });

            return obj;
        },

        // COLLECTION UTILS
        // ----------------

        _forEach = makeLoopMethod({
            BODY:   "cb.call(that, a[i], i, a)",
            AFTER:  "return a"
        }),
        _map = makeLoopMethod({
            BEFORE: "var out = Array(a && a.length || 0)",
            BODY:   "out[i] = cb.call(that, a[i], i, a)",
            AFTER:  "return out"
        }),
        _some = makeLoopMethod({
            BODY:   "if (cb.call(that, a[i], i, a) === true) return true",
            AFTER:  "return false"
        }),
        _filter = makeLoopMethod({
            BEFORE: "var out = []",
            BODY:   "if (cb.call(that, a[i], i, a)) out.push(a[i])",
            AFTER:  "return out"
        }),
        _foldl = makeLoopMethod({
            BODY:   "that = (!i && that === undefined ? a[i] : cb(that, a[i], i, a))",
            AFTER:  "return that"
        }),
        _foldr = makeLoopMethod({
            BEFORE: "var j",
            BODY:   "j = n - i - 1; that = (!i && that === undefined ? a[j] : cb(that, a[j], j, a))",
            AFTER:  "return that"
        }),
        _every = makeLoopMethod({
            BEFORE: "var out = true",
            BODY:   "out = cb.call(that, a[i], i, a) && out",
            AFTER:  "return out"
        }),
        _slice = function(list, index) {
            return Array.prototype.slice.call(list, index | 0);
        },

        // DOM UTILS
        // ---------

        _getComputedStyle = function(el) {
            return window.getComputedStyle ? window.getComputedStyle(el) : el.currentStyle;
        },
        _parseFragment = (function() {
            var parser = document.createElement("body");

            return function(html) {
                var fragment = document.createDocumentFragment();

                // fix NoScope bug
                parser.innerHTML = "<br>" + html;
                parser.removeChild(parser.firstChild);

                while (parser.firstChild) {
                    fragment.appendChild(parser.firstChild);
                }

                return fragment;
            };
        })(),
        _requestAnimationFrame = (function() {
            var lastTime = 0,
                raf = _foldl(["r", "webkitR", "mozR"], function(result, prefix) {
                    var propertyName = prefix + "equestAnimationFrame";

                    if (!result) return window[propertyName] && propertyName;
                }, "");

            return raf || function(callback) {
                var currTime = new Date().getTime(),
                    timeToCall = Math.max(0, 16 - (currTime - lastTime));

                lastTime = currTime + timeToCall;

                if (timeToCall) {
                    setTimeout(callback, timeToCall);
                } else {
                    callback(currTime + timeToCall);
                }
            };
        }());

    // DOM NODE
    // --------

    /**
     * Used to represent a DOM node
     * @name $Node
     * @param node {Object} native node
     * @constructor
     * @private
     */
    function $Node(node) {
        if (node) {
            this._node = node;
            this._data = {};
            this._listeners = [];
        }
    }

    $Node.prototype = {};

    /**
     * Check element capability
     * @param {String} prop property to check
     * @param {String} [tag] name of element to test
     * @return {Boolean} true, if feature is supported
     * @example
     * input.supports("placeholder");
     * // => true if an input supports placeholders
     * DOM.supports("addEventListener");
     * // => true if browser supports document.addEventListener
     * DOM.supports("oninvalid", "input");
     * // => true if browser supports `invalid` event
     */
    $Node.prototype.supports = function(prop, tagName) {
        // http://perfectionkills.com/detecting-event-support-without-browser-sniffing/
        var node = document.createElement(tagName || this._node.tagName || "div"),
            isSupported = prop in node;

        if (!isSupported && !prop.indexOf("on")) {
            node.setAttribute(prop, "return;");

            isSupported = typeof node[prop] === "function";
        }
            
        return isSupported;
    };

    // SEARCH BY QUERY
    // ---------------

    (function() {
        // big part of code inspired by Sizzle:
        // https://github.com/jquery/sizzle/blob/master/sizzle.js

        // TODO: disallow to use buggy selectors?
        var rquickExpr = document.getElementsByClassName ? /^(?:#([\w\-]+)|(\w+)|\.([\w\-]+))$/ : /^(?:#([\w\-]+)|(\w+))$/,
            rsibling = /[\x20\t\r\n\f]*[+~>]/,
            rescape = /'|\\/g,
            tmpId = "DOM" + new Date().getTime();

        /**
         * Find the first matched element by css selector
         * @param  {String} selector css selector
         * @return {$Element} the first matched element
         */
        $Node.prototype.find = function(selector, /*INTERNAL*/multiple) {
            if (typeof selector !== "string") {
                throw _makeError("find", this);
            }

            var node = this._node,
                quickMatch = rquickExpr.exec(selector),
                m, elem, elements, old, nid, context;

            if (quickMatch) {
                // Speed-up: "#ID"
                if (m = quickMatch[1]) {
                    elem = document.getElementById(m);
                    // Handle the case where IE, Opera, and Webkit return items by name instead of ID
                    if ( elem && elem.parentNode && elem.id === m && (this === DOM || node.contains(elem)) ) {
                        elements = [elem];
                    }
                // Speed-up: "TAG"
                } else if (quickMatch[2]) {
                    elements = node.getElementsByTagName(selector);
                // Speed-up: ".CLASS"
                } else if (m = quickMatch[3]) {
                    elements = node.getElementsByClassName(m);
                }

                if (elements && !multiple) elements = elements[0];
            } else {
                old = true;
                nid = tmpId;
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

            return multiple ? new $CompositeElement(elements) : $Element(elements);
        };

        /**
         * Finds all matched elements by css selector
         * @param  {String} selector css selector
         * @return {$Element} collection of matched elements
         */
        $Node.prototype.findAll = function(selector) {
            return this.find(selector, true);
        };
    })();

    // INTERNAL DATA
    // -------------

    (function() {
        var processObjectParam = function(value, name) { this.setData(name, value); };

        /**
         * Read data entry value
         * @param  {String} key data entry key
         * @return {Object} data entry value
         * @example
         * var domLink = DOM.find(".link");
         *
         * domLink.setData("test", "message");
         * domLink.getData("test");
         * // returns string "message"
         */
        $Node.prototype.getData = function(key) {
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
         * @param {String|Object} key data entry key | key/value pairs
         * @param {Object} value data to store
         * @return {$Node}
         * @example
         * var domLink = DOM.find(".link");
         *
         * domLink.setData("test", "message");
         * domLink.setData({a: "b", c: "d"});
         */
        $Node.prototype.setData = function(key, value) {
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

    // CONTAINS
    // --------

    /**
     * Check if element is inside of context
     * @param  {$Element} element element to check
     * @return {Boolean} true if success
     * @example
     * DOM.find("html").contains(DOM.find("body"));
     * // returns true
     */
    $Node.prototype.contains = function(element) {
        var node = this._node, result;

        if (element instanceof $Element) {
            result = element.every(function(element) {
                return node.contains(element._node);
            });
        } else {
            throw _makeError("contains", this);
        }

        return result;
    };

    // DOM EVENTS
    // ----------

    (function() {
        var eventHooks = {},
            legacyCustomEventName = "dataavailable";

        /**
         * Bind a DOM event to the context
         * @param  {String}   type event type with optional selector
         * @param  {Array}    [props] event properties to pass to the callback function
         * @param  {Object}   [context] callback context
         * @param  {Function|String} callback event callback/property name
         * @return {$Node}
         * @example
         * // NOTICE: handler don't have e as the first argument
         * input.on("click", function() {...});
         * // NOTICE: event properties in event name
         * input.on("keydown", ["which", "altKey"], function(which, altKey) {...});
         */
        $Node.prototype.on = function(type, props, context, callback, /*INTERNAL*/once) {
            var node = this._node,
                eventType = typeof type,
                hook, handler, selector, index;

            if (eventType === "string") {
                index = type.indexOf(" ");

                if (~index) {
                    selector = type.substr(index + 1);
                    type = type.substr(0, index);
                }

                // handle optional props argument
                if (Object.prototype.toString.call(props) !== "[object Array]") {
                    once = callback;
                    callback = context;
                    context = props;
                    props = undefined;
                }

                // handle optional context argument
                if (typeof context !== "object") {
                    once = callback;
                    callback = context;
                    context = this;
                }

                if (once) {
                    callback = (function(thisPtr, originalCallback) {
                        return function() {
                            // remove event listener
                            thisPtr.off(handler.type, handler.context, callback);

                            return originalCallback.apply(this, arguments);
                        };
                    }(this, callback));
                }

                handler = EventHandler(type, selector, context, callback, props, this);
                handler.type = selector ? type + " " + selector : type;
                handler.callback = callback;
                handler.context = context;

                if (hook = eventHooks[type]) hook(handler);

                if (document.addEventListener) {
                    node.addEventListener(handler._type || type, handler, !!handler.capturing);
                } else {
                    // IE8 doesn't support onscroll on document level
                    if (this === DOM && type === "scroll") node = window;

                    node.attachEvent("on" + (handler._type || type), handler);
                }
                // store event entry
                this._listeners.push(handler);
            } else if (eventType === "object") {
                _forOwn(type, function(value, name) { this.on(name, value); }, this);
            } else {
                throw _makeError("on", this);
            }

            return this;
        };

        /**
         * Bind a DOM event to the context and the callback only fire once before being removed
         * @param  {String}   type type of event with optional selector to filter by
         * @param  {Array}    [props] event properties to pass to the callback function
         * @param  {Object}   [context] callback context
         * @param  {Function|String} callback event callback/property name
         * @return {$Node}
         */
        $Node.prototype.once = function() {
            var args = _slice(arguments);

            args.push(true);

            return $Node.prototype.on.apply(this, args);
        };

        /**
         * Unbind a DOM event from the context
         * @param  {String}          type type of event
         * @param  {Object}          [context] callback context
         * @param  {Function|String} [callback] event handler
         * @return {$Node}
         */
        $Node.prototype.off = function(type, context, callback) {
            if (typeof type !== "string") {
                throw _makeError("off", this);
            }

            if (arguments.length === 2) {
                callback = context;
                context = !callback ? undefined : this;
            }

            _forEach(this._listeners, function(handler, index, events) {
                var node = this._node;

                if (handler && type === handler.type && (!context || context === handler.context) && (!callback || callback === handler.callback)) {
                    type = handler._type || handler.type;

                    if (document.removeEventListener) {
                        node.removeEventListener(type, handler, !!handler.capturing);
                    } else {
                        // IE8 doesn't support onscroll on document level
                        if (this === DOM && type === "scroll") node = window;

                        node.detachEvent("on" + type, handler);
                    }

                    delete events[index];
                }
            }, this);

            return this;
        };

        /**
         * Triggers an event of specific type and executes it's default action if it exists
         * @param  {String} type type of event
         * @param  {Object} [detail] event details
         * @return {$Node}
         * @example
         * var domLink = DOM.find(".link");
         *
         * domLink.fire("focus");
         * // receive focus to the element
         * domLink.fire("custom:event", {x: 1, y: 2});
         * // trigger a custom:event on the element
         */
        $Node.prototype.fire = function(type, detail) {
            if (typeof type !== "string") {
                throw _makeError("fire", this);
            }

            var node = this._node,
                hook = eventHooks[type],
                handler = {},
                isCustomEvent, canContinue, event;

            if (hook) hook(handler);

            isCustomEvent = handler.custom || !this.supports("on" + type);

            if (document.createEvent) {
                event = document.createEvent("HTMLEvents");

                event.initEvent(handler._type || type, true, true);
                event.detail = detail;

                canContinue = node.dispatchEvent(event);
            } else {
                event = document.createEventObject();
                // store original event type
                event.srcUrn = isCustomEvent ? type : undefined;
                event.detail = detail;

                node.fireEvent("on" + (isCustomEvent ? legacyCustomEventName : handler._type || type), event);

                canContinue = event.returnValue !== false;
            }

            // Call a native DOM method on the target with the same name as the event
            // IE<9 dies on focus/blur to hidden element
            if (canContinue && node[type] && (type !== "focus" && type !== "blur" || node.offsetWidth)) {
                // Prevent re-triggering of the same event
                EventHandler.veto = type;

                node[type]();

                EventHandler.veto = false;
            }

            return this;
        };

        // firefox doesn't support focusin/focusout events
        if ($Node.prototype.supports("onfocusin", "input")) {
            _forOwn({focus: "focusin", blur: "focusout"}, function(value, prop) {
                eventHooks[prop] = function(handler) { handler._type = value; };
            });
        } else {
            eventHooks.focus = eventHooks.blur = function(handler) {
                handler.capturing = true;
            };
        }

        if ($Node.prototype.supports("validity", "input")) {
            eventHooks.invalid = function(handler) {
                handler.capturing = true;
            };
        }

        if (document.attachEvent && !window.CSSKeyframesRule) {
            // input event fix via propertychange
            document.attachEvent("onfocusin", (function() {
                var legacyEventHandler = function() {
                        if (capturedNode && capturedNode.value !== capturedNodeValue) {
                            capturedNodeValue = capturedNode.value;
                            // trigger special event that bubbles
                            $Element(capturedNode).fire("input");
                        }
                    },
                    capturedNode, capturedNodeValue;

                if (window.addEventListener) {
                    // IE9 doesn't fire oninput when text is deleted, so use
                    // legacy onselectionchange event to detect such cases
                    // http://benalpert.com/2013/06/18/a-near-perfect-oninput-shim-for-ie-8-and-9.html
                    document.attachEvent("onselectionchange", legacyEventHandler);
                }

                return function() {
                    var target = window.event.srcElement,
                        type = target.type;

                    if (capturedNode) {
                        capturedNode.detachEvent("onpropertychange", legacyEventHandler);
                        capturedNode = undefined;
                    }

                    if (type === "text" || type === "password" || type === "textarea") {
                        (capturedNode = target).attachEvent("onpropertychange", legacyEventHandler);
                    }
                };
            })());

            if (!window.addEventListener) {
                // submit event bubbling fix
                document.attachEvent("onkeydown", function() {
                    var e = window.event,
                        target = e.srcElement,
                        form = target.form;

                    if (form && target.type !== "textarea" && e.keyCode === 13 && e.returnValue !== false) {
                        $Element(form).fire("submit");

                        return false;
                    }
                });

                document.attachEvent("onclick", (function() {
                    var handleSubmit = function() {
                            var form = window.event.srcElement;

                            form.detachEvent("onsubmit", handleSubmit);

                            $Element(form).fire("submit");

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

                eventHooks.submit = function(handler) {
                    handler.custom = true;
                };
            }
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
                if (!(this instanceof SelectorMatcher)) {
                    return selector ? new SelectorMatcher(selector) : null;
                }

                this.selector = selector;

                var quick = rquickIs.exec(selector);
                // TODO: support attribute value check
                if (this.quick = quick) {
                    //   0  1    2   3          4
                    // [ _, tag, id, attribute, class ]
                    if (quick[1]) quick[1] = quick[1].toLowerCase();
                    if (quick[4]) quick[4] = " " + quick[4] + " ";
                }
            },
            matchesProp = _foldl("m oM msM mozM webkitM".split(" "), function(result, prefix) {
                var propertyName = prefix + "atchesSelector";

                if (!result) return documentElement[propertyName] && propertyName;
            }, null),
            isEqual = function(val) { return val === this; };

        ctor.prototype = {
            test: function(el) {
                if (this.quick) {
                    return (
                        (!this.quick[1] || el.nodeName.toLowerCase() === this.quick[1]) &&
                        (!this.quick[2] || el.id === this.quick[2]) &&
                        (!this.quick[3] || el.hasAttribute(this.quick[3])) &&
                        (!this.quick[4] || (" " + el.className + " ").indexOf(this.quick[4]) >= 0)
                    );
                }

                if (matchesProp) return el[matchesProp](this.selector);

                return _some(document.querySelectorAll(this.selector), isEqual, el);
            }
        };

        return ctor;
    }());

    /**
     * Helper type to create an event handler
     * @private
     * @constructor
     */
    var EventHandler = (function() {
        var hooks = {},
            debouncedEvents = "scroll mousemove",
            createCustomEventWrapper = function(originalHandler, type) {
                var handler = function() {
                        if (window.event.srcUrn === type) originalHandler();
                    };

                handler._type = "dataavailable";

                return handler;
            },
            createDebouncedEventWrapper = function(originalHandler) {
                var canProcess = true;

                return function(e) {
                    if (canProcess) {
                        canProcess = false;

                        _requestAnimationFrame(function() {
                            originalHandler(e);

                            canProcess = true;
                        });
                    }
                };
            };

        hooks.currentTarget = function(event, currentTarget) {
            return $Element(currentTarget);
        };

        if (document.addEventListener) {
            hooks.target = function(event) {
                return $Element(event.target);
            };

            hooks.relatedTarget = function(event) {
                return $Element(event.relatedTarget);
            };
        } else {
            hooks.target = function(event) {
                return $Element(event.srcElement);
            };

            hooks.relatedTarget = function(event, currentTarget) {
                var propName = ( event.toElement === currentTarget ? "from" : "to" ) + "Element";

                return $Element(event[propName]);
            };

            hooks.defaultPrevented = function(event) {
                return event.returnValue === false;
            };

            hooks.which = function(event) {
                var button = event.button;

                if (button !== undefined) {
                    // click: 1 === left; 2 === middle; 3 === right
                    return button & 1 ? 1 : ( button & 2 ? 3 : ( button & 4 ? 2 : 0 ) );
                } else {
                    // add which for key events
                    return event.charCode || event.keyCode || undefined;
                }
            };

            hooks.pageX = function(event) {
                return event.clientX + documentElement.scrollLeft - documentElement.clientLeft;
            };

            hooks.pageY = function(event) {
                return event.clientY + documentElement.scrollTop - documentElement.clientTop;
            };
        }

        return function(type, selector, context, callback, extras, currentTarget) {
            extras = extras || ["target", "defaultPrevented"];

            var matcher = SelectorMatcher(selector),
                isCallbackProp = typeof callback === "string",
                defaultEventHandler = function(e) {
                    e = e || window.event;

                    if (EventHandler.veto !== type) {
                        var fn = isCallbackProp ? context[callback] : callback,
                            args = _map(extras, function(name) {
                                var hook = hooks[name];

                                return hook ? hook(e, currentTarget._node) : (name === "type" ? type : e[name]);
                            });

                        if (fn && fn.apply(context, args) === false) {
                            // prevent default if handler returns false
                            if (e.preventDefault) {
                                e.preventDefault();
                            } else {
                                e.returnValue = false;
                            }
                        }
                    }
                },
                result;

            result = !matcher ? defaultEventHandler : function(e) {
                var node = window.event ? window.event.srcElement : e.target,
                    root = currentTarget._node;

                for (; node && node !== root; node = node.parentNode) {
                    if (matcher.test(node)) return defaultEventHandler(e);
                }
            };

            if (~debouncedEvents.indexOf(type)) {
                result = createDebouncedEventWrapper(result);
            } else if (!document.addEventListener && (!currentTarget.supports("on" + type) || type === "submit")) {
                // handle custom events for IE8
                result = createCustomEventWrapper(result, type);
            }

            return result;
        };
    }());

    // DOM ELEMENT
    // -----------

    /**
     * Used to represent a DOM element (length == 1)
     * @name $Element
     * @param element {Object} native element
     * @extends $Node
     * @constructor
     * @private
     */
    function $Element(element) {
        if (element && element.__dom__) return element.__dom__;

        if (!(this instanceof $Element)) {
            return element ? new $Element(element) : new $NullElement();
        }

        $Node.call(this, element);

        if (element) {
            Array.prototype.push.call(this, element.__dom__ = this);
        }
    }

    $Element.prototype = new $Node();

    // CLASSES MANIPULATION
    // --------------------

    (function() {
        var rclass = /[\n\t\r]/g;

        function makeClassesMethod(nativeStrategyName, strategy) {
            var methodName = nativeStrategyName === "contains" ? "hasClass" : nativeStrategyName + "Class";

            if (documentElement.classList) {
                strategy = function(className) {
                    return this._node.classList[nativeStrategyName](className);
                };
            }

            strategy = (function(strategy){
                return function(className) {
                    if (typeof className !== "string") throw _makeError(methodName, this);

                    return strategy.call(this, className);
                };
            })(strategy);

            if (methodName === "hasClass") {
                return function() {
                    return _every(arguments, strategy, this);
                };
            } else {
                return function() {
                    _forEach(arguments, strategy, this);

                    return this;
                };
            }
        }

        /**
         * Check if element contains class name(s)
         * @param  {...String} classNames class name(s)
         * @return {Boolean}   true if the element contains all classes
         * @function
         */
        $Element.prototype.hasClass = makeClassesMethod("contains", function(className) {
            return (" " + this._node.className + " ").replace(rclass, " ").indexOf(" " + className + " ") >= 0;
        });

        /**
         * Add class(es) to element
         * @param  {...String} classNames class name(s)
         * @return {$Element}
         * @function
         */
        $Element.prototype.addClass = makeClassesMethod("add", function(className) {
            if (!this.hasClass(className)) this._node.className += " " + className;
        });

        /**
         * Remove class(es) from element
         * @param  {...String} classNames class name(s)
         * @return {$Element}
         * @function
         */
        $Element.prototype.removeClass = makeClassesMethod("remove", function(className) {
            className = (" " + this._node.className + " ").replace(rclass, " ").replace(" " + className + " ", " ");

            this._node.className = className.substr(className[0] === " " ? 1 : 0, className.length - 2);
        });

        /**
         * Toggle class(es) on element
         * @param  {...String}  classNames class name(s)
         * @return {$Element}
         * @function
         */
        $Element.prototype.toggleClass = makeClassesMethod("toggle", function(className) {
            var oldClassName = this._node.className;

            this.addClass(className);

            if (oldClassName === this._node.className) this.removeClass(className);
        });
    })();

    /**
     * Clone element
     * @return {$Element} clone of current element
     */
    $Element.prototype.clone = function() {
        var node;

        if (document.addEventListener) {
            node = this._node.cloneNode(true);
        } else {
            node = document.createElement("div");
            node.innerHTML = this._node.outerHTML;
            node = node.firstChild;
        }
        
        return new $Element(node);
    };

    // MANIPULATION
    // ------------

    (function() {
        function makeManipulationMethod(methodName, fasterMethodName, strategy) {
            // always use _parseFragment because of HTML5 and NoScope bugs in IE
            if (document.attachEvent && !window.CSSKeyframesRule) fasterMethodName = false;

            var manipulateContent = function(value) {
                var valueType = typeof value,
                    node = this._node,
                    relatedNode = node.parentNode;

                if (valueType === "function") {
                    value = value.call(this);
                    valueType = typeof value;
                }

                if (valueType === "string") {
                    if (value[0] !== "<") value = DOM.parseTemplate(value);

                    relatedNode = fasterMethodName ? null : _parseFragment(value);
                } else if (value instanceof $Element) {
                    value.each(function(el) { strategy(node, el._node); });

                    return this;
                } else if (value !== undefined) {
                    throw _makeError(methodName, this);
                }

                if (relatedNode) {
                    strategy(node, relatedNode);
                } else {
                    node.insertAdjacentHTML(fasterMethodName, value);
                }

                return this;
            };

            return !fasterMethodName ? manipulateContent : function() {
                _forEach(arguments, manipulateContent, this);

                return this;
            };
        }

        /**
         * Insert html string or $Element after the current
         * @param {...Mixed} contents HTMLString or $Element or functor that returns content
         * @return {$Element}
         * @function
         */
        $Element.prototype.after = makeManipulationMethod("after", "afterend", function(node, relatedNode) {
            node.parentNode.insertBefore(relatedNode, node.nextSibling);
        });

        /**
         * Insert html string or $Element before the current
         * @param {...Mixed} contents HTMLString or $Element or functor that returns content
         * @return {$Element}
         * @function
         */
        $Element.prototype.before = makeManipulationMethod("before", "beforebegin", function(node, relatedNode) {
            node.parentNode.insertBefore(relatedNode, node);
        });

        /**
         * Prepend html string or $Element to the current
         * @param {...Mixed} contents HTMLString or $Element or functor that returns content
         * @return {$Element}
         * @function
         */
        $Element.prototype.prepend = makeManipulationMethod("prepend", "afterbegin", function(node, relatedNode) {
            node.insertBefore(relatedNode, node.firstChild);
        });

        /**
         * Append html string or $Element to the current
         * @param {...Mixed} contents HTMLString or $Element or functor that returns content
         * @return {$Element}
         * @function
         */
        $Element.prototype.append = makeManipulationMethod("append", "beforeend", function(node, relatedNode) {
            node.appendChild(relatedNode);
        });

        /**
         * Replace current element with html string or $Element
         * @param {Mixed} content HTMLString or $Element or functor that returns content
         * @return {$Element}
         * @function
         */
        $Element.prototype.replace = makeManipulationMethod("replace", "", function(node, relatedNode) {
            node.parentNode.replaceChild(relatedNode, node);
        });

        /**
         * Remove current element from DOM
         * @return {$Element}
         * @function
         */
        $Element.prototype.remove = makeManipulationMethod("remove", "", function(node, parentNode) {
            parentNode.removeChild(node);
        });
    })();

    /**
     * Check if the element matches selector
     * @param  {String} selector css selector
     * @return {$Element}
     */
    $Element.prototype.matches = function(selector) {
        if (!selector || typeof selector !== "string") {
            throw _makeError("matches", this);
        }

        return new SelectorMatcher(selector).test(this._node);
    };

    
    /**
     * Calculates offset of current context
     * @return {{top: Number, left: Number, right: Number, bottom: Number}} offset object
     */
    $Element.prototype.offset = function() {
        var boundingRect = this._node.getBoundingClientRect(),
            clientTop = documentElement.clientTop,
            clientLeft = documentElement.clientLeft,
            scrollTop = window.pageYOffset || documentElement.scrollTop,
            scrollLeft = window.pageXOffset || documentElement.scrollLeft;

        return {
            top: boundingRect.top + scrollTop - clientTop,
            left: boundingRect.left + scrollLeft - clientLeft,
            right: boundingRect.right + scrollLeft - clientLeft,
            bottom: boundingRect.bottom + scrollTop - clientTop
        };
    };

    // GETTER
    // ------

    (function() {
        var hooks = {};

        /**
         * Get property or attribute by name
         * @param  {String} [name] property/attribute name
         * @return {String} property/attribute value
         * @example
         * // returns value of the id property (i.e. "link" string)
         * link.get("id");
         * // returns value of "data-attr" attribute
         * link.get("data-attr");
         * // returns innerHTML of the element
         * link.get();
         */
        $Element.prototype.get = function(name) {
            var node = this._node,
                hook = hooks[name];

            if (name === undefined) {
                if (node.tagName === "OPTION") {
                    name = node.hasAttribute("value") ? "value" : "text";
                } else {
                    name = node.type && "value" in node ? "value" : "innerHTML";
                }
            } else if (typeof name !== "string") {
                throw _makeError("get", this);
            }

            return hook ? hook(node, name) : (name in node ? node[name] : node.getAttribute(name));
        };

        hooks.tagName = hooks.method = function(node, key) {
            return node[key].toLowerCase();
        };

        hooks.elements = hooks.options = function(node, key) {
            return new $CompositeElement(node[key]);
        };

        hooks.form = function(node) {
            return $Element(node.form);
        };

        hooks.type = function(node) {
            // some browsers don't recognize input[type=email] etc.
            return node.getAttribute("type") || node.type;
        };
    })();

    // SETTER
    // ------

    (function() {
        var hooks = {},
            processObjectParam = function(value, name) { this.set(name, value); };

        /**
         * Set property/attribute value
         * @param {String} [name] property/attribute name
         * @param {String} value property/attribute value
         * @return {$Element}
         * @example
         * // sets property href (and that action updates attribute value too)
         * link.set("href", "/some/path");
         * // sets attribute "data-attr" to "123"
         * link.set("data-attr", "123");
         * // sets innerHTML to "some text"
         * link.set("some text");
         */
        $Element.prototype.set = function(name, value) {
            var node = this._node,
                nameType = typeof name,
                hook;

            if (nameType === "string") {
                if (value === undefined) {
                    value = name;

                    if (node.type && "value" in node) {
                        // for IE use innerText because it doesn't trigger onpropertychange
                        name = window.addEventListener ? "value" : "innerText";
                    } else {
                        name = "innerHTML";
                    }
                }

                if (typeof value === "function") {
                    value = value.call(this, value.length ? this.get(name) : undefined);
                }

                if (hook = hooks[name]) {
                    hook(node, value);
                } else if (value === null) {
                    node.removeAttribute(name);
                } else if (name in node) {
                    node[name] = value;
                } else {
                    node.setAttribute(name, value);
                }
            } else if (nameType === "object") {
                _forOwn(name, processObjectParam, this);
            } else {
                throw _makeError("set", this);
            }

            return this;
        };

        if (document.attachEvent) {
            // fix NoScope elements in IE < 10
            hooks.innerHTML = function(node, value) {
                node.innerHTML = "";
                node.appendChild(_parseFragment(value));
            };
            
            // fix hidden attribute for IE < 10
            hooks.hidden = function(node, value) {
                if (typeof value !== "boolean") {
                    throw _makeError("set", this);
                }

                node.hidden = value;

                if (value) {
                    node.setAttribute("hidden", "hidden");
                } else {
                    node.removeAttribute("hidden");
                }

                // trigger redraw in IE
                node.style.zoom = value ? "1" : "0";
            };
        }
    })();

    // STYLES MANIPULATION
    // -------------------

    (function() {
        var getStyleHooks = {},
            setStyleHooks = {},
            reDash = /\-./g,
            reCamel = /[A-Z]/g,
            directions = ["Top", "Right", "Bottom", "Left"],
            dashSeparatedToCamelCase = function(str) { return str[1].toUpperCase(); },
            camelCaseToDashSeparated = function(str) { return "-" + str.toLowerCase(); },
            computed = _getComputedStyle(documentElement),
            // In Opera CSSStyleDeclaration objects returned by _getComputedStyle have length 0
            props = computed.length ? _slice(computed) : _map(_keys(computed), function(key) { return key.replace(reCamel, camelCaseToDashSeparated); });

        _forEach(props, function(propName) {
            var prefix = propName[0] === "-" ? propName.substr(1, propName.indexOf("-", 1) - 1) : null,
                unprefixedName = prefix ? propName.substr(prefix.length + 2) : propName,
                stylePropName = propName.replace(reDash, dashSeparatedToCamelCase);

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

        // normalize property shortcuts
        _forOwn({
            font: ["fontStyle", "fontSize", "/", "lineHeight", "fontFamily"],
            padding: _map(directions, function(dir) { return "padding" + dir }),
            margin: _map(directions, function(dir) { return "margin" + dir }),
            "border-width": _map(directions, function(dir) { return "border" + dir + "Width" }),
            "border-style": _map(directions, function(dir) { return "border" + dir + "Style" })
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
         * @param  {String} name     property name
         * @return {String} property value
         */
        $Element.prototype.getStyle = function(name) {
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

            return result;
        };

        /**
         * Set css style for element
         * @param {String|Object} name  property name or key/value pair
         * @param {String}        value property value
         * @return {$Element}
         */
        $Element.prototype.setStyle = function(name, value) {
            var nameType = typeof name,
                cssText = "", hook;

            if (nameType === "string") {
                hook = setStyleHooks[name];

                cssText = ";" + (hook ? hook(name, value) : name + ":" + (typeof value === "number" ? value + "px" : value));
            } else if (nameType === "object") {
                _forOwn(name, function(value, key) {
                    hook = setStyleHooks[key];

                    cssText += ";" + (hook ? hook(key, value) : key + ":" + (typeof value === "number" ? value + "px" : value));
                });
            } else {
                throw _makeError("setStyle", this);
            }

            this._node.style.cssText += cssText;

            return this;
        };
    })();

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

                return multiple ? new $CompositeElement(nodes) : $Element(it);
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
                    node;

                if (!document.addEventListener) {
                    // fix IE8 bug with children collection
                    children = _filter(children, function(node) { return node.nodeType === 1 });
                }

                if (multiple) {
                    return new $CompositeElement(!matcher ? children : _filter(children, matcher.test, matcher));
                }

                if (index < 0) index = children.length + index;

                node = children[index];

                return $Element(!matcher || matcher.test(node) ? node : null);
            };
        }

        /**
         * Find next sibling element filtered by optional selector
         * @param {String} [selector] css selector
         * @return {$Element} matched element
         * @function
         */
        $Element.prototype.next = makeTraversingMethod("nextSibling");

        /**
         * Find previous sibling element filtered by optional selector
         * @param {String} [selector] css selector
         * @return {$Element} matched element
         * @function
         */
        $Element.prototype.prev = makeTraversingMethod("previousSibling");

        /**
         * Find all next sibling elements filtered by optional selector
         * @param {String} [selector] css selector
         * @return {$Element} collection of matched elements
         * @function
         */
        $Element.prototype.nextAll = makeTraversingMethod("nextSibling", true);

        /**
         * Find all previous sibling elements filtered by optional selector
         * @param {String} [selector] css selector
         * @return {$Element} collection of matched elements
         * @function
         */
        $Element.prototype.prevAll = makeTraversingMethod("previousSibling", true);

        /**
         * Find parent element filtered by optional selector
         * @param {String} [selector] css selector
         * @return {$Element} matched element
         * @function
         */
        $Element.prototype.parent = makeTraversingMethod("parentNode");

        /**
         * Return child element by index filtered by optional selector
         * @param  {Number} index child index
         * @param  {String} [selector] css selector
         * @return {$Element} matched child
         * @function
         * @example
         * var body = DOM.find("body");
         *
         * body.child(0); // => first child
         * body.child(-1); // => last child
         */
        $Element.prototype.child = makeChildTraversingMethod(false);

        /**
         * Fetch children elements filtered by optional selector
         * @param  {String} [selector] css selector
         * @return {$Element} collection of matched elements
         * @function
         */
        $Element.prototype.children = makeChildTraversingMethod(true);
    })();

    /**
     * Show element
     * @return {$Element}
     */
    $Element.prototype.show = function() {
        this.set("aria-hidden", false);

        return this;
    };

    /**
     * Hide element
     * @return {$Element}
     */
    $Element.prototype.hide = function() {
        this.set("aria-hidden", true);

        return this;
    };

    /**
     * Toggle element visibility
     * @return {$Element}
     */
    $Element.prototype.toggle = function() {
        this.set("aria-hidden", !this.isHidden());

        return this;
    };

    /**
     * Check is element is hidden
     * @return {Boolean} true if element is hidden
     */
    $Element.prototype.isHidden = function() {
        return this.get("aria-hidden") === "true";
    };

    /**
     * Check if element has focus
     * @return {Boolean} true if current element is focused
     */
    $Element.prototype.isFocused = function() {
        return this._node === document.activeElement;
    };

    /**
     * Used to represent a collection of DOM elements (length >= 1)
     * @name $CompositeElement
     * @param elements {Array|Object} array or array-like object with native elements
     * @extends $Element
     * @constructor
     * @private
     */
    function $CompositeElement(elements) {
        Array.prototype.push.apply(this, _map(elements, $Element));
    }

    $CompositeElement.prototype = new $Element();

    _forIn($CompositeElement.prototype, function(value, key, proto) {
        if (typeof value === "function") {
            var isGetter = value.toString().indexOf("return this;") < 0,
                // this will be the arguments object
                functor = function(el) { value.apply(el, this); };

            proto[key] = isGetter ? function() {} : function() {
                return _forEach(this, functor, arguments);
            };
        }
    });

    // ELEMENT COLLECTION EXTESIONS
    // ----------------------------

    (function() {
        var makeCollectionMethod = function(fn) {
                var code = fn.toString();
                // extract function body
                code = code.substring(code.indexOf("{") + 1, code.lastIndexOf("}"));
                // use this variable unstead of a
                code = code.replace(/a([^\w])/g, function(a, symbol) { return "this" + symbol; });
                // compile the function
                return Function("cb", "that", code);
            };

        _extend($Element.prototype, {
            /**
             * Executes callback on each element in the collection
             * @memberOf $Element.prototype
             * @param  {Function} callback callback function
             * @param  {Object}   [context]  callback context
             * @return {$Element}
             * @function
             */
            each: makeCollectionMethod(_forEach),

            /**
             * Checks if the callback returns true for any element in the collection
             * @memberOf $Element.prototype
             * @param  {Function} callback   callback function
             * @param  {Object}   [context]  callback context
             * @return {Boolean} true, if any element in the collection return true
             * @function
             */
            some: makeCollectionMethod(_some),

            /**
             * Checks if the callback returns true for all elements in the collection
             * @memberOf $Element.prototype
             * @param  {Function} callback   callback function
             * @param  {Object}   [context]  callback context
             * @return {Boolean} true, if all elements in the collection returns true
             * @function
             */
            every: makeCollectionMethod(_every),

            /**
             * Creates an array of values by running each element in the collection through the callback
             * @memberOf $Element.prototype
             * @param  {Function} callback   callback function
             * @param  {Object}   [context]  callback context
             * @return {Array} new array of the results of each callback execution
             * @function
             */
            map: makeCollectionMethod(_map),

            /**
             * Examines each element in a collection, returning an array of all elements the callback returns truthy for
             * @memberOf $Element.prototype
             * @param  {Function} callback   callback function
             * @param  {Object}   [context]  callback context
             * @return {Array} new array with elements where callback returned true
             * @function
             */
            filter: makeCollectionMethod(_filter),

            /**
             * Boils down a list of values into a single value (from start to end)
             * @memberOf $Element.prototype
             * @param  {Function} callback callback function
             * @param  {Object}   [memo]   initial value of the accumulator
             * @return {Object} the accumulated value
             * @function
             */
            reduce: makeCollectionMethod(_foldl),

            /**
             * Boils down a list of values into a single value (from end to start)
             * @memberOf $Element.prototype
             * @param  {Function} callback callback function
             * @param  {Object}   [memo]   initial value of the accumulator
             * @return {Object} the accumulated value
             * @function
             */
            reduceRight: makeCollectionMethod(_foldr),

            /**
             * Executes code in a 'unsafe' block there the first callback argument is native DOM
             * object. Use only when you need to communicate better-dom with third party scripts!
             * @memberOf $Element.prototype
             * @param  {Function} block unsafe block body (nativeNode, element, index)
             */
            unsafe: function(block) {
                _forEach(this, function(el, index) { block(el._node, el, index) });

                return this;
            }
        });
    }());

    /**
     * Used to indicate an empty DOM element (length == 0)
     * @name $NullElement
     * @extends $CompositeElement
     * @constructor
     * @private
     */
    function $NullElement() {}

    $NullElement.prototype = new $CompositeElement();

    // GLOBAL API
    // ----------

    /**
     * Global object to access DOM
     * @namespace DOM
     * @extends $Node
     */
    var DOM = new $Node(document);

    DOM.version = "1.4.1";

    // WATCH CALLBACK
    // --------------

    /**
     * Execute callback when element with specified selector is found in document tree
     * @memberOf DOM
     * @param {String} selector css selector
     * @param {Fuction} callback event handler
     * @param {Boolean} [once] execute callback only at the first time
     * @function
     */
    DOM.watch = (function() {
        var animId = 19968, // use Chinese characters for animation names starting from 4E00
            watchers, cssPrefix, scripts, behaviorUrl;

        if (window.CSSKeyframesRule || !document.attachEvent) {
            // Inspired by trick discovered by Daniel Buchner:
            // https://github.com/csuwldcat/SelectorListener
            cssPrefix = CSSRule.KEYFRAMES_RULE ? "" : "-webkit-";
            watchers = {};

            document.addEventListener(cssPrefix ? "webkitAnimationStart" : "animationstart", function(e) {
                var entry = watchers[e.animationName],
                    node = e.target;

                if (entry) {
                    // MUST cancelBubbling first because of extra calls in firefox
                    if (entry.once) node.addEventListener(e.type, entry.once, false);

                    entry.callback($Element(node));
                }
            }, false);

            return function(selector, callback, once) {
                var animationName = String.fromCharCode(animId++),
                    animations = [animationName];

                _forOwn(watchers, function(entry, key) {
                    if (entry.selector === selector) animations.push(key);
                });

                DOM.importStyles("@" + cssPrefix + "keyframes " + animationName, "1% {opacity: .99}");

                DOM.importStyles(selector, {
                    "animation-duration": "1ms",
                    "animation-name": animations.join() + " !important"
                });

                watchers[animationName] = {
                    selector: selector,
                    callback: callback,
                    once: once && function(e) {
                        if (e.animationName === animationName) e.stopPropagation();
                    }
                };
            };
        } else {
            scripts = document.scripts;
            behaviorUrl = scripts[scripts.length - 1].getAttribute("data-htc");
            watchers = [];

            document.attachEvent("ondataavailable", function() {
                var e = window.event,
                    node = e.srcElement;

                if (e.srcUrn === "dataavailable") {
                    _forEach(watchers, function(entry) {
                        // do not execute callback if it was previously excluded
                        if (_some(e.detail, function(x) { return x === entry.callback })) return;

                        if (entry.matcher.test(node)) {
                            if (entry.once) node.attachEvent("on" + e.type, entry.once);

                            _defer(function() { entry.callback($Element(node)) });
                        }
                    });
                }
            });

            return function(selector, callback, once) {
                var behaviorExists = _some(watchers, function(x) { return x.matcher.selector === selector });

                if (behaviorExists) {
                    // do safe call of the callback for each matched element
                    // because the behaviour is already attached to selector
                    DOM.findAll(selector).each(function(el) {
                        _defer(function() { callback(el) });
                    });
                }

                watchers.push({
                    callback: callback,
                    matcher: new SelectorMatcher(selector),
                    once: once && function() {
                        var e = window.event;

                        if (e.srcUrn === "dataavailable") {
                            (e.detail = e.detail || []).push(callback);
                        }
                    }
                });

                if (!behaviorExists) DOM.importStyles(selector, {behavior: "url(" + behaviorUrl + ")"});
            };
        }
    }());

    // CREATE ELEMENT
    // --------------

    (function(){
        var rquick = /^[a-z]+$/;

        /**
         * Create a $Element instance
         * @memberOf DOM
         * @param  {Mixed}          value        native element or HTMLString or EmmetString
         * @param  {Object}         [attributes] key/value pairs of the element attributes
         * @param  {Object}         [styles]     key/value pairs of the element styles
         * @return {$Element} element
         */
        DOM.create = function(value, attributes, styles) {
            if (typeof value === "string") {
                if (rquick.test(value)) {
                    value = new $Element(document.createElement(value));
                } else {
                    if (value[0] !== "<") value = DOM.parseTemplate(value);

                    var sandbox = document.createElement("div");

                    sandbox.innerHTML = value;

                    if (sandbox.childNodes.length === 1 && sandbox.firstChild.nodeType === 1) {
                        // remove temporary element
                        sandbox = sandbox.removeChild(sandbox.firstChild);
                    }

                    value = new $Element(sandbox);
                }

                if (attributes) value.set(attributes);
                if (styles) value.setStyle(styles);

                return value;
            }

            if (value.nodeType === 1) return $Element(value);

            throw _makeError("create", this);
        };
    })();

    (function(){
        var watchers = {};

        /**
         * Define a DOM extension
         * @memberOf DOM
         * @param  {String}          selector extension css selector
         * @param  {Object|Function} mixins   extension mixins/constructor function
         * @example
         * DOM.extend(".myplugin", {
         *     constructor: function() {
         *         // initialize extension
         *     },
         *     method: function() {
         *         // this method will be mixed into every matched element
         *     }
         * });
         */
        DOM.extend = function(selector, mixins) {
            if (typeof mixins === "function") mixins = {constructor: mixins};

            if (!mixins || typeof mixins !== "object") {
                throw _makeError("extend", this);
            }

            if (selector === "*") {
                // extending element prototype
                _extend($Element.prototype, mixins);
            } else {
                var watcher = function(el) {
                        _extend(el, mixins);

                        if (mixins.hasOwnProperty("constructor")) {
                            mixins.constructor.apply(el);

                            el.constructor = $Element;
                        }
                    };

                (watchers[selector] = watchers[selector] || []).push(watcher);

                DOM.watch(selector, watcher, true);
            }

            return this;
        };

        /**
         * Synchronously return dummy {@link $Element} instance specified for optional selector
         * @memberOf DOM
         * @param  {Mixed} [content] mock element content
         * @return {$Element} mock instance
         */
        DOM.mock = function(content) {
            var el = content ? DOM.create(content) : new $NullElement(),
                applyWatchers = function(el) {
                    _forOwn(watchers, function(watchers, selector) {
                        if (el.matches(selector)) {
                            _forEach(watchers, function(watcher) { watcher(el); });
                        }
                    });

                    el.children().each(applyWatchers);
                };

            if (content) applyWatchers(el);

            return el;
        };
    }());

    // EMMET EXPRESSIONS PARSER
    // ------------------------

    (function() {
        // operator type / priority object
        var operators = {"(": 1,")": 2,"^": 3,">": 4,"+": 4,"*": 5,"}": 5,"{": 6,"]": 5,"[": 6,".": 7,"#": 8,":": 9},
            reTextTag = /<\?>|<\/\?>/g,
            reAttr = /([\w\-]+)(?:=((?:"((?:\\.|[^"])*)")|(?:'((?:\\.|[^'])*)')|([^\s\]]+)))?/g,
            reIndex = /(\$+)(?:@(-)?([0-9]+)?)?/g,
            normalizeAttrs = function(term, name, value, a, b, simple) {
                // always wrap attribute values with quotes if they don't exist
                return name + "=" + (simple || !value ? "\"" + (value || "") + "\"" : value);
            },
            injectTerm = function(term, first) {
                return function(el) {
                    var index = first ? el.indexOf(">") : el.lastIndexOf("<");
                    // inject term into the html string
                    return el.substr(0, index) + term + el.substr(index);
                };
            },
            makeTerm = (function() {
                var results = {};

                // populate empty tags
                _forEach("area base br col hr img input link meta param command keygen source".split(" "), function(tag) {
                    results[tag] = "<" + tag + ">";
                });

                return function(tag) {
                    var result = results[tag];

                    if (!result) {
                        results[tag] = result = "<" + tag + "></" + tag + ">";
                    }

                    return [result];
                };
            }()),
            makeIndexedTerm = function(term) {
                return function(_, i, arr) {
                    return term.replace(reIndex, function(expr, fmt, sign, base) {
                        var index = (sign ? arr.length - i - 1 : i) + (base ? base | 0 : 1);
                        // make zero-padding index string
                        return (fmt + index).slice(-fmt.length).split("$").join("0");
                    });
                };
            },
            toString = function(term) {
                return typeof term === "string" ? term : term.join("");
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
                term = "",
                i, n, str, priority, skip, node;

            // parse exrpression into RPN

            for (i = 0, n = template.length; i < n; ++i) {
                str = template[i];
                // concat .c1.c2 into single space separated class string
                if (str === "." && stack[0] === ".") str = " ";

                priority = operators[str];

                if (priority && (!skip || skip === str)) {
                    // append empty tag for text nodes or put missing '>' operator into the stack
                    if (str === "{") {
                        if (term) {
                            stack.unshift(">");
                        } else {
                            term = "?";
                        }
                    }
                    // remove redundat ^ operators from the stack when more than one exists
                    if (str === "^" && stack[0] === "^") stack.shift();

                    if (term) {
                        output.push(term);
                        term = "";
                    }

                    if (str !== "(") {
                        while (operators[stack[0]] > priority) {
                            output.push(stack.shift());
                            // for ^ operator stop shifting when the first > is found
                            if (str === "^" && output[output.length - 1] === ">") break;
                        }
                    }

                    if (str === ")") {
                        stack.shift(); // remove "(" symbol from stack
                    } else if (!skip) {
                        stack.unshift(str);

                        if (str === "[") skip = "]";
                        if (str === "{") skip = "}";
                    } else {
                        skip = false;
                    }
                } else {
                    term += str;
                }
            }

            if (term) stack.unshift(term);

            output.push.apply(output, stack);

            // transform RPN into html nodes

            stack = [];

            if (output.length === 1) output.push(">");

            for (i = 0, n = output.length; i < n; ++i) {
                str = output[i];

                if (str in operators) {
                    term = stack.shift();
                    node = stack.shift() || "?";

                    if (typeof node === "string") node = makeTerm(node);

                    switch(str) {
                    case ".":
                        term = injectTerm(" class=\"" + term + "\"", true);
                        break;

                    case "#":
                        term = injectTerm(" id=\"" + term + "\"", true);
                        break;

                    case ":":
                        term = injectTerm(" type=\"" + term + "\"", true);
                        break;

                    case "[":
                        term = injectTerm(" " + term.replace(reAttr, normalizeAttrs), true);
                        break;

                    case "{":
                        term = injectTerm(term);
                        break;

                    case "*":
                        node = _map(Array(term | 0), makeIndexedTerm(toString(node)));
                        break;

                    default:
                        if (typeof term === "string") term = makeTerm(term)[0];

                        term = toString(term);

                        if (str === ">") {
                            term = injectTerm(term);
                        } else {
                            node.push(term);
                        }
                    }

                    str = typeof term === "function" ? _map(node, term) : node;
                }

                stack.unshift(str);
            }

            return toString(stack[0]).replace(reTextTag, "");
        };
    })();

    // IMPORT STYLES
    // -------------

    (function() {
        var styleNode = documentElement.firstChild.appendChild(document.createElement("style")),
            styleSheet = styleNode.sheet || styleNode.styleSheet;

        /**
         * Append global css styles
         * @memberOf DOM
         * @param {String|Object} selector css selector or object with selector/rules pairs
         * @param {String} styles css rules
         */
        DOM.importStyles = function(selector, styles) {
            if (typeof styles === "object") {
                var obj = {_node: {style: {cssText: ""}}};

                $Element.prototype.setStyle.call(obj, styles);

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

            return this;
        };

        DOM.importStyles("[aria-hidden=true]", "display:none");
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

    // IMPORT SCRIPTS
    // --------------

    /**
     * Import external scripts on the page and call optional callback when it will be done
     * @memberOf DOM
     * @param {...String} urls       script file urls
     * @param {Function}  [callback] callback that is triggered when all scripts are loaded
     */
    DOM.importScripts = function() {
        var args = _slice(arguments),
            body = DOM.find("body"),
            n = args.length - 1,
            callback;

        if (n > 0 && typeof args[n] === "function") {
            callback = (function(callback) { if (!--n) callback() }(args.pop()));
        }

        _forEach(args, function(url) {
            if (typeof url !== "string") throw _makeError("importScripts", this);

            body.append(DOM.create("script", {src: url, onload: callback})).child(-1).remove();
        });

        return this;
    };

    // IMPORT STRINGS
    // --------------

    /**
     * Import global i18n string(s)
     * @memberOf DOM
     * @param {String|Object}  key     string key
     * @param {String}         pattern string pattern
     * @param {String}         [lang]  string language
     * @function
     * @example
     * // have element &#60;a data-i18n="str.1" data-user="Maksim"&#62;&#60;a&#62; in markup
     * DOM.importStrings("str.1", "Hello {user}!");
     * DOM.importStrings("str.1", "Привет!", "ru");
     * // the link text now is "Hello Maksim!"
     * link.set("lang", "ru");
     * // the link text now is "Привет!"
     */
    DOM.importStrings = (function() {
        var rparam = /\{([a-z\-]+)\}/g,
            toContentAttr = function(term, attr) { return "\"attr(data-" + attr + ")\"" };

        return function(key, pattern, lang) {
            var keyType = typeof key,
                selector, content;

            if (keyType === "string") {
                selector = "[data-i18n=\"" + key + "\"]";

                if (lang) selector += ":lang(" + lang + ")";

                content = "content:\"" + pattern.replace(rparam, toContentAttr) + "\"";

                DOM.importStyles(selector + ":before", content);
            } else if (keyType === "object") {
                lang = pattern;

                _forOwn(key, function(pattern, key) {
                    DOM.importStrings(key, pattern, lang);
                });
            } else {
                throw _makeError("importStrings", this);
            }

            return this;
        };
    }());

    DOM.importStyles("[data-i18n]:before", "content:'???'attr(data-i18n)'???'");

    /**
     * Return current page title
     * @memberOf DOM
     * @return {String} current page title
     */
    DOM.getTitle = function() {
        return document.title;
    };

    /**
     * Change current page title
     * @memberOf DOM
     * @param  {String} value new title
     * @return {DOM}
     */
    DOM.setTitle = function(value) {
        if (typeof value !== "string") {
            throw _makeError("setTitle", this);
        }
        
        document.title = value;

        return this;
    };

    // REGISTER API
    // ------------

    window.DOM = DOM;

    if (typeof define === "function" && define.amd) {
        define("better-dom", function() { return DOM; });
    }
})(window, document, document.documentElement);
