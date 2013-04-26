/*!
 * DOM.js (https://github.com/chemerisuk/Better-DOM.js)
 * Modern javascript library for working with DOM
 *
 * Copyright (c) 2013 Maksim Chemerisuk
 */
(function(window, document, _, undefined) {
    "use strict";

    // VARIABLES
    // ---------

    var htmlEl = document.documentElement,
        headEl = document.head,
        scripts = document.scripts,
        // helpers
        sandbox = (function() {
            var el = document.createElement("body"),
                appendTo = function(el) { this.appendChild(el); };

            return {
                parse: function(html) {
                    el.innerHTML = "shy;" + html;
                    el.removeChild(el.firstChild);

                    return el.children;
                },
                fragment: function(html) {
                    var fragment = document.createDocumentFragment();

                    _.forEach(this.parse(html), appendTo, fragment);

                    return fragment;
                }
            };
        })();
        
    // DOMNode
    // -------
    
    /**
     * @namespace Basic type for any node in DOM
     * @name DOMNode
     * @constructor
     * @param node native object
     */
    function DOMNode(node) {
        if (!(this instanceof DOMNode)) {
            return node ? node.__dom__ || new DOMNode(node) : new DOMNullNode();
        }

        this._node = node;
        this._data = {};
        this._events = [];
    }

    DOMNode.prototype = {

        /**
         * Finds all elements by selector
         * @param  {String} selector css selector
         * @return {DOMElementCollection} elements collection
         */
        findAll: function(selector) {
            return this.find(selector, true);
        },

        /**
         * Call a method of native object
         * @param  {String} name method name
         * @return {Object} result of native method call
         */
        call: function(name) {
            if (arguments.length === 1) {
                return this._node[name]();
            } else {
                return this._node[name].apply(this._node, _.slice(arguments, 1));
            }
        },

        /**
         * Read data entry value
         * @param  {String} key data entry key
         * @return {Object} data entry value
         */
        getData: function(key) {
            if (typeof key !== "string") {
                throw _.error("getData");
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
         * @param {String|Object} key data entry key | key/value pairs
         * @param {Object} value data to store
         */
        setData: function(key, value) {
            var keyType = typeof key;

            if (keyType === "string") {
                this._data[key] = value;
            } else if (keyType === "object") {
                _.forIn(key, function(dataKey) {
                    this.setData(dataKey, key[dataKey]);
                }, this);
            } else {
                throw _.error("setData");
            }

            return this;
        }
    };

    (function() {
        var containsElement = Node.prototype.contains ?
            function(parent, child) {
                return parent.contains(child);
            } :
            function(parent, child) {
                return !!(parent.compareDocumentPosition(child) & 16);
            };

        /**
         * Check if element is inside of context
         * @param  {DOMElement} element element to check
         * @param  {Boolean} [reverse] internal parameter
         * @return {Boolean} true if succes
         */
        DOMNode.prototype.contains = function(element, /*INTERNAL*/reverse) {
            var node = this._node;

            if (element instanceof Element) {
                return containsElement(reverse ? element : node, reverse ? node : element);
            } else if (element instanceof DOMElement) {
                return element.contains(node, true);
            } else if (Array.isArray(element)) {
                return _.every(element, function(element) {
                    if (element instanceof DOMElement) {
                        return element.contains(node, true);
                    }
                    
                    throw _.error("contains");
                });
            } else {
                throw _.error("contains");
            }
        };

    })();

    (function() {
        // big part of code inspired by Sizzle:
        // https://github.com/jquery/sizzle/blob/master/sizzle.js

        // TODO: disallow to use buggy selectors?
        var rquickExpr = /^(?:#([\w\-]+)|(\w+)|\.([\w\-]+))$/,
            rsibling = /[\x20\t\r\n\f]*[+~>]/,
            rescape = /'|\\/g,
            tmpId = "DOM" + new Date().getTime();

        /**
         * Finds element by selector
         * @param  {String} selector css selector
         * @param  {Boolean} [multiple] internal parameter
         * @return {DOMElement} element or null if nothing was found
         */
        DOMNode.prototype.find = function(selector, /*INTERNAL*/multiple) {
            if (typeof selector !== "string") {
                throw _.error("find");
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
                    selector = nid + selector.replace(/","/g, "," + nid);
                }

                try {
                    elements = context[multiple ? "querySelectorAll" : "querySelector"](selector);
                } finally {
                    if ( !old ) {
                        node.removeAttribute("id");
                    }
                }
            }

            return multiple ? DOMElementCollection.create(elements) : DOMElement(elements);
        };

    })();

    // EVENTS
    
    (function() {
        var eventHooks = {},
            createEventHandler = function(thisPtr, callback, selector) {
                if (!selector) {
                    return function(e) {
                        callback.call(thisPtr, DOMEvent(e));
                    };
                }

                var matcher = new SelectorMatcher(selector);

                return function(e) {
                    for (var elem = e.target, root = e.currentTarget; elem && elem !== root; elem = elem.parentNode) {
                        if (matcher.test(elem)) {
                            return callback.call(thisPtr, DOMEvent(e));
                        }
                    }
                };
            },
            // http://perfectionkills.com/detecting-event-support-without-browser-sniffing/
            isEventSupported = function(tagName, eventName) {
                var el = document.createElement(tagName);
                
                eventName = "on" + eventName;

                var isSupported = (eventName in el);
                if (!isSupported) {
                    el.setAttribute(eventName, "return;");
                    isSupported = typeof el[eventName] === "function";
                }
                
                return isSupported;
            };

        // firefox doesn't support focusin/focusout events
        if (isEventSupported("input", "focusin")) {
            eventHooks.focus = {
                name: "focusin"
            };

            eventHooks.blur = {
                name: "focusout"
            };
        } else {
            eventHooks.focus = {
                capturing: true
            };

            eventHooks.blur = {
                capturing: true
            };
        }

        /**
         * Bind a DOM event to the context
         * @param  {String}   event    event type
         * @param  {String}   [selector] css selector to filter
         * @param  {Function} callback event handler
         * @return {DOMNode} current context
         */
        DOMNode.prototype.on = function(event, selector, callback) {
            var eventType = typeof event;

            if (eventType === "string") {
                if (typeof selector === "function") {
                    callback = selector;
                    selector = null;
                }

                _.forWord(event, function(event) {
                    var eventEntry = _.mixin({name: event, callback: callback, capturing: false}, eventHooks[event]);

                    if (!eventEntry.handler) {
                        eventEntry.handler = createEventHandler(this, callback, selector);
                    }

                    // attach event listener
                    this._node.addEventListener(eventEntry.name, eventEntry.handler, eventEntry.capturing);
                    // store event entry
                    this._events.push(eventEntry);
                }, this);
            } else if (eventType === "object") {
                _.forIn(event, function(key) {
                    this.on(key, event[key]);
                }, this);
            } else {
                throw _.error("on");
            }

            return this;
        };

        /**
         * Unbind a DOM event from the context
         * @param  {String}   eventType event type
         * @param  {Function} callback  event handler
         * @return {DOMNode} current context
         */
        DOMNode.prototype.off = function(eventType, callback) {
            if (typeof eventType !== "string" || callback !== undefined && typeof callback !== "function") {
                throw new _.error("off");
            }

            var hook = eventHooks[eventType];

            if (hook && hook.name) eventType = hook.name;

            _.forEach(this._events, function(entry) {
                if (eventType === entry.name && (!callback || callback === entry.callback)) {
                    this._node.removeEventListener(eventType, entry.handler, entry.capturing);
                }
            }, this);

            return this;
        };

        /**
         * Triggers an event of specific type
         * @param  {String} eventType type of event
         * @param  {Object} detail data to attach
         * @return {DOMNode} current context
         */
        DOMNode.prototype.fire = function(eventType, detail) {
            if (typeof eventType !== "string") {
                throw new _.error("fire");
            }

            var isCustomEvent = ~eventType.indexOf(":"),
                event = document.createEvent(isCustomEvent ? "CustomEvent" : "Event"),
                hook = eventHooks[eventType];

            if (hook && hook.name) eventType = hook.name;

            if (isCustomEvent) {
                event.initCustomEvent(eventType, true, false, detail);
            } else { 
                event.initEvent(eventType, true, true);
            }
            
            this._node.dispatchEvent(event);

            return this;
        };

    })();

    // DOMElement
    // ----------

    /**
     * @name DOMElement
     * @constructor
     * @param element native element
     * @extends DOMNode
     * @namespace Base type for any DOM element
     */
    function DOMElement(element) {
        if (!(this instanceof DOMElement)) {
            return element ? element.__dom__ || new DOMElement(element) : new DOMNullElement();
        }

        DOMNode.call(this, element);
    }

    DOMElement.prototype = new DOMNode();

    /**
     * Check if the element matches selector
     * @param  {String} selector css selector
     * @return {DOMElement} reference to this
     */
    DOMElement.prototype.matches = function(selector) {
        if (typeof selector !== "string") {
            throw _.error("matches");
        }

        return new SelectorMatcher(selector).test(this._node);
    };

    /**
     * Clone element
     * @return {DOMElement} reference to this
     */
    DOMElement.prototype.clone = function() {
        return new DOMElement(this._node.cloneNode(true));
    };

    /**
     * Calculates offset of current context
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
     * @return {DOMElement} reference to this
     */
    DOMElement.prototype.show = function() {
        return this.set("hidden", false);
    };

    /**
     * Hide element
     * @return {DOMElement} reference to this
     */
    DOMElement.prototype.hide = function() {
        return this.set("hidden", true);
    };
        
    DOMElement.prototype.toString = function() {
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
        
                        default:
                            parts.push(makePair(field.name, field.value));
                    }

                    return parts;
                }
            }, []);

            result = result.join("&").replace(/%20/g, "+");
        } else if (el.form) {
            result = el.value;
        } else {
            result = el.outerHTML;
        }

        return result;
    };

    // GETTER / SETTER

    (function() {
        var propHooks = {},
            throwIllegalAccess = function(el) {
                throw _.error("get");
            };
        // protect access to some properties
        _.forWord("children childNodes elements parentNode firstElementChild lastElementChild nextElementSibling previousElementSibling", function(key) {
            propHooks[key] = propHooks[key.replace("Element", "")] = {
                get: throwIllegalAccess,
                set: throwIllegalAccess
            };
        });

        // fix NoScope elements in IE9
        propHooks.innerHTML = {
            set: function(el, value) {
                el.innerHTML = "&shy;" + value;
                el.removeChild(el.firstChild);
                // TODO: evaluate script elements?
            }
        };

        /**
         * Get property or attribute by name
         * @param  {String} name property/attribute name
         * @return {String} property/attribute value
         */
        DOMElement.prototype.get = function(name) {
            if (typeof name !== "string") {
                throw _.error("get");
            }

            var el = this._node,
                hook = propHooks[name];

            hook && (hook = hook.get);

            return hook ? hook(el) : el[name] || el.getAttribute(name);
        };

        /**
         * Set property/attribute value
         * @param {String} name  property/attribute name
         * @param {String} value property/attribute value
         */
        DOMElement.prototype.set = function(name, value) {
            var el = this._node,
                nameType = typeof name,
                valueType = typeof value;

            if (nameType === "string") {
                if (valueType === "function") {
                    value = value.call(this, this.get(name));
                }

                _.forWord(name, function(name) {
                    var hook = propHooks[name];

                    if (hook) {
                        hook.set(el, value);
                    } else if (value === null || value === false) {
                        el.removeAttribute(name);
                    } else if (name in el) {
                        el[name] = value;
                    } else {
                        el.setAttribute(name, value);
                    }
                });
            } else if (nameType === "object") {
                _.forIn(name, function(key) {
                    this.set(key, name[key]);
                }, this);
            } else {
                throw _.error("set");
            }

            return this;
        };

    })();

    // TRAVERSING
    
    (function() {
        function makeTraversingMethod(propertyName, multiple) {
            return function(selector) {
                var matcher = selector ? new SelectorMatcher(selector) : null,
                    nodes = multiple ? [] : null,
                    it = this._node;

                while (it = it[propertyName]) {
                    if (!matcher || matcher.test(it)) {
                        if (!multiple) break;

                        nodes.push(it);
                    }
                }

                return multiple ? DOMElementCollection.create(nodes) : DOMElement(it);
            };
        }

        /**
         * Find next sibling element filtered by optional selector
         * @param {String} [selector] css selector
         * @return {DOMElement} matched element
         * @function
         */
        DOMElement.prototype.next = makeTraversingMethod("nextElementSibling");

        /**
         * Find previous sibling element filtered by optional selector
         * @param {String} [selector] css selector
         * @return {DOMElement} matched element
         * @function
         */
        DOMElement.prototype.prev = makeTraversingMethod("previousElementSibling");

        /**
         * Find parent element filtered by optional selector
         * @param {String} [selector] css selector
         * @return {DOMElement} matched element
         * @function
         */
        DOMElement.prototype.parent = makeTraversingMethod("parentNode");

        /**
         * Find first child element filtered by optional selector
         * @param {String} [selector] css selector
         * @return {DOMElement} matched element
         * @function
         */
        DOMElement.prototype.firstChild = makeTraversingMethod("firstElementChild");

        /**
         * Find last child element filtered by optional selector
         * @param {String} [selector] css selector
         * @return {DOMElement} matched element
         * @function
         */
        DOMElement.prototype.lastChild = makeTraversingMethod("lastElementChild");

        /**
         * Find all next sibling elements filtered by optional selector
         * @param {String} [selector] css selector
         * @return {DOMElementCollection} matched elements
         * @function
         */
        DOMElement.prototype.nextAll = makeTraversingMethod("nextElementSibling", true);

        /**
         * Find all previous sibling elements filtered by optional selector
         * @param {String} [selector] css selector
         * @return {DOMElementCollection} matched elements
         * @function
         */
        DOMElement.prototype.prevAll = makeTraversingMethod("previousElementSibling", true);

        /**
         * Fetch children elements filtered by optional selector
         * @param  {String} selector css selector
         * @return {DOMElementCollection} matched elements
         */
        DOMElement.prototype.children = function(selector) {
            var children = this._node.children,
                matcher = selector ? new SelectorMatcher(selector) : null;

            return DOMElementCollection.create(!matcher ? children : 
                _.filter(children, matcher.test, matcher));
        };

    })();

    // MANIPULATION
    // http://www.w3.org/TR/domcore/
    // 5.2.2 Mutation methods
    
    (function() {
        function makeManipulationMethod(methodName, fasterMethodName, strategy) {
            return function(element, /*INTERNAL*/reverse) {
                var el = this._node,
                    relatedNode = el.parentNode;

                if (typeof element === "string") {
                    relatedNode = fasterMethodName ? null : sandbox.fragment(element);
                } else if (element && (element.nodeType === 1 || element.nodeType === 11)) {
                    relatedNode = element;
                } else if (element !== undefined) {
                    throw _.error(methodName);
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
         * @param {String|Element} content HTML string or Element
         * @return {DOMElement} reference to this
         * @function
         */
        DOMElement.prototype.after = makeManipulationMethod("after", "afterend", function(node, relatedNode) {
            node.parentNode.insertBefore(relatedNode, node.nextSibling);
        });

        /**
         * Insert html string or native element before the current
         * @param {String|Element} content HTML string or Element
         * @return {DOMElement} reference to this
         * @function
         */
        DOMElement.prototype.before = makeManipulationMethod("before", "beforebegin", function(node, relatedNode) {
            node.parentNode.insertBefore(relatedNode, node);
        });

        /**
         * Prepend html string or native element to the current
         * @param {String|Element} content HTML string or Element
         * @return {DOMElement} reference to this
         * @function
         */
        DOMElement.prototype.prepend = makeManipulationMethod("prepend", "afterbegin", function(node, relatedNode) {
            node.insertBefore(relatedNode, node.firstChild);
        });

        /**
         * Append html string or native element to the current
         * @param {String|Element} content HTML string or Element
         * @return {DOMElement} reference to this
         * @function
         */
        DOMElement.prototype.append = makeManipulationMethod("append", "beforeend", function(node, relatedNode) {
            node.appendChild(relatedNode);
        });

        /**
         * Replace current element with html string or native element
         * @param {String|Element} content HTML string or Element
         * @return {DOMElement} reference to this
         * @function
         */
        DOMElement.prototype.replace = makeManipulationMethod("replace", "", function(node, relatedNode) {
            node.parentNode.replaceChild(relatedNode, node);
        });

        /**
         * Remove current element from DOM
         * @return {DOMElement} reference to this
         * @function
         */
        DOMElement.prototype.remove = makeManipulationMethod("remove", "", function(node, parentNode) {
            parentNode.removeChild(node);
        });

    })();

    // classes manipulation
    (function() {
        var rclass = /[\n\t\r]/g,
            makeClassesMethod = function(nativeStrategyName, strategy) {
                var arrayMethod = nativeStrategyName === "contains" ? "every" : "forEach";

                if (htmlEl.classList) {
                    strategy = function(className) {
                        return this._node.classList[nativeStrategyName](className);
                    };
                }

                return function(classNames) {
                    if (typeof classNames !== "string") {
                        throw _.error(name);
                    }

                    var result = _[arrayMethod](classNames.split(" "), strategy, this);

                    return result === undefined ? this : result;
                };
            };

        /**
         * Check if element contains class name(s)
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
         * @param  {String} classNames space-separated class name(s)
         * @return {DOMElement} reference to this
         * @function
         */
        DOMElement.prototype.removeClass = makeClassesMethod("remove", function(className) {
            this._node.className = (" " + this._node.className + " ")
                    .replace(rclass, " ").replace(" " + className + " ", " ").trim();
        });

        /**
         * Toggle class(es) on element
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
        var cssHooks = {},
            rdash = /\-./g,
            rcamel = /[A-Z]/g,
            dashSeparatedToCamelCase = function(str) { return str.charAt(1).toUpperCase(); },
            camelCaseToDashSeparated = function(str) { return "-" + str.toLowerCase(); },
            computed = window.getComputedStyle(htmlEl, ""),
            props = computed.length ? _.slice(computed) : _.map(_.keys(computed), function(key) { return key.replace(rcamel, camelCaseToDashSeparated); });

        // In Opera CSSStyleDeclaration objects returned by getComputedStyle have length 0
        _.forEach(props, function(propName) {
            var prefix = propName.charAt(0) === "-" ? propName.substr(1, propName.indexOf("-", 1) - 1) : null,
                unprefixedName = prefix ? propName.substr(prefix.length + 2) : propName,
                stylePropName = propName.replace(rdash, dashSeparatedToCamelCase);

            // some browsers start vendor specific props in lowecase
            if (!(stylePropName in computed)) {
                stylePropName = stylePropName.charAt(0).toLowerCase() + stylePropName.substr(1);
            }

            if (stylePropName !== propName) {
                cssHooks[unprefixedName] = {
                    get: function(style) {
                        return style[stylePropName];
                    },
                    set: function(style, value) {
                        style[stylePropName] = value;
                    }
                };
            }
        });

        // TODO: additional hooks to convert integers into appropriate strings

        /**
         * Get css style from element
         * @param  {String} name property name
         * @return {String} property value
         */
        DOMElement.prototype.getStyle = function(name) {
            var style = this._node.style,
                hook, result;

            if (typeof name !== "string") {
                throw _.error("getStyle"); 
            }

            hook = cssHooks[name];
            hook = hook && hook.get;

            result = hook ? hook(style) : style[name];

            if (!result) {
                style = window.getComputedStyle(this._node);

                result = hook ? hook(style) : style[name];
            }

            return result;
        };

        /**
         * Set css style for element
         * @param {String} name  property name
         * @param {String} value property value
         */
        DOMElement.prototype.setStyle = function(name, value) {
            var style = this._node.style,
                nameType = typeof name,
                hook;

            if (nameType === "string") {
                hook = cssHooks[name];
                hook = hook && hook.set;

                hook ? hook(style, value) : style[name] = value;
            } else if (nameType === "object") {
                _.forIn(name, function(key) {
                    this.setStyle(key, name[key]);
                }, this);
            } else {
                throw _.error("setStyle");
            }

            return this;
        };
    })();
    
    function DOMNullNode() { 
        this._node = null; 
    }
    
    function DOMNullElement() { 
        this._node = null; 
    }
    
    /**
     * @name DOMEvent
     * @constructor
     * @param event native event
     */
    function DOMEvent(event) {
        if (!(this instanceof DOMEvent)) {
            return event.__dom__ || ( event.__dom__ = new DOMEvent(event) );
        }

        this._event = event;
    }

    /**
     * @name DOMElementCollection
     * @constructor
     */
    var DOMElementCollection = (function() {
        // Create clean copy of Array prototype. Inspired by
        // http://dean.edwards.name/weblog/2006/11/hooray/
        var ref = scripts[0],
            iframe = document.createElement("iframe"),
            ctr;
       
        iframe.src = "about:blank";
        iframe.style.display = "none";
       
        ref.parentNode.insertBefore(iframe, ref);
        // store reference to clean Array
        ctr = iframe.contentWindow.Array;
        // cleanup DOM
        ref.parentNode.removeChild(iframe);
        
        // cleanup collection prototype
        _.forEach(Object.getOwnPropertyNames(ctr.prototype), function(methodName) {
           if (methodName !== "length") delete ctr.prototype[methodName];
        });
        
        return ctr;
    })(),

    /**
     * @private
     * @constructor
     */
    SelectorMatcher = (function() {
        // Quick matching inspired by
        // https://github.com/jquery/jquery
        var rquickIs = /^(\w*)(?:#([\w\-]+))?(?:\[([\w\-]+)\])?(?:\.([\w\-]+))?$/,
            ctr =  function(selector, quickOnly) {
                this.selector = selector;
                this.quickOnly = !!quickOnly;

                var quick = rquickIs.exec(selector);
                // TODO: support attribute value check
                if (this.quick = quick) {
                    //   0  1    2   3          4
                    // [ _, tag, id, attribute, class ]
                    quick[1] && (quick[1] = quick[1].toLowerCase());
                    quick[4] && (quick[4] = " " + quick[4] + " ");
                } else if (quickOnly) {
                    throw _.error("quick");
                }
            },
            matchesProp = _.reduce("m oM msM mozM webkitM".split(" "), function(result, prefix) {
                var propertyName = prefix + "atchesSelector";

                return result || htmlEl[propertyName] && propertyName;
            }, null);

        ctr.prototype = {
            test: function(el) {
                if (this.quick) {
                    return (
                        (!this.quick[1] || el.nodeName.toLowerCase() === this.quick[1]) &&
                        (!this.quick[2] || el.id === this.quick[2]) &&
                        (!this.quick[3] || el.hasAttribute(this.quick[3])) &&
                        (!this.quick[4] || !!~((" " + el.className  + " ").indexOf(this.quick[4])))
                    );
                }

                return !this.quickOnly && el[matchesProp](this.selector);
            }
        };

        return ctr;
    })();

    DOMEvent.prototype = _.mixin({}, {
        get: function(name) {
            if (typeof name !== "string" || ~name.indexOf("arget") || ~name.indexOf("lement")) {
                throw _.error("get", "DOMEvent");
            }

            return this._event[name];
        }
    });
    // methods
    _.forWord("preventDefault stopPropagation stopImmediatePropagation", function(key) {
        _.mixin(DOMEvent.prototype, key, function() {
            this._event[key]();
        });
    });
    // getters
    _.forWord("target currentTarget relatedTarget", function(key) {
        Object.defineProperty(DOMEvent.prototype, key, {
            enumerable: true,
            get: function() {
                return DOMElement(this._event[key]);
            }
        });
    });

    // DOMElementCollection
    // --------------------
    
    DOMElementCollection.create = function(collection) {
        var result = new DOMElementCollection(),
            i = 0, n = collection.length;

        while (i < n) {
            Array.prototype.push.call(result, DOMElement(collection[i++]));
        }

        return result;
    };

    DOMElementCollection.prototype.each = function(callback) {
        _.forEach(this, callback);

        return this;
    };

    // shortcuts
    _.forWord("set on off fire data addClass removeClass toggleClass", function(methodName) {
        var process = DOMElement.prototype[methodName];

        _.mixin(DOMElementCollection.prototype, methodName, function() {
            for (var i = 0, n = this.length; i < n; ++i) {
                process.apply(this[i], _.slice(arguments));
            }

            return this;
        });
    });

    // finish prototypes
    DOMNullNode.prototype = new DOMNode();
    DOMNullElement.prototype = new DOMElement();

    _.forIn(DOMNode.prototype, function(key) {
        _.mixin(DOMNullNode.prototype, key, function() {});
        _.mixin(DOMNullElement.prototype, key, function() {});
    });

    _.forIn(DOMElement.prototype, function(key) {
        _.mixin(DOMNullElement.prototype, key, function() {});
    });

    // fix constructor property
    _.forEach([DOMNode, DOMElement, DOMEvent, DOMNullNode, DOMNullElement], function(ctr) {
        ctr.prototype.constructor = ctr;
    });

    // public API
    window.DOM = _.mixin(new DOMNode(document), {
        create: function(content) {
            var elem = content;

            if (typeof content === "string") {
                if (content.charAt(0) === "<") {
                    return DOMElementCollection.create(sandbox.parse(content));
                } else {
                    elem = document.createElement(content);
                }
            } else if (!(content instanceof Element)) {
                throw _.error("create");
            }

            return DOMElement(elem);
        },
        ready: (function() {
            var readyCallbacks = null,
                readyProcess = function() {
                    if (readyCallbacks) {
                        // trigger callbacks
                        _.forEach(readyCallbacks, function(callback) {
                            callback();
                        });
                        // cleanup
                        readyCallbacks = null;
                    }
                };

            // Catch cases where ready is called after the browser event has already occurred.
            // IE10 and lower don't handle "interactive" properly... use a weak inference to detect it
            // hey, at least it's not a UA sniff
            // discovered by ChrisS here: http://bugs.jquery.com/ticket/12282#comment:15
            if ( document.attachEvent ? document.readyState !== "complete" : document.readyState === "loading") {
                readyCallbacks = [];

                document.addEventListener("DOMContentLoaded", readyProcess, false);
                // additional handler for complex cases
                window.addEventListener("load", readyProcess, false);
            }

            // return implementation
            return function(callback) {
                if (typeof callback !== "function") {
                    throw _.error("ready");
                }

                if (readyCallbacks) {
                    readyCallbacks.push(callback);
                } else {
                    callback();
                }
            };
        })(),
        importStyles: (function() {
            var styleEl = headEl.insertBefore(document.createElement("style"), headEl.firstChild),
                process = function(selector, styles) {
                    var ruleText = selector + " { ";

                    if (typeof styles === "object") {
                        _.forIn(styles, function(propName) {
                            // append vendor prefix if it's required
                            ruleText += propName + ":" + styles[propName] + "; ";
                        });
                    } else if (typeof styles === "string") {
                        ruleText += styles;
                    } else {
                        throw _.error("importStyles");
                    }

                    styleEl.appendChild(document.createTextNode(ruleText + "}"));
                };

            if (!("hidden" in htmlEl)) {
                process("[hidden]", "display:none");    
            }
                        
            return function(selector, styles) {
                var selectorType = typeof selector;

                if (selectorType === "string") {
                    process(selector, styles);
                } else if (selectorType === "object") {
                    _.forEach(_.slice(arguments), function(rule) {
                        var selector = _.keys(rule)[0];

                        process(selector, rule[selector]);
                    });
                } else {
                    throw _.error("importStyles");
                }
            };
        })(),
        _watchers: {},
        watch: htmlEl.addBehavior ? (function() {
            var behavior = scripts[scripts.length - 1].getAttribute("data-htc");

            return function(selector, callback) {
                var entry = this._watchers[selector];

                if (entry) {
                    entry.push(callback);
                } else {
                    this._watchers[selector] = [callback];
                    // append style rule at the last step
                    this.importStyles(selector, { behavior: "url(" + behavior + ")" });
                }
            };
        })() : (function() {
            // use trick discovered by Daniel Buchner: 
            // https://github.com/csuwldcat/SelectorListener
            var startNames = ["animationstart", "oAnimationStart", "webkitAnimationStart"],
                computed = window.getComputedStyle(htmlEl, ""),
                cssPrefix = window.CSSKeyframesRule ? "" : (_.slice(computed).join("").match(/-(moz|webkit|ms)-/) || (computed.OLink === "" && ["-o-"]))[0];

            return function(selector, callback) {
                var animationName = "DOM" + new Date().getTime(),
                    allAnimationNames = this._watchers[selector] || animationName,
                    cancelBubbling = function(e) {
                        if (e.animationName === animationName) {
                            e.stopPropagation();
                        }
                    };

                this.importStyles(
                    "@" + cssPrefix + "keyframes " + animationName,
                    "from { clip: rect(1px, auto, auto, auto) } to { clip: rect(0px, auto, auto, auto) }"
                );

                // use comma separated animation names in case of multiple
                if (allAnimationNames !== animationName) allAnimationNames += "," + animationName;

                this.importStyles(
                    selector, 
                    cssPrefix + "animation-duration:0.001s;" + cssPrefix + "animation-name:" + allAnimationNames + " !important"
                );

                _.forEach(startNames, function(name) {
                    document.addEventListener(name, function(e) {
                        var el = e.target;

                        if (e.animationName === animationName) {
                            callback(DOMElement(el));
                            // prevent double initialization
                            el.addEventListener(name, cancelBubbling, false);
                        }
                    }, false);
                });

                this._watchers[selector] = allAnimationNames;
            };
        })(),
        extend: function(selector, options) {
            if (!options || typeof options !== "object") {
                throw _.error("extend");
            }

            var template = options.template,
                css = options.css,
                ctr;

            if (template) {
                _.forIn(template, function(key) {
                    template[key] = sandbox.fragment(template[key]);
                });

                delete options.template;
            }

            if (css) {
                this.importStyles.apply(this, css);

                delete options.css;
            }

            if (options.hasOwnProperty("constructor")) {
                ctr = options.constructor;

                delete options.constructor;
            }

            this.watch(selector, function(el) {
                _.mixin(el, options);

                template && _.forIn(template, function(key) {
                    el[key](template[key].cloneNode(true));
                });

                if (ctr) ctr.call(el);
            });
        }
    });

})(window, document, {
    
    // UTILITES
    // --------
    
    slice: function(list, index) {
        return Array.prototype.slice.call(list, index || 0);
    },
    keys: function(obj) {
        return Object.keys(obj);
    },
    forIn: function(obj, callback, thisPtr) {
        this.forEach(this.keys(obj), callback, thisPtr);
    },
    forEach: function(list, callback, thisPtr) {
        for (var i = 0, n = list.length; i < n; ++i) {
            callback.call(thisPtr, list[i], i, list);
        }
    },
    forWord: function(str, callback, thisPtr) {
        this.forEach(str.split(" "), callback, thisPtr);
    },
    filter: function(list, testFn, thisPtr) {
        var result = [];

        this.forEach(list, function(el) {
            if (testFn.call(thisPtr, el, list)) result.push(el);
        });

        return result;
    },
    every: function(list, testFn, thisPtr) {
        var result = true;

        this.forEach(list, function(el) {
            result = result && testFn.call(thisPtr, el, list);
        });

        return result;
    },
    reduce: function(list, callback, result) {
        this.forEach(list, function(el, index) {
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

        this.forEach(list, function(el, index) {
            result.push(callback.call(thisPtr, el, index, list));
        });

        return result;
    },
    mixin: function(obj, name, value) {
        if (arguments.length === 3) {
            obj[name] = value;
        } else if (name) {
            this.forIn(name, function(key) {
                this.mixin(obj, key, name[key]);
            }, this);
        }

        return obj; 
    },
    error: function(methodName, type) {
        // http://domjs.net/doc/{objectName}/{methodName}[#{hashName}]
        return "Error: '" + (type ? type + "." : "") + methodName + "' method called with illegal arguments";
    }
});
