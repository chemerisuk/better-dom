/**
 * better-dom: Live extension playground
 * @version 4.0.0-beta.2 Fri, 25 May 2018 15:35:45 GMT
 * @link https://github.com/chemerisuk/better-dom
 * @copyright 2018 Maksim Chemerisuk
 * @license MIT
 */
(function () {
    "use strict";

    var WINDOW = window;
    var DOCUMENT = document;
    var HTML = DOCUMENT.documentElement;

    var UNKNOWN_NODE = 0;
    var ELEMENT_NODE = DOCUMENT.ELEMENT_NODE;
    var DOCUMENT_NODE = DOCUMENT.DOCUMENT_NODE;
    var RETURN_THIS = function () {
        return this;
    };
    var RETURN_TRUE = function () {
        return true;
    };
    var RETURN_FALSE = function () {
        return false;
    };
    var VENDOR_PREFIXES = ["Webkit", "O", "Moz", "ms"];
    var FAKE_ANIMATION_NAME = "__v4000000-beta002__";

    var WEBKIT_PREFIX = WINDOW.WebKitAnimationEvent ? "-webkit-" : "";

    var util$index$$arrayProto = Array.prototype;

    var util$index$$every = util$index$$arrayProto.every;
    var util$index$$each = util$index$$arrayProto.forEach;
    var util$index$$filter = util$index$$arrayProto.filter;
    var util$index$$map = util$index$$arrayProto.map;
    var util$index$$slice = util$index$$arrayProto.slice;
    var util$index$$isArray = Array.isArray;
    var util$index$$keys = Object.keys;
    var util$index$$raf = WINDOW.requestAnimationFrame;

    function util$index$$computeStyle(node) {
        return node.ownerDocument.defaultView.getComputedStyle(node);
    }

    function util$index$$injectElement(node) {
        if (node && node.nodeType === ELEMENT_NODE) {
            return node.ownerDocument.getElementsByTagName("head")[0].appendChild(node);
        }
    }
    function MethodError(methodName, args) {
        var type = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : "$Element";

        var url = "http://chemerisuk.github.io/better-dom/" + type + ".html#" + methodName,
            line = "invalid call `" + type + (type === "DOM" ? "." : "#") + methodName + "(";

        line += util$index$$map.call(args, String).join(", ") + ")`. ";

        this.message = line + "Check " + url + " to verify the arguments";
    }

    MethodError.prototype = new TypeError();

    function StaticMethodError(methodName, args) {
        MethodError.call(this, methodName, args, "DOM");
    }

    StaticMethodError.prototype = new TypeError();

    function DocumentTypeError(methodName, args) {
        MethodError.call(this, methodName, args, "$Document");
    }

    DocumentTypeError.prototype = new TypeError();
    function node$index$$$Node(node) {
        if (node) {
            // use a generated property to store a reference
            // to the wrapper for circular object binding
            node["__4000000-beta002__"] = this;
            this["__4000000-beta002__"] = node;
        }
    }

    node$index$$$Node.prototype = {
        toString: function () {
            return "";
        },
        valueOf: function () {
            return UNKNOWN_NODE;
        } // undefined
    };

    var document$index$$LIVE_EXTENSION_KEYFRAMES = "@" + WEBKIT_PREFIX + "keyframes " + FAKE_ANIMATION_NAME;
    var document$index$$LIVE_EXTENSION_KEYFRAMES_BODY = "from {opacity:.99} to {opacity:1}";

    function document$index$$$Document(node) {
        var _this = this;

        if (this instanceof document$index$$$Document) {
            node$index$$$Node.call(this, node);
            // declare fake animation for live extensions
            WINDOW.setTimeout(function () {
                _this.importStyles(document$index$$LIVE_EXTENSION_KEYFRAMES, document$index$$LIVE_EXTENSION_KEYFRAMES_BODY);
            }, 0);
        } else if (node) {
            // create a wrapper only once for each native element
            return node["__4000000-beta002__"] || new document$index$$$Document(node);
        } else {
            return new document$index$$$Document();
        }
    }

    var document$index$$DocumentProto = new node$index$$$Node();

    document$index$$$Document.prototype = document$index$$DocumentProto;

    document$index$$DocumentProto.valueOf = function () {
        var node = this["__4000000-beta002__"];
        return node ? DOCUMENT_NODE : UNKNOWN_NODE;
    };

    document$index$$DocumentProto.toString = function () {
        return "#document";
    };
    function element$index$$$Element(node) {
        if (this instanceof element$index$$$Element) {
            node$index$$$Node.call(this, node);
        } else if (node) {
            // create a wrapper only once for each native element
            return node["__4000000-beta002__"] || new element$index$$$Element(node);
        } else {
            return new element$index$$$Element();
        }
    }

    var element$index$$ElementProto = new node$index$$$Node();

    element$index$$$Element.prototype = element$index$$ElementProto;

    element$index$$ElementProto.valueOf = function () {
        var node = this["__4000000-beta002__"];
        return node ? ELEMENT_NODE : UNKNOWN_NODE;
    };

    element$index$$ElementProto.toString = function () {
        var node = this["__4000000-beta002__"];

        return node ? "<" + node.tagName.toLowerCase() + ">" : "#unknown";
    };

    var index$$DOM = new document$index$$$Document(WINDOW.document);
    var index$$_DOM = WINDOW.DOM;

    index$$DOM.$ = function (node) {
        var nodeType = node && node.nodeType;

        if (nodeType === ELEMENT_NODE) {
            return element$index$$$Element(node);
        } else if (nodeType === DOCUMENT_NODE) {
            return document$index$$$Document(node);
        } else {
            return new node$index$$$Node();
        }
    };

    index$$DOM.noConflict = function () {
        if (WINDOW.DOM === index$$DOM) {
            WINDOW.DOM = index$$_DOM;
        }

        return index$$DOM;
    };

    WINDOW.DOM = index$$DOM;

    var document$create$$reQuick = /^<([a-zA-Z-]+)\/?>$/;
    var document$create$$sandbox = DOCUMENT.createElement("body");

    function document$create$$makeMethod(all) {
        return function (value) {
            var node = this["__4000000-beta002__"];

            if (!node || typeof value !== "string") {
                throw new MethodError("create" + all, arguments);
            }

            var result = all ? [] : null;

            var quickMatch = !result && document$create$$reQuick.exec(value);
            if (quickMatch) {
                return new element$index$$$Element(node.createElement(quickMatch[1]));
            }

            document$create$$sandbox.innerHTML = value.trim(); // parse HTML string

            for (var it; it = document$create$$sandbox.firstElementChild;) {
                document$create$$sandbox.removeChild(it); // detach element from the sandbox

                if (node !== DOCUMENT) {
                    // adopt node for external documents
                    it = node.adoptNode(it);
                }

                if (result) {
                    result.push(new element$index$$$Element(it));
                } else {
                    result = new element$index$$$Element(it);
                    // need only the first element
                    break;
                }
            }

            return result || new element$index$$$Element();
        };
    }

    document$index$$$Document.prototype.create = document$create$$makeMethod("");

    document$index$$$Document.prototype.createAll = document$create$$makeMethod("All");

    // Helper for css selectors

    var util$selectormatcher$$rquickIs = /^(\w*)(?:#([\w\-]+))?(?:\[([\w\-\=]+)\])?(?:\.([\w\-]+))?$/,
        util$selectormatcher$$propName = VENDOR_PREFIXES.concat(null).map(function (p) {
        return (p ? p.toLowerCase() + "M" : "m") + "atchesSelector";
    }).reduceRight(function (propName, p) {
        return propName || p in HTML && p;
    }, null);

    var util$selectormatcher$$default = function (selector, context) {
        if (typeof selector !== "string") return null;

        var quick = util$selectormatcher$$rquickIs.exec(selector);

        if (quick) {
            // Quick matching is inspired by jQuery:
            //   0  1    2   3          4
            // [ _, tag, id, attribute, class ]
            if (quick[1]) quick[1] = quick[1].toLowerCase();
            if (quick[3]) quick[3] = quick[3].split("=");
            if (quick[4]) quick[4] = " " + quick[4] + " ";
        }

        return function (node) {
            var result, found;
            if (!quick && !util$selectormatcher$$propName) {
                found = (context || node.ownerDocument).querySelectorAll(selector);
            }

            for (; node && node.nodeType === 1; node = node.parentNode) {
                if (quick) {
                    result = (!quick[1] || node.nodeName.toLowerCase() === quick[1]) && (!quick[2] || node.id === quick[2]) && (!quick[3] || (quick[3][1] ? node.getAttribute(quick[3][0]) === quick[3][1] : node.hasAttribute(quick[3][0]))) && (!quick[4] || (" " + node.className + " ").indexOf(quick[4]) >= 0);
                } else {
                    if (util$selectormatcher$$propName) {
                        result = node[util$selectormatcher$$propName](selector);
                    } else {
                        for (var i = 0, n = found.length; i < n; ++i) {
                            var n = found[i];

                            if (n === node) return n;
                        }
                    }
                }

                if (result || !context || node === context) break;
            }

            return result && node;
        };
    };

    // Inspired by trick discovered by Daniel Buchner:
    // https://github.com/csuwldcat/SelectorListener

    var document$extend$$extensions = [];
    var document$extend$$EVENT_TYPE = WEBKIT_PREFIX ? "webkitAnimationStart" : "animationstart";
    var document$extend$$CSS_IMPORT_TEXT = [WEBKIT_PREFIX + "animation-name:" + FAKE_ANIMATION_NAME + " !important", WEBKIT_PREFIX + "animation-duration:1ms !important"].join(";");

    function document$extend$$applyLiveExtension(definition, node) {
        var el = element$index$$$Element(node);
        var ctr = definition.constructor;
        // apply all element mixins
        Object.keys(definition).forEach(function (mixinName) {
            var mixinProperty = definition[mixinName];
            if (mixinProperty !== ctr) {
                el[mixinName] = mixinProperty;
            }
        });

        if (ctr) ctr.call(el);
    }

    document$index$$$Document.prototype.extend = function (selector, definition) {
        var node = this["__4000000-beta002__"];

        if (!node) return this;

        if (arguments.length === 1 && typeof selector === "object") {
            // handle case when $Document protytype is extended
            util$index$$keys(selector).forEach(function (key) {
                document$index$$$Document.prototype[key] = selector[key];
            });

            return this;
        } else if (selector === "*") {
            // handle case when $Element protytype is extended
            util$index$$keys(definition).forEach(function (key) {
                element$index$$$Element.prototype[key] = definition[key];
            });

            return this;
        }

        if (typeof definition === "function") {
            definition = { constructor: definition };
        }

        if (!definition || typeof definition !== "object") {
            throw new DocumentTypeError("extend", arguments);
        }

        var matcher = util$selectormatcher$$default(selector);

        document$extend$$extensions.push([matcher, definition]);
        // use capturing to suppress internal animationstart events
        node.addEventListener(document$extend$$EVENT_TYPE, function (e) {
            var node = e.target;

            if (e.animationName === FAKE_ANIMATION_NAME && matcher(node)) {
                e.stopPropagation(); // this is an internal event
                // prevent any future events
                node.style.setProperty(WEBKIT_PREFIX + "animation-name", "none", "important");

                document$extend$$applyLiveExtension(definition, node);
            }
        }, true);

        // initialize extension manually to make sure that all elements
        // have appropriate methods before they are used in other DOM.extend
        // also fix cases when a matched element already has another LE
        util$index$$each.call(node.querySelectorAll(selector), function (node) {
            // prevent any future events
            node.style.setProperty(WEBKIT_PREFIX + "animation-name", "none", "important");
            // use timeout to invoke constructor safe and async
            WINDOW.setTimeout(function () {
                document$extend$$applyLiveExtension(definition, node);
            }, 0);
        });

        // subscribe selector to a fake animation
        this.importStyles(selector, document$extend$$CSS_IMPORT_TEXT);
    };

    document$index$$$Document.prototype.mock = function (content) {
        if (!content) return new element$index$$$Element();

        var result = this.create(content),
            applyExtensions = function (node) {
            document$extend$$extensions.forEach(function (args) {
                var matcher = args[0];
                var definition = args[1];

                if (matcher(node)) {
                    document$extend$$applyLiveExtension(definition, node);
                }
            });

            util$index$$each.call(node.children, applyExtensions);
        };

        if (document$extend$$extensions.length) {
            applyExtensions(result["__4000000-beta002__"]);
        }

        return result;
    };

    document$index$$$Document.prototype.importScripts = function () {
        var _this2 = this,
            _arguments = arguments;

        for (var _len = arguments.length, urls = Array(_len), _key = 0; _key < _len; _key++) {
            urls[_key] = arguments[_key];
        }

        var callback = function () {
            var node = _this2["__4000000-beta002__"];

            if (!node) return;

            var arg = urls.shift(),
                argType = typeof arg,
                script;

            if (argType === "string") {
                script = node.createElement("script");
                script.src = arg;
                script.onload = callback;
                script.async = true;

                util$index$$injectElement(script);
            } else if (argType === "function") {
                arg();
            } else if (arg) {
                throw new DocumentTypeError("importScripts", _arguments);
            }
        };

        callback();
    };

    document$index$$$Document.prototype.importStyles = function (selector, cssText) {
        var node = this["__4000000-beta002__"];

        if (!node) return;

        var styleSheet = this["__styles4000000-beta002__"];

        if (!styleSheet) {
            var styleNode = util$index$$injectElement(node.createElement("style"));

            styleSheet = styleNode.sheet || styleNode.styleSheet;
            // store object internally
            this["__styles4000000-beta002__"] = styleSheet;
        }

        if (!cssText && typeof selector === "string") {
            cssText = selector;
            selector = "@media screen";
        }

        if (typeof selector !== "string" || typeof cssText !== "string") {
            throw new DocumentTypeError("importStyles", arguments);
        }

        // insert rules one by one because of several reasons:
        // 1. IE8 does not support comma in a selector string
        // 2. if one selector fails it doesn't break others
        selector.split(",").forEach(function (selector) {
            try {
                styleSheet.insertRule(selector + "{" + cssText + "}", styleSheet.cssRules.length);
            } catch (err) {
                // silently ignore invalid rules
            }
        });
    };

    node$index$$$Node.prototype.clone = function (deep) {
        if (typeof deep !== "boolean") {
            throw new MethodError("clone", arguments);
        }

        var node = this["__4000000-beta002__"];

        if (node) {
            var clonedNode = node.cloneNode(deep);

            if (this instanceof element$index$$$Element) {
                return new element$index$$$Element(clonedNode);
            } else if (this instanceof document$index$$$Document) {
                return new document$index$$$Document(clonedNode);
            }
        }

        return new node$index$$$Node();
    };

    node$index$$$Node.prototype.contains = function (element) {
        var node = this["__4000000-beta002__"];

        if (!node) return false;

        if (element instanceof element$index$$$Element) {
            var otherNode = element["__4000000-beta002__"];

            if (otherNode === node) return true;
            if (node.contains) {
                return node.contains(otherNode);
            } else {
                return node.compareDocumentPosition(otherNode) & 16;
            }
        }

        throw new MethodError("contains", arguments);
    };

    // big part of code inspired by Sizzle:
    // https://github.com/jquery/sizzle/blob/master/sizzle.js

    var node$find$$rquick = /^(?:(\w+)|\.([\w\-]+))$/;
    var node$find$$rescape = /'|\\/g;

    function node$find$$makeMethod(methodName, all) {
        return function (selector) {
            if (typeof selector !== "string") {
                throw new MethodError(methodName, arguments);
            }

            var node = this["__4000000-beta002__"];

            if (!node) return all ? [] : new node$index$$$Node();

            var quickMatch = node$find$$rquick.exec(selector);
            var result, old, nid, context;

            if (quickMatch) {
                if (quickMatch[1]) {
                    // speed-up: "TAG"
                    result = node.getElementsByTagName(selector);
                } else {
                    // speed-up: ".CLASS"
                    result = node.getElementsByClassName(quickMatch[2]);
                }

                if (result && !all) result = result[0];
            } else {
                old = true;
                context = node;

                if (!(this instanceof document$index$$$Document)) {
                    // qSA works strangely on Element-rooted queries
                    // We can work around this by specifying an extra ID on the root
                    // and working up from there (Thanks to Andrew Dupont for the technique)
                    if (old = node.getAttribute("id")) {
                        nid = old.replace(node$find$$rescape, "\\$&");
                    } else {
                        nid = "__DOM4000000-beta002__";
                        node.setAttribute("id", nid);
                    }

                    nid = "[id='" + nid + "'] ";
                    selector = nid + selector.split(",").join("," + nid);
                }

                result = context["querySelector" + all](selector);

                if (!old) node.removeAttribute("id");
            }

            return all ? util$index$$map.call(result, element$index$$$Element) : element$index$$$Element(result);
        };
    }

    node$index$$$Node.prototype.find = node$find$$makeMethod("find", "");
    node$index$$$Node.prototype.findAll = node$find$$makeMethod("findAll", "All");

    var util$eventhooks$$hooks = {};
    if ("onfocusin" in HTML) {
        util$eventhooks$$hooks.focus = function (handler) {
            handler._type = "focusin";
        };
        util$eventhooks$$hooks.blur = function (handler) {
            handler._type = "focusout";
        };
    } else {
        // firefox doesn't support focusin/focusout events
        util$eventhooks$$hooks.focus = util$eventhooks$$hooks.blur = function (handler) {
            handler.options.capture = true;
        };
    }
    if (DOCUMENT.createElement("input").validity) {
        util$eventhooks$$hooks.invalid = function (handler) {
            handler.options.capture = true;
        };
    }

    var util$eventhooks$$default = util$eventhooks$$hooks;

    // https://github.com/WICG/EventListenerOptions/blob/gh-pages/explainer.md#feature-detection
    var util$eventhandler$$supportsPassive = false;
    try {
        var util$eventhandler$$opts = Object.defineProperty({}, "passive", {
            get: function () {
                util$eventhandler$$supportsPassive = true;
            }
        });
        WINDOW.addEventListener("test", null, util$eventhandler$$opts);
    } catch (e) {}

    function util$eventhandler$$EventHandler(context, node, options, args) {
        this.context = context;
        this.node = node;
        this.options = options;
        this.args = args;

        if (options.selector) {
            this.matcher = util$selectormatcher$$default(options.selector, node);
        }
    }

    util$eventhandler$$EventHandler.prototype = {
        handleEvent: function (e) {
            this.event = e;
            // update value of currentTarget if selector exists
            this.currentTarget = this.matcher ? this.matcher(e.target) : this.node;
            // early stop when target doesn't match selector
            if (this.currentTarget) {
                if (this.options.once === true) {
                    this.unsubscribe();
                }

                var args = this.args.map(this.getEventProperty, this);
                // prevent default if handler returns false
                if (this.callback.apply(this.context, args) === false) {
                    e.preventDefault();
                }
            }
        },
        getEventProperty: function (name) {
            var _arguments2 = arguments;

            var e = this.event;
            if (name === "type") {
                return this.type;
            } else if (name === "target" || name === "relatedTarget") {
                return element$index$$$Element(e[name]);
            } else if (name === "currentTarget") {
                return element$index$$$Element(this.currentTarget);
            }

            var value = e[name];
            if (typeof value === "function") {
                return function () {
                    return value.apply(e, _arguments2);
                };
            } else {
                return value;
            }
        },
        subscribe: function (type, callback) {
            var hook = util$eventhooks$$default[type];

            this.type = type;
            this.callback = callback;

            if (hook) hook(this);

            this.node.addEventListener(this._type || this.type, this, this.getLastArgument());
        },
        unsubscribe: function () {
            this.node.removeEventListener(this._type || this.type, this, this.getLastArgument());
        },
        getLastArgument: function () {
            var lastArg = !!this.options.capture;
            if (this.options.passive && util$eventhandler$$supportsPassive) {
                lastArg = { passive: true, capture: lastArg };
            }
            return lastArg;
        }
    };

    var util$eventhandler$$default = util$eventhandler$$EventHandler;

    node$index$$$Node.prototype.fire = function (type, detail) {
        var node = this["__4000000-beta002__"];
        var e, eventType, canContinue;

        if (typeof type === "string") {
            var hook = util$eventhooks$$default[type],
                handler = { options: {} };

            if (hook) handler = hook(handler) || handler;

            eventType = handler._type || type;
        } else {
            throw new MethodError("fire", arguments);
        }

        if (!node) return true;

        e = (node.ownerDocument || node).createEvent("CustomEvent");
        e.initCustomEvent(eventType, true, true, detail);
        canContinue = node.dispatchEvent(e);

        // call native function to trigger default behavior
        if (canContinue && node[type]) {
            var _handleEvent = util$eventhandler$$default.prototype.handleEvent;
            // intercept handleEvent to prevent double event callbacks
            util$eventhandler$$default.prototype.handleEvent = function (e) {
                // prevent re-triggering of the current event
                if (this.type !== type) {
                    return _handleEvent.call(this, e);
                }
            };

            node[type]();
            // restore original method
            util$eventhandler$$default.prototype.handleEvent = _handleEvent;
        }

        return canContinue;
    };
    var util$accessorhooks$$hooks = { get: {}, set: {} };

    // fix camel cased attributes
    "tabIndex readOnly maxLength cellSpacing cellPadding rowSpan colSpan useMap frameBorder contentEditable".split(" ").forEach(function (key) {
        util$accessorhooks$$hooks.get[key.toLowerCase()] = function (node) {
            return node[key];
        };
    });

    // style hook
    util$accessorhooks$$hooks.get.style = function (node) {
        return node.style.cssText;
    };
    util$accessorhooks$$hooks.set.style = function (node, value) {
        node.style.cssText = value;
    };
    // some browsers don't recognize input[type=email] etc.
    util$accessorhooks$$hooks.get.type = function (node) {
        return node.getAttribute("type") || node.type;
    };

    var util$accessorhooks$$default = util$accessorhooks$$hooks;

    node$index$$$Node.prototype.get = function (name, defaultValue) {
        var _this3 = this;

        var node = this["__4000000-beta002__"];
        var hook = util$accessorhooks$$default.get[name];
        var value;

        if (!node) return value;

        if (arguments.length === 0) {
            return node.innerHTML;
        }

        if (hook) {
            value = hook(node, name);
        } else if (typeof name === "string") {
            if (name in node) {
                value = node[name];
            } else if (this instanceof element$index$$$Element) {
                value = node.getAttribute(name);
            } else {
                value = null;
            }
        } else if (util$index$$isArray(name)) {
            value = name.reduce(function (memo, key) {
                return memo[key] = _this3.get(key), memo;
            }, {});
        } else {
            throw new MethodError("get", arguments);
        }

        return value != null ? value : defaultValue;
    };

    var util$selectorhooks$$default = {
        ":focus": function (node) {
            return node === node.ownerDocument.activeElement;
        }

        // ":visible": (node) => !isHidden(node),

        // ":hidden": isHidden
    };

    node$index$$$Node.prototype.matches = function (selector) {
        if (!selector || typeof selector !== "string") {
            throw new MethodError("matches", arguments);
        }

        var checker = util$selectorhooks$$default[selector] || util$selectormatcher$$default(selector);

        return !!checker(this["__4000000-beta002__"]);
    };

    node$index$$$Node.prototype.on = function (type, options, args, callback) {
        if (typeof type === "string") {
            if (typeof options === "string") {
                options = { selector: options };
            } else if (typeof options === "function") {
                callback = options;
                options = {};
                args = [];
            } else if (typeof options === "object") {
                if (util$index$$isArray(options)) {
                    callback = args;
                    args = options;
                    options = {};
                }
            }

            if (typeof args === "function") {
                callback = args;
                args = [];
            }

            if (options && typeof options === "object" && typeof callback === "function") {
                var node = this["__4000000-beta002__"];

                if (!node) return function () {};

                var handler = new util$eventhandler$$default(this, node, options, args);
                handler.subscribe(type, callback);
                return function () {
                    return handler.unsubscribe();
                };
            }
        }

        throw new MethodError("on", arguments);
    };

    node$index$$$Node.prototype.set = function (name, value) {
        var _this4 = this;

        var node = this["__4000000-beta002__"];
        var len = arguments.length;
        var hook = util$accessorhooks$$default.set[name];

        if (node) {
            if (typeof name === "string") {
                if (len === 1) {
                    // innerHTML shortcut
                    value = name;
                    name = "innerHTML";
                }

                if (typeof value === "function") {
                    value = value(this.get(name));
                }

                if (hook) {
                    hook(node, value);
                } else if (value == null && this instanceof element$index$$$Element) {
                    node.removeAttribute(name);
                } else if (name in node) {
                    node[name] = value;
                } else if (this instanceof element$index$$$Element) {
                    node.setAttribute(name, value);
                }
            } else if (util$index$$isArray(name)) {
                if (len === 1) {
                    node.textContent = ""; // clear node children
                    this.append.apply(this, name);
                } else {
                    name.forEach(function (key) {
                        _this4.set(key, value);
                    });
                }
            } else if (typeof name === "object") {
                util$index$$keys(name).forEach(function (key) {
                    _this4.set(key, name[key]);
                });
            } else {
                throw new MethodError("set", arguments);
            }
        }

        return this;
    };

    node$index$$$Node.prototype.then = function (resolve) {
        var node = this["__4000000-beta002__"];
        var result, err;

        if (node) {
            try {
                result = resolve(node);
            } catch (e) {
                err = e;
            }
        }

        if (err) {
            WINDOW.setTimeout(function () {
                throw err;
            }, 1);
        } else {
            return result;
        }
    };

    var util$animationhandler$$TRANSITION_EVENT_TYPE = WEBKIT_PREFIX ? "webkitTransitionEnd" : "transitionend";
    var util$animationhandler$$ANIMATION_EVENT_TYPE = WEBKIT_PREFIX ? "webkitAnimationEnd" : "animationend";

    function util$animationhandler$$AnimationHandler(node, animationName) {
        this.node = node;
        this.style = node.style;
        this.eventType = animationName ? util$animationhandler$$ANIMATION_EVENT_TYPE : util$animationhandler$$TRANSITION_EVENT_TYPE;
        this.animationName = animationName;
    }

    util$animationhandler$$AnimationHandler.prototype = {
        handleEvent: function (e) {
            if (!this.animationName || e.animationName === this.animationName) {
                if (this.animationName) {
                    this.style.animationName = "";
                    this.style.animationDirection = "";
                }

                this.node.removeEventListener(this.eventType, this, true);

                if (typeof this.callback === "function") {
                    this.callback();
                }
            }
        },
        start: function (callback, animationDirection) {
            this.callback = callback;

            if (this.animationName) {
                this.style.animationName = this.animationName;
                this.style.animationDirection = animationDirection;
            }

            this.node.addEventListener(this.eventType, this, true);
        }
    };

    var util$animationhandler$$default = util$animationhandler$$AnimationHandler;

    // Helper for CSS properties access

    var util$stylehooks$$reDash = /\-./g,
        util$stylehooks$$hooks = { get: {}, set: {}, find: function (name, style) {
            var propName = name.replace(util$stylehooks$$reDash, function (str) {
                return str[1].toUpperCase();
            });

            if (!(propName in style)) {
                propName = VENDOR_PREFIXES.map(function (prefix) {
                    return prefix + propName[0].toUpperCase() + propName.slice(1);
                }).filter(function (prop) {
                    return prop in style;
                })[0];
            }

            return this.get[name] = this.set[name] = propName;
        }
    },
        util$stylehooks$$directions = ["Top", "Right", "Bottom", "Left"],
        util$stylehooks$$shortCuts = {
        font: ["fontStyle", "fontSize", "/", "lineHeight", "fontFamily"],
        padding: util$stylehooks$$directions.map(function (dir) {
            return "padding" + dir;
        }),
        margin: util$stylehooks$$directions.map(function (dir) {
            return "margin" + dir;
        }),
        "border-width": util$stylehooks$$directions.map(function (dir) {
            return "border" + dir + "Width";
        }),
        "border-style": util$stylehooks$$directions.map(function (dir) {
            return "border" + dir + "Style";
        })
    };

    // Exclude the following css properties from adding px
    "float fill-opacity font-weight line-height opacity orphans widows z-index zoom".split(" ").forEach(function (propName) {
        var stylePropName = propName.replace(util$stylehooks$$reDash, function (str) {
            return str[1].toUpperCase();
        });

        if (propName === "float") {
            stylePropName = "cssFloat" in HTML.style ? "cssFloat" : "styleFloat";
            // normalize float css property
            util$stylehooks$$hooks.get[propName] = util$stylehooks$$hooks.set[propName] = stylePropName;
        } else {
            util$stylehooks$$hooks.get[propName] = stylePropName;
            util$stylehooks$$hooks.set[propName] = function (value, style) {
                style[stylePropName] = value.toString();
            };
        }
    });

    // normalize property shortcuts
    util$index$$keys(util$stylehooks$$shortCuts).forEach(function (key) {
        var props = util$stylehooks$$shortCuts[key];

        util$stylehooks$$hooks.get[key] = function (style) {
            var result = [],
                hasEmptyStyleValue = function (prop, index) {
                result.push(prop === "/" ? prop : style[prop]);

                return !result[index];
            };

            return props.some(hasEmptyStyleValue) ? "" : result.join(" ");
        };

        util$stylehooks$$hooks.set[key] = function (value, style) {
            if (value && "cssText" in style) {
                // normalize setting complex property across browsers
                style.cssText += ";" + key + ":" + value;
            } else {
                props.forEach(function (name) {
                    return style[name] = typeof value === "number" ? value + "px" : value.toString();
                });
            }
        };
    });

    var util$stylehooks$$default = util$stylehooks$$hooks;

    function element$children$$makeMethod(methodName, validSelectorType) {
        return function (selector) {
            if (selector && typeof selector !== validSelectorType) {
                throw new MethodError(methodName, arguments);
            }

            var node = this["__4000000-beta002__"];
            var matcher = util$selectormatcher$$default(selector);
            var children = node ? node.children : [];

            if (typeof selector === "number") {
                if (selector < 0) {
                    selector = children.length + selector;
                }

                return element$index$$$Element(children[selector]);
            } else {
                if (matcher) {
                    return util$index$$filter.call(children, matcher).map(element$index$$$Element);
                } else {
                    return util$index$$map.call(children, element$index$$$Element);
                }
            }
        };
    }

    element$index$$$Element.prototype.child = element$children$$makeMethod("child", "number");

    element$index$$$Element.prototype.children = element$children$$makeMethod("children", "string");

    var element$classes$$reSpace = /[\n\t\r]/g;

    function element$classes$$makeMethod(methodName, defaultStrategy, nativeMethodName, strategy) {
        if (HTML.classList) {
            // use native classList property if possible
            strategy = function (el, token) {
                return el["__4000000-beta002__"].classList[nativeMethodName](token);
            };
        }

        if (defaultStrategy === RETURN_FALSE) {
            return function (token, force) {
                if (typeof force === "boolean" && nativeMethodName === "toggle") {
                    this[force ? "addClass" : "removeClass"](token);

                    return force;
                }

                if (typeof token !== "string") throw new MethodError(methodName, arguments);

                return strategy(this, token);
            };
        } else {
            return function () {
                for (var i = 0, n = arguments.length; i < n; ++i) {
                    var token = arguments[i];

                    if (typeof token !== "string") throw new MethodError(methodName, arguments);

                    strategy(this, token);
                }

                return this;
            };
        }
    }

    element$index$$$Element.prototype.hasClass = element$classes$$makeMethod("hasClass", RETURN_FALSE, "contains", function (el, token) {
        return (" " + el["__4000000-beta002__"].className + " ").replace(element$classes$$reSpace, " ").indexOf(" " + token + " ") >= 0;
    });

    element$index$$$Element.prototype.addClass = element$classes$$makeMethod("addClass", RETURN_THIS, "add", function (el, token) {
        if (!el.hasClass(token)) el["__4000000-beta002__"].className += " " + token;
    });

    element$index$$$Element.prototype.removeClass = element$classes$$makeMethod("removeClass", RETURN_THIS, "remove", function (el, token) {
        el["__4000000-beta002__"].className = (" " + el["__4000000-beta002__"].className + " ").replace(element$classes$$reSpace, " ").replace(" " + token + " ", " ").trim();
    });

    element$index$$$Element.prototype.toggleClass = element$classes$$makeMethod("toggleClass", RETURN_FALSE, "toggle", function (el, token) {
        var hasClass = el.hasClass(token);

        if (hasClass) {
            el.removeClass(token);
        } else {
            el["__4000000-beta002__"].className += " " + token;
        }

        return !hasClass;
    });

    element$index$$$Element.prototype.css = function (name, value) {
        var _this5 = this;

        var len = arguments.length;
        var node = this["__4000000-beta002__"];

        if (!node) {
            if (len === 1 && util$index$$isArray(name)) {
                return {};
            }

            if (len !== 1 || typeof name !== "string") {
                return this;
            }

            return;
        }

        var style = node.style;
        var computed;

        if (len === 1 && (typeof name === "string" || util$index$$isArray(name))) {
            var strategy = function (name) {
                var getter = util$stylehooks$$default.get[name] || util$stylehooks$$default.find(name, style),
                    value = typeof getter === "function" ? getter(style) : style[getter];

                if (!value) {
                    if (!computed) computed = util$index$$computeStyle(node);

                    value = typeof getter === "function" ? getter(computed) : computed[getter];
                }

                return value;
            };

            if (typeof name === "string") {
                return strategy(name);
            } else {
                return name.map(strategy).reduce(function (memo, value, index) {
                    memo[name[index]] = value;

                    return memo;
                }, {});
            }
        }

        if (len === 2 && typeof name === "string") {
            var setter = util$stylehooks$$default.set[name] || util$stylehooks$$default.find(name, style);

            if (typeof value === "function") {
                value = value(this);
            }

            if (value == null) value = "";

            if (typeof setter === "function") {
                setter(value, style);
            } else {
                style[setter] = typeof value === "number" ? value + "px" : value.toString();
            }
        } else if (len === 1 && name && typeof name === "object") {
            util$index$$keys(name).forEach(function (key) {
                _this5.css(key, name[key]);
            });
        } else {
            throw new MethodError("css", arguments);
        }

        return this;
    };

    function element$manipulation$$makeMethod(fastStrategy, requiresParent, strategy) {
        return function () {
            var _this6 = this;

            var node = this["__4000000-beta002__"];

            if (!node || requiresParent && !node.parentNode) return this;

            // the idea of the algorithm is to construct HTML string
            // when possible or use document fragment as a fallback to
            // invoke manipulation using a single method call
            var fragment = fastStrategy ? "" : node.ownerDocument.createDocumentFragment();

            for (var _len2 = arguments.length, contents = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
                contents[_key2] = arguments[_key2];
            }

            contents.forEach(function (content) {
                if (typeof content === "function") {
                    content = content(_this6);
                }

                if (typeof content === "string") {
                    if (typeof fragment === "string") {
                        fragment += content.trim();
                    } else {
                        content = document$index$$$Document(node.ownerDocument).createAll(content);
                    }
                } else if (content instanceof element$index$$$Element) {
                    content = [content];
                }

                if (util$index$$isArray(content)) {
                    if (typeof fragment === "string") {
                        // append existing string to fragment
                        content = document$index$$$Document(node.ownerDocument).createAll(fragment).concat(content);
                        // fallback to document fragment strategy
                        fragment = node.ownerDocument.createDocumentFragment();
                    }

                    content.forEach(function (el) {
                        fragment.appendChild(el["__4000000-beta002__"]);
                    });
                }
            });

            if (typeof fragment === "string") {
                node.insertAdjacentHTML(fastStrategy, fragment);
            } else {
                strategy(node, fragment);
            }

            return this;
        };
    }

    element$index$$$Element.prototype.after = element$manipulation$$makeMethod("afterend", true, function (node, relatedNode) {
        node.parentNode.insertBefore(relatedNode, node.nextSibling);
    });

    element$index$$$Element.prototype.before = element$manipulation$$makeMethod("beforebegin", true, function (node, relatedNode) {
        node.parentNode.insertBefore(relatedNode, node);
    });

    element$index$$$Element.prototype.prepend = element$manipulation$$makeMethod("afterbegin", false, function (node, relatedNode) {
        node.insertBefore(relatedNode, node.firstChild);
    });

    element$index$$$Element.prototype.append = element$manipulation$$makeMethod("beforeend", false, function (node, relatedNode) {
        node.appendChild(relatedNode);
    });

    element$index$$$Element.prototype.replace = element$manipulation$$makeMethod("", true, function (node, relatedNode) {
        node.parentNode.replaceChild(relatedNode, node);
    });

    element$index$$$Element.prototype.remove = element$manipulation$$makeMethod("", true, function (node) {
        node.parentNode.removeChild(node);
    });

    element$index$$$Element.prototype.offset = function () {
        var node = this["__4000000-beta002__"];
        var result = { top: 0, left: 0, right: 0, bottom: 0, width: 0, height: 0 };

        if (node) {
            var docEl = (node.ownerDocument || node).documentElement;
            var clientTop = docEl.clientTop;
            var clientLeft = docEl.clientLeft;
            var scrollTop = WINDOW.pageYOffset || docEl.scrollTop;
            var scrollLeft = WINDOW.pageXOffset || docEl.scrollLeft;
            var boundingRect = node.getBoundingClientRect();

            result.top = boundingRect.top + scrollTop - clientTop;
            result.left = boundingRect.left + scrollLeft - clientLeft;
            result.right = boundingRect.right + scrollLeft - clientLeft;
            result.bottom = boundingRect.bottom + scrollTop - clientTop;
            result.width = boundingRect.right - boundingRect.left;
            result.height = boundingRect.bottom - boundingRect.top;
        }

        return result;
    };

    function element$traversing$$makeMethod(methodName, propertyName, all) {
        return function (selector) {
            if (selector && typeof selector !== "string") {
                throw new MethodError(methodName, arguments);
            }

            var node = this["__4000000-beta002__"];
            var result = all ? [] : null;

            if (node) {
                var matcher = util$selectormatcher$$default(selector);
                // method closest starts traversing from the element itself
                // except no selector was specified where it returns parent
                if (node && (!matcher || methodName !== "closest")) {
                    node = node[propertyName];
                }

                for (var it = node; it; it = it[propertyName]) {
                    if (!matcher || matcher(it)) {
                        if (result) {
                            result.push(element$index$$$Element(it));
                        } else {
                            result = element$index$$$Element(it);
                            // need only the first element
                            break;
                        }
                    }
                }
            }

            return result || new element$index$$$Element();
        };
    }

    element$index$$$Element.prototype.next = element$traversing$$makeMethod("next", "nextElementSibling");

    element$index$$$Element.prototype.prev = element$traversing$$makeMethod("prev", "previousElementSibling");

    element$index$$$Element.prototype.nextAll = element$traversing$$makeMethod("nextAll", "nextElementSibling", true);

    element$index$$$Element.prototype.prevAll = element$traversing$$makeMethod("prevAll", "previousElementSibling", true);

    element$index$$$Element.prototype.closest = element$traversing$$makeMethod("closest", "parentNode");

    element$index$$$Element.prototype.value = function (content) {
        var node = this["__4000000-beta002__"];

        if (!node) return content ? this : void 0;

        var tagName = node.tagName;

        if (content === void 0) {
            if (tagName === "SELECT") {
                return ~node.selectedIndex ? node.options[node.selectedIndex].value : "";
            } else if (tagName === "OPTION") {
                return node.hasAttribute("value") ? node.value : node.text;
            } else if (tagName === "INPUT" || tagName === "TEXTAREA") {
                return node.value;
            } else {
                return node.textContent;
            }
        } else {
            switch (tagName) {
                case "INPUT":
                case "OPTION":
                case "TEXTAREA":
                    if (typeof content === "function") {
                        content = content(node.value);
                    }
                    node.value = content;
                    break;

                case "SELECT":
                    if (typeof content === "function") {
                        content = content(node.value);
                    }
                    if (util$index$$every.call(node.options, function (o) {
                        return !(o.selected = o.value === content);
                    })) {
                        node.selectedIndex = -1;
                    }
                    break;

                default:
                    if (typeof content === "function") {
                        content = content(node.textContent);
                    }
                    node.textContent = content;
            }

            return this;
        }
    };

    element$index$$$Element.prototype.empty = function () {
        return this.value("");
    };

    function element$visibility$$makeMethod(methodName, condition) {
        return function (animationName, callback) {
            var _this7 = this;

            if (typeof animationName !== "string") {
                callback = animationName;
                animationName = null;
            }

            if (callback && typeof callback !== "function") {
                throw new MethodError(methodName, arguments);
            }

            var node = this["__4000000-beta002__"];

            if (!node) return this;

            var computed = util$index$$computeStyle(node);
            // Determine of we need animation by checking if an element
            // has non-zero width. Triggers reflow but fixes animation
            // for new elements inserted into the DOM in some browsers

            if (node && computed.width) {
                var complete = function () {
                    node.style.visibility = condition ? "hidden" : "inherit";

                    if (typeof callback === "function") {
                        callback(_this7);
                    }
                };

                if (!node.ownerDocument.documentElement.contains(node)) {
                    util$index$$raf(complete); // skip animating of detached elements
                } else if (!animationName && parseFloat(computed["transition-duration"]) === 0) {
                    util$index$$raf(complete); // skip animating with zero transition duration
                } else if (animationName && parseFloat(computed["animation-duration"]) === 0) {
                    util$index$$raf(complete); // skip animating with zero animation duration
                } else {
                    // always make an element visible before animation start
                    node.style.visibility = "visible";

                    new util$animationhandler$$default(node, animationName).start(complete, condition ? "normal" : "reverse");
                }
            }
            // trigger CSS3 transition if it exists
            return this.set("aria-hidden", String(condition));
        };
    }

    element$index$$$Element.prototype.show = element$visibility$$makeMethod("show", false);

    element$index$$$Element.prototype.hide = element$visibility$$makeMethod("hide", true);
})();