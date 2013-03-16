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
                    value: node 
                },
                data: {
                    value: function(name, value) {
                        if (typeof name !== "string") {
                            throw new DOMMethodCallError("data");
                        }

                        var storage = dataStorage;

                        if (name.charAt(0) === "@") {
                            storage = eventsStorage;
                            name = name.substr(1);
                        }

                        if (value === undefined) {
                            return storage[name];
                        }

                        storage[name] = value;

                        return this;
                    }
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
                        throw new DOMMethodCallError("quickParse");
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
        DOMMethodCallError = function(methodName, objectName, hashName) {
            this.name = "DOMMethodCallError";
            // http://domjs.net/doc/{objectName}/{methodName}[#{hashName}]
            this.message = "Illegal " + methodName + " method call";
        };

    // DOMElement

    DOMElement.prototype = {
        matches: function(selector) {
            return new SelectorMatcher(selector).test(this._el);
        },
        find: function(selector) {
            if (typeof selector !== "string") {
                throw new DOMMethodCallError("find");
            }

            var node;

            if (selector.charAt(0) === "#" && selector.indexOf(" ") === -1) {
                node = document.getElementById(selector.substr(1));
            } else {
                node = this._el.querySelector(selector);
            }
            
            return DOMElement(node);
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
                    throw new DOMMethodCallError("findAll");
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
                    return element.every(function(element) {
                        return this.contains(element);
                    }, this);
                } else {
                    throw new DOMMethodCallError("contains");
                }
            };
        })(),
        capture: (function() {
            var nodeProperties = ["target", "currentTarget", "relatedTarget", "srcElement", "toElement", "fromElement"];
                
            return function(event, callback, thisPtr, bubbling) {
                if (typeof callback !== "function") {
                    throw new DOMMethodCallError("on");
                }

                var selectorStart = event.indexOf(" "),
                    eventType = bubbling && ~selectorStart ? event.substr(0, selectorStart) : event,
                    selector = bubbling && ~selectorStart ? event.substr(selectorStart + 1) : undefined,
                    matcher = selector ? new SelectorMatcher(selector) : null,
                    handleEvent = function(e) {
                        var propertyDescriptors = {};
                        // modify event object
                        nodeProperties.forEach(function(propertyName) {
                            var node = e[propertyName], element;

                            if (node) {
                                Object.defineProperty(e, propertyName, {
                                    // lazy create DOMElement objects
                                    get: function() {
                                        return element || ( element = DOMElement(node) );
                                    }
                                });

                                propertyDescriptors[propertyName] = { value: node };    
                            }
                        });
                        // ignore return value
                        callback.call(thisPtr, e);
                        // restore event object properties
                        Object.defineProperties(e, propertyDescriptors);
                    },
                    parentNode = this._el.parentNode,
                    eventDataKey = "@" + event,
                    eventDataEntries = this.data(eventDataKey),
                    eventDataEntry = {
                        key: callback, 
                        value: !selector ? handleEvent : function(e) {
                            for (var el = e.target; el !== parentNode; el = el.parentNode) {
                                if (matcher.test(el)) {
                                    return handleEvent(e);
                                }
                            }
                        }
                    };
                // attach event listener
                this._el.addEventListener(eventType, eventDataEntry.value, !bubbling);
                // store event entry
                if (eventDataEntries) {
                    eventDataEntries.push(eventDataEntry);
                } else {
                    this.data(eventDataKey, [eventDataEntry]);
                }

                return this;
            };
        })(),
        on: function(event, handler, thisPtr) {
            var eventType = typeof event;

            thisPtr = thisPtr || this;

            if (eventType === "string") {
                this.capture(event, handler, thisPtr, true);
            } else if (eventType === "object") {
                Object.keys(event).forEach(function(key) {
                    this.capture(key, event[key], thisPtr, true);
                }, this);
            } else if (Array.isArray(event)) {
                event.forEach(function(key) {
                    this.capture(key, handler, thisPtr, true);
                }, this);
            } else {
                throw new DOMMethodCallError("on");
            }

            return this;
        },
        off: function(event, handler) {
            if (typeof event !== "string" || handler !== undefined && typeof handler !== "function") {
                throw new DOMMethodCallError("off");
            }

            var eventDataKey = "@" + event,
                eventDataEntries = this.data(eventDataKey),
                eventType = event.split(" ")[0];

            if (eventDataEntries) {
                this.data(eventDataKey, eventDataEntries.filter(function(eventDataEntry) {
                    if (handler && handler !== eventDataEntry.key) {
                        return true;
                    }
                    // remove event listener from the element
                    this._el.removeEventListener(eventType, eventDataEntry.value, false);
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
            if (typeof name !== "string") {
                throw new DOMMethodCallError("get");
            }

            return this._el[name] || this._el.getAttribute(name);
        },
        set: function(name, value) {
            var nameType = typeof name,
                valueType = typeof value;

            if (valueType === "function") {
                value = value.call(this, this.get(name));
                valueType = typeof value;
            }

            if (nameType === "string") {
                if (value !== null && valueType !== "string") {
                    throw new DOMMethodCallError("set");
                }

                if (value === null) {
                    this._el.removeAttribute(name);
                } else if (name in this._el) {
                    this._el[name] = value;
                } else {
                    this._el.setAttribute(name, value);
                } 
            } else if (Array.isArray(name)) {
                name.forEach(function(name) {
                    this.set(name, value);
                }, this);
            } else if (nameType === "object") {
                Object.keys(name).forEach(function(key) {
                    this.set(key, name[key]);
                }, this);
            } else {
                throw new DOMMethodCallError("set");
            }

            return this;
        },
        clone: function(deep) {
            return new DOMElement(this._el.cloneNode(deep));
        },
        css: function(property, value) {
            var propType = typeof property;

            if (property === undefined) {
                return window.getComputedStyle(this._el);
            }

            if (propType === "string") {
                if (value === undefined) {
                    return this._el.style[property] || window.getComputedStyle(this._el)[property];
                }

                this._el.style[property] = value;
            } else if (propType === "object") {
                Object.keys(property).forEach(function(key) {
                    this.css(key, property[key]);
                }, this);
            } else {
                throw new DOMMethodCallError("css");
            }

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
                    throw new DOMMethodCallError("html");
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
            var bodyEl = document.body,
                boundingRect = this._el.getBoundingClientRect(),
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
        },
        call: function(name) {
            if (arguments.length === 1) {
                return this._el[name]();
            } else {
                return this._el[name].apply(this._el, Array.prototype.slice.call(arguments, 1));
            }
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

                while ( (node = node[propertyName]) && matcher && matcher.test(node) );

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
                            element.forEach(populateNode, relatedNode);
                        } else if (ctr === String) {
                            relatedNode = document.createElement("div");
                            relatedNode.innerHTML = element;
                            relatedNode = relatedNode.firstElementChild;
                        }
                    } else {
                        // indicate case with remove() function
                        relatedNode = parent;
                    }

                    if (relatedNode) {
                       process(this._el, relatedNode, parent);
                    } else {
                        throw new DOMMethodCallError(methodName);
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
                    return this._el.classList.constains(className);
                },
                addClass: function(className) {
                    this._el.classList.add(className);
                },
                removeClass: function(className) {
                    this._el.classList.remove(className);
                },
                toggleClass: function(className) {
                    this._el.classList.toggle(className);
                }
            } : {
                hasClass: function(className) {
                    return !!~((" " + this._el.className + " ")
                            .replace(rclass, " ")).indexOf(" " + className + " ");
                },
                addClass: function(className) {
                    if (!this.hasClass(className)) {
                        this._el.className += " " + className;
                    }
                },
                removeClass: function(className) {
                    this._el.className = (" " + this._el.className + " ")
                            .replace(rclass, " ").replace(" " + className + " ", " ").trim();
                },
                toggleClass: function(className) {
                    var originalClassName = this._el.className;

                    this.addClass(className);

                    if (originalClassName !== this._el.className) {
                        this.removeClass(className);
                    }
                }
            };

        Object.keys(strategies).forEach(function(methodName) {
            var process = strategies[methodName];

            DOMElement.prototype[methodName] = function(classNames) {
                if (typeof classNames === "string") {
                    return process.call(this, classNames);
                } else if (Array.isArray(classNames)) {
                    return classNames[methodName === "hasClass" ? "every" : "forEach"](process, this) || this;
                } else {
                    throw new DOMMethodCallError(methodName);
                }
            };
        });

    })();

    // NullDOMElement
    Object.keys(DOMElement.prototype).concat(["data"]).forEach(function(method) {
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

            this.forEach(process, slice.call(arguments, 0));

            return this;
        };
    });

    // cleanup prototype by saving only specific methods
    ["pop", "push", "shift", "splice", "unshift", "concat", "join", "slice", "toSource", "toString", 
    "toLocaleString", "indexOf", "lastIndexOf", "sort", "reverse", "reduce", "reduceRight"].forEach(function(methodName) {
        delete DOMElementCollection.prototype[methodName];
    });

    // use Array.prototype implementation to return regular array
    DOMElementCollection.prototype.map = Array.prototype.map;

    // DOMMethodCallError
    DOMMethodCallError.prototype = new Error();

    // initialize constants
    DOM = Object.create(new DOMElement(htmlEl), {
        create: {
            value: function(tagName, attrs, content) {
                var elem;

                if (typeof tagName == "string") {
                    if (tagName.charAt(0) === "<") {
                        elem = document.createElement("div");
                        elem.innerHTML = tagName;

                        if (elem.children.length > 1) {
                            throw new DOMMethodCallError("create");
                        }

                        elem = elem.firstChild;
                    } else {
                        elem = document.createElement(tagName);
                    }
                } else {
                    elem = tagName;
                }

                elem = DOMElement(elem);

                if (content) {
                    if (typeof content !== "string") {
                        throw new DOMMethodCallError("create");
                    }

                    attrs.innerHTML = content;
                }

                if (attrs) {
                    if (typeof attrs !== "object") {
                        throw new DOMMethodCallError("create");
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
                        throw new DOMMethodCallError("ready");
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

    // fix constructors
    [DOMElement, DOMElementCollection].forEach(function(ctr) {
        ctr.prototype.constructor = ctr;
    });

    // API protection
    [DOMElement.prototype, DOMElementCollection.prototype, NullDOMElement.prototype].forEach(function(proto) {
        Object.freeze(proto);
    });

    // register API
    if (typeof window.define === "function") {
        window.define("DOM", [], function() { return DOM; });
    } else {
        window.DOM = DOM;
    }

})(window, document, undefined);