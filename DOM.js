/*!
 * DOM.js (https://github.com/chemerisuk/DOM.js)
 * Modern javascript library for working with DOM
 *
 * Copyright (c) 2013 Maksim Chemerisuk
 */
(function(window, document, undefined) {
    "use strict";

    var DOM,
        htmlEl = document.documentElement,
        bodyEl = document.body,
        headEl = document.head,
        // classes
        DOMElement = function(node) {
            if (!this) {
                return node ? new DOMElement(node) : new NullDOMElement();
            }
            // private data objects
            var dataStorage = {},
                eventsStorage = {};

            Object.defineProperties(this, {
                _el: {
                    value: node,
                    writable: false,
                    enumerable: false,
                    configurable: false
                },
                data: {
                   value: function(name, value) {
                        if (typeof name !== "string") {
                            throw new DOMMethodError("data");
                        }

                        var isGetter = value === undefined,
                            storage = dataStorage,
                            dataAttributeName = "data-" + name;

                        if (this._el.hasAttribute(dataAttributeName)) {
                            if (isGetter) {
                                return this._el.getAttribute(dataAttributeName);
                            }

                            this._el.setAttribute(dataAttributeName, value);

                            return this;
                        } else if (name.substr(0, 1) === "@") {
                            storage = eventsStorage;
                            name = name.substr(1);
                        }

                        if (isGetter) {
                            return storage[name];
                        }

                        storage[name] = value;

                        return this;
                    },
                    writable: false,
                    configurable: false
                }
            });
        },
        DOMElementCollection = (function() {
            // Create clean copy of Array prototype. Inspired by
            // http://dean.edwards.name/weblog/2006/11/hooray/
            var ref = document.getElementsByTagName("script")[0],
                iframe = document.createElement("iframe"),
                ctr;
                
            iframe.src = "about:blank";
            iframe.style.display = "none";
                
            ref.parentNode.insertBefore(iframe, ref);
            // store reference to clean Array
            ctr = iframe.contentWindow.Array;
            // cleanup
            ref.parentNode.removeChild(iframe);
            
            return ctr;
        })(),
        NullDOMElement = function() {},
        SelectorMatcher = (function() {
            // Quick matching inspired by
            // https://github.com/jquery/jquery
            var rquickIs = /^(\w*)(?:#([\w\-]+))?(?:\[([\w\-]+)\])?(?:\.([\w\-]+))?$/,
                quickParse = function(selector) {
                    var quick = rquickIs.exec(selector);
                    // TODO: support attribute value check
                    if (quick) {
                        //   0  1    2   3          4
                        // [ _, tag, id, attribute, class ]
                        quick[1] = (quick[1] || "").toLowerCase();
                        quick[4] = quick[4] ? " " + quick[4] + " " : "";
                    } else {
                        throw new DOMMethodError("quickParse");
                    }

                    return quick;
                },
                quickIs = function(elem, m) {
                    return (
                        (!m[1] || elem.nodeName.toLowerCase() === m[1]) &&
                        (!m[2] || elem.id === m[2]) &&
                        (!m[3] || elem.hasAttribute(m[3])) &&
                        (!m[4] || ~(" " + elem.className  + " ").indexOf(m[4]))
                    );
                },
                ctr =  function(selector, quickOnly) {
                    this.selector = selector;
                    this.quick = quickParse(selector);
                    this.quickOnly = !!quickOnly;
                },
                matchesProperty;

            ["m","oM","msM","mozM","webkitM"].some(function(prefix) {
                return !!htmlEl[matchesProperty = prefix + "atchesSelector"];
            });

            ctr.prototype = {
                test: function(node) {
                    if (this.quick) {
                        return quickIs(node, this.quick);
                    }

                    return !this.quickOnly && node[matchesProperty](this.selector);
                }
            };

            return ctr;
        })(),
        // errors
        DOMMethodError = function(methodName, objectName, hashName) {
            this.name = "DOMMethodError";
            // http://domjs.net/doc/{objectName}/{methodName}[#{hashName}]
            this.message = "Invalid call of the " + methodName +
                " method. See http://domjs.net/doc/" + methodName + " for details";
        };

    // DOMElement

    DOMElement.prototype = {
        matches: function(selector) {
            var matcher = new SelectorMatcher(selector);

            return matcher.test(this._el);
        },
        find: function(selector) {
            if (typeof selector !== "string") {
                throw new DOMMethodError("find");
            }

            var result;

            if (selector.charAt(0) === "#" && selector.indexOf(" ") === -1) {
                result = document.getElementById(selector.substr(1));
            } else {
                result = this._el.querySelector(selector);
            }
            
            return DOMElement(result);
        },
        findAll: (function() {
            // big part of code is stoled from Sizzle:
            // https://github.com/jquery/sizzle/blob/master/sizzle.js

            // TODO: disallow to use buggy selectors

            // Easily-parseable/retrievable ID or TAG or CLASS selectors
            var rquickExpr = /^(?:#([\w\-]+)|(\w+)|\.([\w\-]+))$/,
                rsibling = /[\x20\t\r\n\f]*[+~>]/,
                rsiblingQuick = /\s*([+~>])\s*(\w*(?:#[\w\-]+)?(?:\[[\w\-]+\])?(?:\.[\w\-]+)?)/,
                rescape = /'|\\/g,
                expando = "DOM" + new Date().getTime(),
                slice = DOMElementCollection.prototype.slice,
                map = DOMElementCollection.prototype.map;

            return function(selector) {
                if (typeof selector !== "string") {
                    throw new DOMMethodError("findAll");
                }

                var elements, m, elem, match, matcher;

                if (match = rquickExpr.exec(selector)) {
                    // Speed-up: "#ID"
                    if (m = match[1]) {
                        elem = document.getElementById(m);
                        // Handle the case where IE, Opera, and Webkit return items
                        // by name instead of ID
                        if ( elem && elem.parentNode && elem.id === m && (this === DOM || this.contains(elem)) ) {
                            elements = [elem];
                        }
                    // Speed-up: "TAG"
                    } else if (match[2]) {
                        elements = slice.call(this._el.getElementsByTagName(selector), 0);
                    // Speed-up: ".CLASS"
                    } else if (m = match[3]) {
                        elements = slice.call(this._el.getElementsByClassName(m), 0);
                    }
                } else if (match = rsiblingQuick.exec(selector)) {
                    selector = match[2];
                    elements = [];
                    matcher = new SelectorMatcher(selector, true);

                    switch (match[1]) {
                        case "+":
                            for (elem = this._el.nextElementSibling; elem; elem = null) {
                                if (matcher.test(elem)) {
                                    elements.push(elem);
                                }
                            }
                            break;

                        case "~":
                            for (elem = this._el; elem = elem.nextElementSibling; ) {
                                if (matcher.test(elem)) {
                                    elements.push(elem);
                                }
                            }
                            break;

                        case ">":
                            for (elem = this._el.firstElementChild; elem; elem = elem.nextElementSibling) {
                                if (matcher.test(elem)) {
                                    elements.push(elem);
                                }
                            }
                            break;
                    }
                } else {
                    var old = true,
                        nid = expando,
                        newContext = this._el,
                        newSelector = this === DOM && selector;

                    if (this !== DOM) {
                        // qSA works strangely on Element-rooted queries
                        // We can work around this by specifying an extra ID on the root
                        // and working up from there (Thanks to Andrew Dupont for the technique)
                        if ( (old = this._el.getAttribute("id")) ) {
                            nid = old.replace(rescape, "\\$&");
                        } else {
                            this._el.setAttribute("id", nid);
                        }

                        nid = "[id='" + nid + "'] ";

                        newContext = rsibling.test(selector) && this._el.parentNode || this._el;
                        newSelector = nid + selector.replace(/","/g, "," + nid);
                    }

                    if (newSelector) {
                        try {
                            elements = newContext.querySelectorAll(newSelector);
                        } catch(qsaError) {
                        } finally {
                            if ( !old ) {
                                this._el.removeAttribute("id");
                            }
                        }
                    }
                }

                return map.call(elements || [], DOMElement);
            };
        })(),
        contains: (function() {
            var containsElement = Node.prototype.contains ?
                function(parent, child) {
                    return parent.contains(child);
                } :
                function(parent, child) {
                    return !!(parent.compareDocumentPosition(child) & 16);
                };

            return function(element) {
                var ctr = element.constructor;

                if (ctr === DOMElement) {
                    return containsElement(this._el, element._el);
                } else if (ctr === DOMElementCollection) {
                    var result = false;

                    element.each(function(element) {
                        return result = this.contains(element);
                    }, this);

                    return result;
                } else {
                    throw new DOMMethodError("contains");
                }
            };
        })(),
        on: (function() {
            var nodeProperties = ["target", "currentTarget", "relatedTarget"],
                modifyProperties = function(prop) {
                    var node = this[prop];

                    if (node) {
                        delete this[prop];

                        this[prop] = DOMElement(node);
                    }

                    return node;
                },
                processHandlers = function(element, event, handler, thisPtr) {
                    if (typeof handler !== "function") {
                        throw new DOMMethodError("on");
                    }

                    var selectorStart = event.indexOf(" "),
                        eventType = ~selectorStart ? event.substr(0, selectorStart) : event,
                        selector = ~selectorStart ? event.substr(selectorStart + 1) : undefined,
                        matcher = selector ? new SelectorMatcher(selector) : null,
                        nativeEventHandler = function(e) {
                            // modify event object
                            var props = nodeProperties.map(modifyProperties, e);

                            handler.call(thisPtr, e);

                            // restore event object
                            nodeProperties.forEach(function(prop, i) {
                                e[prop] = props[i];
                            });
                        },
                        eventsEntries = element.data("@" + event),
                        eventsEntry = {
                            key: handler, 
                            value: !selector ? nativeEventHandler : function(e) {
                                for (var el = e.target, root = element._el.parentNode; el !== root; el = el.parentNode) {
                                    if (matcher.test(el)) {
                                        nativeEventHandler(e);

                                        break;
                                    }
                                }
                            }
                        };
                    // attach event listener
                    element._el.addEventListener(eventType, eventsEntry.value, false);
                    // store event entry
                    if (eventsEntries) {
                        eventsEntries.push(eventsEntry);
                    } else {
                        element.data("@" + event, [eventsEntry]);
                    }
                };

            return function(event, handler, thisPtr) {
                var eventType = typeof event;

                thisPtr = thisPtr || this;

                if (eventType === "string") {
                    processHandlers(this, event, handler, thisPtr);
                } else if (eventType === "object") {
                    Object.keys(event).forEach(function(key) {
                        processHandlers(this, key, event[key], thisPtr);
                    }, this);
                } else if (Array.isArray(event)) {
                    event.forEach(function(key) {
                        processHandlers(this, key, handler, thisPtr);
                    }, this);
                } else {
                    throw new DOMMethodError("on");
                }

                return this;
            };
        })(),
        off: function(event, handler) {
            if (typeof event !== "string" || handler && typeof handler !== "function") {
                throw new DOMMethodError("off");
            }

            var eventsEntries = this.data("@" + event);

            if (eventsEntries) {
                this.data("@" + event, eventsEntries.filter(function(eventsEntry) {
                    if (!handler || handler === eventsEntry.key) {
                        this._el.removeEventListener(event, eventsEntry.value, false);
                    }
                }, this));
            }

            return this;
        },
        fire: function(eventType, detail) {
            var event;
            
            if (detail !== undefined) {
                event = new CustomEvent(eventType, {detail: detail});
            } else {
                event = document.createEvent(eventType);
                event.initEvent(eventType, true, true);
            }
            
            this._el.dispatchEvent(event);

            return this;
        },
        get: function(name) {
            return this._el[name] || this._el.getAttribute(name);
        },
        set: (function() {
            var processAttribute = function(element, name, value) {
                    var valueType = typeof value;

                    if (valueType === "function") {
                        value = value.call(this, element.get(name));
                    } else if (valueType !== "string") {
                        throw new DOMMethodError("set");
                    }

                    if (name in element._el) {
                        element._el[name] = value;
                    } else {
                        element._el.setAttribute(name, value);
                    }
                };

            return function(name, value) {
                var nameType = typeof name;

                if (nameType === "string") {
                    processAttribute(this, name, value);
                } else if (name && nameType === "object") {
                    Object.keys(name).forEach(function(attrName) {
                        processAttribute(this, attrName, name[attrName]);
                    }, this);
                } else {
                    throw new DOMMethodError("set");
                }

                return this;
            };
        })(),
        clone: function(deep) {
            return new DOMElement(this._el.cloneNode(deep));
        },
        css: function() {
            return window.getComputedStyle(this._el);
        },
        value: function(value) {
            var node = this._el, 
                propName = "value" in node ? "value" : "textContent";

            if (value === undefined) {
                return node[propName];
            }

            if (typeof value !== "string") {
                throw new DOMMethodError("value");
            }

            node[propName] = value;

            return this;
        },
        html: (function() {
            var slice = DOMElementCollection.prototype.slice,
                forEach = DOMElementCollection.prototype.forEach,
                processScripts = function(el) {
                    if (el.src) {
                        var script = document.createElement("script");

                        script.src = el.src;

                        headEl.removeChild(headEl.appendChild(script));
                    } else {
                        eval(el.innerHTML);
                    }
                };

            return function(value) {
                var node = this._el;

                if (value === undefined) {
                    return node.innerHTML;
                }

                if (typeof value !== "string") {
                    throw new DOMMethodError("html");
                }
                // fix NoScope elements in IE9-
                node.innerHTML = "&shy;" + value;
                node.removeChild(node.firstChild);
                // fix script elements
                forEach.call(slice.call(node.getElementsByTagName("script"), 0), processScripts);

                return this;
            };
        })(),
        offset: function() {
            var boundingRect = this._el.getBoundingClientRect(),
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
        }
    };

    // dom traversing
    (function() {
        var strategies = {
                firstChild: "firstElementChild",
                lastChild: "lastElementChild",
                parent: "parentNode",
                next: "nextElementSibling",
                prev: "previousElementSibling"
            };

        Object.keys(strategies).forEach(function(methodName) {
            var propertyName = strategies[methodName];

            DOMElement.prototype[methodName] = function(selector) {
                var node = this._el,
                    matcher = selector ? new SelectorMatcher(selector) : null;

                while ( !(node = node[propertyName]) || !matcher || matcher.test(node) );

                return DOMElement(node);
            };
        });

    })();

    // dom manipulation
    (function() {
        // http://www.w3.org/TR/domcore/
        // 5.2.2 Mutation methods
        var populateNode = function(element) {
                this.appendChild(element._el);
            },
            strategies = {
                after: function(node, relatedNode, parent) {
                    parent.insertBefore(relatedNode, node.nextSibling);
                },
                before: function(node, relatedNode, parent) {
                    parent.insertBefore(relatedNode, node);
                },
                replace: function(node, relatedNode, parent) {
                    parent.replaceChild(node, relatedNode);
                },
                append: function(node, relatedNode) {
                    node.appendChild(relatedNode);
                },
                prepend: function(node, relatedNode) {
                    node.insertBefore(relatedNode, node.firstChild);
                },
                remove: function(node, parent) {
                    parent.removeChild(node);
                }
            };

        Object.keys(strategies).forEach(function(methodName) {
            var process = strategies[methodName];

            DOMElement.prototype[methodName] = function(element) {
                var parent, relatedNode, ctr;

                if (parent = this._el.parentNode) {
                    if (element) {
                        ctr = element.constructor;

                        if (ctr === DOMElement) {
                            relatedNode = element._el;
                        } else if (ctr === DOMElementCollection) {
                            // create a fragment for the node collection
                            relatedNode = document.createDocumentFragment();
                            // populate fragment
                            element.each(populateNode, relatedNode);
                        }
                    } else {
                        // indicate case with remove() function
                        relatedNode = parent;
                    }

                    if (relatedNode) {
                       process(this._el, relatedNode, parent);
                    } else {
                        throw new DOMMethodError(methodName);
                    }
                }

                return this;
            };
        });
    })();

    // css classes manipulation
    (function() {
        var rclass = /[\n\t\r]/g,
            strategies = htmlEl.classList ? {
                hasClass: function(className) {
                    return this.classList.constains(className);
                },
                addClass: function(className) {
                    this.classList.add(className);
                },
                removeClass: function(className) {
                    this.classList.remove(className);
                },
                toggleClass: function(className) {
                    this.classList.toggle(className);
                }
            } : {
                hasClass: function(className) {
                    return !!~((" " + this.className + " ")
                            .replace(rclass, " ")).indexOf(" " + className + " ");
                },
                addClass: function(className) {
                    if (!strategies.hasClass.call(this, className)) {
                        this.className += " " + className;
                    }
                },
                removeClass: function(className) {
                    this.className = (" " + this.className + " ")
                            .replace(rclass, " ").replace(" " + className + " ", " ").trim();
                },
                toggleClass: function(className) {
                    var originalClassName = this.className;

                    strategies.addClass.call(this, className);

                    if (originalClassName !== this.className) {
                        strategies.removeClass.call(this, className);
                    }
                }
            };

        Object.keys(strategies).forEach(function(methodName) {
            var process = strategies[methodName];

            DOMElement.prototype[methodName] = function(classNames) {
                if (typeof classNames !== "string") {
                    throw new DOMMethodError(methodName);
                }

                var classes = classNames.split(" ");

                if (methodName === "hasClass") {
                    return classes.every(process, this._el);
                } else {
                    return classes.forEach(process, this._el) || this;
                }
            };
        });

    })();

    // focus/blur
    ["focus", "blur"].forEach(function(methodName) {
        DOMElement.prototype[methodName] = function() {
            this._el[methodName]();

            return this;
        };
    });

    // NullDOMElement
    Object.keys(DOMElement.prototype).concat(["get", "set"]).forEach(function(method) {
        // each method is a noop function
        NullDOMElement.prototype[method] = function() {};
    });

    NullDOMElement.constructor = DOMElement;
    NullDOMElement.prototype._el = null;

    // DOMElementCollection

    // shortcuts
    ["set", "on", "show", "hide", "addClass", "removeClass", "toggleClass"].forEach(function(methodName) {
        var slice = DOMElementCollection.prototype.slice,
            process = function(element) {
            // this will be an arguments array
            element[methodName].apply(element, this);
        };

        DOMElementCollection.prototype[methodName] = function() {
            if (this.length === 0) return this;

            return this.each(process, slice.call(arguments, 0));
        };
    });

    // patch native forEach to return reference to be chainable
    DOMElementCollection.prototype.each = (function() {
        var forEach = DOMElementCollection.prototype.forEach;
         
        return function(callback, thisPtr) {
            if (this.length) {
                forEach.call(this, callback, thisPtr);
            }

            return this;
        };
    })();

    // cleanup prototype by saving only specific methods
    ["pop", "push", "shift", "splice", "unshift", "concat", "join", "slice", "toSource", "toString", 
    "toLocaleString", "indexOf", "lastIndexOf", "forEach", "sort", "reverce"].forEach(function(methodName) {
        delete DOMElementCollection.prototype[methodName];
    });

    // use Array.prototype implementation to return regular array
    DOMElementCollection.prototype.map = Array.prototype.map;

    // DOMMethodError
    DOMMethodError.prototype = new Error();

    // initialize constants
    DOM = Object.create(new DOMElement(htmlEl), {
        create: {
            value: function(tagName, attrs, content) {
                if (typeof tagName !== "string") {
                    throw new DOMMethodError("create");
                }

                var elem;

                if (tagName.charAt(0) === "<") {
                    elem = document.createElement("div");
                    elem.innerHTML = tagName;

                    if (elem.children.length > 1) {
                        throw new DOMMethodError("create");
                    }

                    elem = elem.firstChild;
                } else {
                    elem = document.createElement(tagName);
                }

                elem = DOMElement(elem);

                if (content) {
                    if (typeof content !== "string") {
                        throw new DOMMethodError("create");
                    }

                    attrs.innerHTML = content;
                }

                if (attrs) {
                    if (typeof attrs !== "object") {
                        throw new DOMMethodError("create");
                    }

                    elem.set(attrs);
                }
                
                return elem;
            }
        },
        ready: {
            value: (function() {
                var readyCallbacks = null,
                    readyProcess = function() {
                        if (readyCallbacks) {
                            // trigger callbacks
                            readyCallbacks.forEach(function(callback) {
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
                        throw new DOMMethodError("ready");
                    }

                    if (readyCallbacks) {
                        readyCallbacks.push(callback);
                    } else {
                        callback();
                    }
                };
            })()
        }
    });

    [DOMElement, DOMElementCollection].forEach(function(ctr) {
        // fix constructor
        ctr.prototype.constructor = ctr;
    });

    // API protection
    [DOMElement.prototype, DOMElementCollection.prototype, NullDOMElement.prototype, DOM].forEach(function(obj) {
        Object.keys(obj).forEach(function(prop) {
            var desc = Object.getOwnPropertyDescriptor(obj, prop);

            desc.writable = false;
            desc.configurable = false;
            desc.enumerable = false;

            Object.defineProperty(obj, prop, desc);
        });
    });

    // register API
    if (typeof window.define === "function") {
        window.define("DOM", [], function() { return DOM; });
    } else {
        window.DOM = DOM;
    }

})(window, document, undefined);