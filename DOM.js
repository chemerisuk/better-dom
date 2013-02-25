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
        slice = Array.prototype.slice,
        // classes
        DOMElement = function(node) {
            if (!this) {
                // TODO: check if such element was created?
                return node ? new DOMElement(node) : new NullDOMElement();
            }

            Object.defineProperties(this, {
                _node: {
                    value: node,
                    writable: false,
                    enumerable: false,
                    configurable: false
                },
                _events: {
                    value: Object.create(null),
                    writable: false,
                    enumerable: false,
                    configurable: false
                },
                data: {
                    value: Object.create(null),
                    writable: false,
                    configurable: false
                }
            });
        },
        DOMElementCollection = function(nodes) {
            var elems = Array.prototype.map.call(nodes, DOMElement);
            
            Object.defineProperties(this, {
                each: {
                    value: function(callback, thisPtr) {
                        elems.forEach(function(elem, index) {
                            callback.call(thisPtr, elem, index);
                        });

                        return this;
                    },
                    writable: false,
                    configurable: false
                },
                some: {
                    value: function(callback, thisPtr) {
                        return elems.some(function(elem, index) {
                            return callback.call(thisPtr, elem, index);
                        });
                    },
                    writable: false,
                    configurable: false
                },
                every: {
                    value: function(callback, thisPtr) {
                        return elems.every(function(elem, index) {
                            return callback.call(thisPtr, elem, index);
                        });
                    },
                    writable: false,
                    configurable: false
                },
                map: {
                    value: function(callback, thisPtr) {
                        return elems.map(function(elem, index) {
                            return callback.call(thisPtr, elem, index);
                        });
                    },
                    writable: false,
                    configurable: false
                },
                length: {
                    value: elems.length,
                    writable: false,
                    configurable: false
                }
            });
        },
        NullDOMElement = function() {
            DOMElement.call(this, null);
        },
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
                    var attrs = elem.attributes || {};
                    
                    return (
                        (!m[1] || elem.nodeName.toLowerCase() === m[1]) &&
                        (!m[2] || (attrs.id || {}).value === m[2]) &&
                        (!m[3] || m[3] in attrs) &&
                        (!m[4] || ~(" " + (attrs["class"] || "").value  + " ").indexOf(m[4]))
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

            return matcher.test(this._node);
        },
        find: function(selector) {
            if (typeof selector !== "string") {
                throw new DOMMethodError("find");
            }

            var result;

            if (selector.charAt(0) === "#" && selector.indexOf(" ") === -1) {
                result = document.getElementById(selector.substr(1));
            } else {
                result = this._node.querySelector(selector);
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
                expando = "DOM" + new Date().getTime();

            return function(selector) {
                if (typeof selector !== "string") {
                    throw new DOMMethodError("findAll");
                }

                var elements, m, elem, match, node = this._node, matcher;

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
                        elements = slice.call(node.getElementsByTagName(selector), 0);
                    // Speed-up: ".CLASS"
                    } else if (m = match[3]) {
                        elements = slice.call(node.getElementsByClassName(m), 0);
                    }
                } else if (match = rsiblingQuick.exec(selector)) {
                    selector = match[2];
                    elements = [];
                    matcher = new SelectorMatcher(selector, true);

                    switch (match[1]) {
                        case "+":
                            for (elem = node.nextElementSibling; elem; elem = null) {
                                if (matcher.test(elem)) {
                                    elements.push(elem);
                                }
                            }
                            break;

                        case "~":
                            for (elem = node; elem = elem.nextElementSibling; ) {
                                if (matcher.test(elem)) {
                                    elements.push(elem);
                                }
                            }
                            break;

                        case ">":
                            for (elem = node.firstElementChild; elem; elem = elem.nextElementSibling) {
                                if (matcher.test(elem)) {
                                    elements.push(elem);
                                }
                            }
                            break;
                    }
                } else {
                    var old = true,
                        nid = expando,
                        newContext = node,
                        newSelector = this === DOM && selector;

                    if (this !== DOM) {
                        // qSA works strangely on Element-rooted queries
                        // We can work around this by specifying an extra ID on the root
                        // and working up from there (Thanks to Andrew Dupont for the technique)
                        if ( (old = node.getAttribute("id")) ) {
                            nid = old.replace(rescape, "\\$&");
                        } else {
                            node.setAttribute("id", nid);
                        }

                        nid = "[id='" + nid + "'] ";

                        newContext = rsibling.test(selector) && node.parentNode || node;
                        newSelector = nid + selector.replace(/","/g, "," + nid);
                    }

                    if (newSelector) {
                        try {
                            elements = newContext.querySelectorAll(newSelector);
                        } catch(qsaError) {
                        } finally {
                            if ( !old ) {
                                node.removeAttribute("id");
                            }
                        }
                    }
                }

                return new DOMElementCollection(elements || []);
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
                    return containsElement(this._node, element._node);
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
                        eventsEntry = {
                            key: handler, 
                            value: !selector ? nativeEventHandler : function(e) {
                                for (var el = e.target, root = element._node.parentNode; el !== root; el = el.parentNode) {
                                    if (matcher.test(el)) {
                                        nativeEventHandler(e);

                                        break;
                                    }
                                }
                            }
                        };
                    // attach event listener
                    element._node.addEventListener(event, eventsEntry.value, false);
                    // store event entry
                    ( element._events[event] || (element._events[event] = []) ).push(eventsEntry);
                };

            return function(event, handler, thisPtr) {
                var eventType = typeof event;

                thisPtr = thisPtr || this;

                if (eventType === "string") {
                    processHandlers(this, event, handler, thisPtr);
                } else if (eventType === "object") {
                    Object.keys(event).forEach(function(key) {
                        processHandlers(this, key, event[eventType], thisPtr);
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

            ( this._events[event] || [] ).forEach(function(eventsEntry, index, eventsEntries) {
                if (!handler || handler === eventsEntry.key) {
                    this._node.removeEventListener(event, eventsEntry.value, false);
                    // TODO: find a better way to free memory
                    eventsEntries[index] = undefined;
                }
            });

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
            
            this._node.dispatchEvent(event);

            return this;
        },
        get: function(name) {
            var value = this._node[name];
            
            return value !== undefined ? value : this._node.getAttribute(name);
        },
        set: (function() {
            var processAttribute = function(element, name, value) {
                    var valueType = typeof value;

                    if (valueType === "function") {
                        value = value.call(this, element.get(name));
                    } else if (valueType !== "string") {
                        throw new DOMMethodError("set");
                    }

                    if (name in element._node) {
                        element._node[name] = value;
                    } else {
                        element._node.setAttribute(name, value);
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
        call: function(name) {
            var functor = this._node[name], result;

            if (typeof functor !== "function") {
                throw new DOMMethodError("call");
            }

            result = functor.apply(this._node, arguments.length > 2 ?
                Array.prototype.splice.call(arguments, 2) : undefined);

            return result === undefined ? this : result;
        },
        clone: function(deep) {
            return new DOMElement(this._node.cloneNode(deep));
        },
        css: function() {
            return window.getComputedStyle(this._node);
        },
        value: function(value) {
            var node = this._node, propName;

            if (node.value !== undefined) {
                propName = "value";
            } else if (node.innerText !== undefined) {
                propName = "innerText";
            } else {
                propName = "textContent";
            }

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
            var processScripts = function(el) {
                    if (el.src) {
                        var script = document.createElement("script");

                        script.src = el.src;

                        headEl.removeChild(headEl.appendChild(script));
                    } else {
                        eval(el.innerHTML);
                    }
                };

            return function(value) {
                var node = this._node;

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
                slice.call(node.getElementsByTagName("script"), 0).forEach(processScripts);

                return this;
            };
        })(),
        offset: function() {
            var boundingRect = this._node.getBoundingClientRect(),
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
                var node = this._node,
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
                this.appendChild(element._node);
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

                if (parent = this._node.parentNode) {
                    if (element) {
                        ctr = element.constructor;

                        if (ctr === DOMElement) {
                            relatedNode = element._node;
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
                       process(this._node, relatedNode, parent);
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
                    return classes.every(process, this._node);
                } else {
                    return classes.forEach(process, this._node) || this;
                }
            };
        });

    })();

    // DOMElementCollection

    // shortcuts
    ["set", "on", "show", "hide", "addClass", "removeClass", "toggleClass"].forEach(function(methodName) {
        var process = function(element) {
            // this will be an arguments array
            element[methodName].apply(element, this);
        };

        DOMElementCollection.prototype[methodName] = function() {
            if (this.length === 0) return this;

            return this.each(process, slice.call(arguments, 0));
        };
    });

    // NullDOMElement
    Object.keys(DOMElement.prototype).forEach(function(method) {
        // each method is a noop function
        NullDOMElement.prototype[method] = function() {};
    });

    NullDOMElement.constructor = DOMElement;

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

    // protection
    [DOMElement.prototype, DOMElementCollection.prototype, NullDOMElement.prototype, DOM].forEach(function(obj) {
        Object.keys(obj).forEach(function(prop) {
            var desc = Object.getOwnPropertyDescriptor(obj, prop);

            desc.writable = false;
            desc.configurable = false;

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