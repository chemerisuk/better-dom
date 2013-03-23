/*!
 * DOM.js (https://github.com/chemerisuk/DOM.js)
 * Modern javascript library for working with DOM
 *
 * Copyright (c) 2013 Maksim Chemerisuk
 */
(function(window, document, undefined, slice) {
    "use strict";

    var DOM,
        htmlEl = document.documentElement,
        headEl = document.head,
        // classes 
        DOMElement = function(node) {
            if (node.__DOM__) {
                return node.__DOM__;
            }

            if (!this) {
                return new DOMElement(node);
            }

            node.__DOM__ = this;
            
            Object.defineProperties(this, {
                _do: {
                    value: !node ? function() {} : function(methodName, args) {
                        return DOMElement.prototype[methodName].apply(this, [node].concat(args));
                    }
                },
                // private data objects
                _data: { value: Object.create(null) },
                _events: { value: [] }
            });
        },
        DOMElementCollection = (function() {
            // Create clean copy of Array prototype. Inspired by
            // http://dean.edwards.name/weblog/2006/11/hooray/
            var ref = document.scripts[0],
                iframe = document.createElement("iframe"),
                protoMethods = "forEach map every some filter length".split(" "),
                ctr, proto;
                
            iframe.src = "about:blank";
            iframe.style.display = "none";
                
            ref.parentNode.insertBefore(iframe, ref);
            // store reference to clean Array
            ctr = iframe.contentWindow.Array;
            // cleanup DOM
            ref.parentNode.removeChild(iframe);

            proto = ctr.prototype;
            // operator for internal use only
            ctr._new = proto.map;
            // use Array.prototype implementation to return regular array for map
            proto.map = Array.prototype.map;
            // cleanup collection prototype
            Object.getOwnPropertyNames(proto).forEach(function(methodName) {
                ~protoMethods.indexOf(methodName) || delete proto[methodName];
            });
            // shortcuts
            "set on off capture addClass removeClass toggleClass".split(" ").forEach(function(methodName) {
                var process = function(obj) {
                    // this will be an arguments array
                    obj._do("_" + methodName, this);
                };

                proto[methodName] = function() {
                    if (this.length > 0) {
                        this.forEach(process, slice.call(arguments, 0));
                    }

                    return this;
                };
            });
            
            return ctr;
        })(),
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
        _matches: function(el, selector) {
            return new SelectorMatcher(selector).test(el);
        },
        _find: function(el, selector) {
            if (typeof selector !== "string") {
                throw new DOMMethodCallError("find");
            }

            var node;

            if (selector.charAt(0) === "#" && selector.indexOf(" ") === -1) {
                node = document.getElementById(selector.substr(1));
            } else {
                node = el.querySelector(selector);
            }
            
            return DOMElement(node);
        },
        _findAll: (function() {
            // big part of code is stoled from Sizzle:
            // https://github.com/jquery/sizzle/blob/master/sizzle.js

            // TODO: disallow to use buggy selectors

            // Easily-parseable/retrievable ID or TAG or CLASS selectors
            var rquickExpr = /^(?:#([\w\-]+)|(\w+)|\.([\w\-]+))$/,
                rsibling = /[\x20\t\r\n\f]*[+~>]/,
                rsiblingQuick = /\s*([+~>])\s*(\w*(?:#[\w\-]+)?(?:\[[\w\-]+\])?(?:\.[\w\-]+)?)/,
                rescape = /'|\\/g,
                expando = "DOM" + new Date().getTime();

            return function(el, selector) {
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
                        elements = el.getElementsByTagName(selector);
                    // Speed-up: ".CLASS"
                    } else if (m = match[3]) {
                        elements = el.getElementsByClassName(m);
                    }
                } else if (match = rsiblingQuick.exec(selector)) {
                    selector = match[2];
                    elements = [];
                    matcher = new SelectorMatcher(selector, true);

                    switch (match[1]) {
                        case "+":
                            for (elem = el.nextElementSibling; elem; elem = null) {
                                if (matcher.test(elem)) {
                                    elements.push(elem);
                                }
                            }
                            break;

                        case "~":
                            for (elem = el; elem = elem.nextElementSibling; ) {
                                if (matcher.test(elem)) {
                                    elements.push(elem);
                                }
                            }
                            break;

                        case ">":
                            for (elem = el.firstElementChild; elem; elem = elem.nextElementSibling) {
                                if (matcher.test(elem)) {
                                    elements.push(elem);
                                }
                            }
                            break;
                    }
                } else {
                    var old = true,
                        nid = expando,
                        newContext = el,
                        newSelector = this === DOM && selector;

                    if (this !== DOM) {
                        // qSA works strangely on Element-rooted queries
                        // We can work around this by specifying an extra ID on the root
                        // and working up from there (Thanks to Andrew Dupont for the technique)
                        if ( (old = el.getAttribute("id")) ) {
                            nid = old.replace(rescape, "\\$&");
                        } else {
                            el.setAttribute("id", nid);
                        }

                        nid = "[id='" + nid + "'] ";

                        newContext = rsibling.test(selector) && el.parentNode || el;
                        newSelector = nid + selector.replace(/","/g, "," + nid);
                    }

                    if (newSelector) {
                        try {
                            elements = newContext.querySelectorAll(newSelector);
                        } catch(qsaError) {
                        } finally {
                            if ( !old ) {
                                el.removeAttribute("id");
                            }
                        }
                    }
                }

                return DOMElementCollection._new.call(elements || [], DOMElement);
            };
        })(),
        _contains: (function() {
            var containsElement = Node.prototype.contains ?
                function(parent, child) {
                    return parent.contains(child);
                } :
                function(parent, child) {
                    return !!(parent.compareDocumentPosition(child) & 16);
                };

            return function(node, element, /*INTERNAL*/reverse) {
                var ctr = element.constructor;

                if (element instanceof Node) {
                    return containsElement(reverse ? element : node, reverse ? node : element);
                } else if (ctr === DOMElement) {
                    return element.contains(node, true);
                } else if (ctr === DOMElementCollection) {
                    return element.every(function(element) {
                        return element.contains(node, true);
                    });
                } else {
                    throw new DOMMethodCallError("contains");
                }
            };
        })(),
        _capture: (function() {
            var nodeProperties = ["target", "currentTarget", "relatedTarget", "srcElement", "toElement", "fromElement"];
                
            return function(el, event, callback, thisPtr, bubbling) {
                if (typeof callback !== "function") {
                    throw new DOMMethodCallError("on");
                }

                var selectorStart = event.indexOf(" "),
                    eventType = ~selectorStart ? event.substr(0, selectorStart) : event,
                    selector = ~selectorStart ? event.substr(selectorStart + 1) : null,
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
                    eventEntry = {
                        event: event,
                        callback: callback, 
                        handler: !selector ? handleEvent : function(e) {
                            for (var elem = e.target; elem !== el.parentNode; elem = elem.parentNode) {
                                if (matcher.test(elem)) {
                                    return handleEvent(e);
                                }
                            }
                        }
                    };
                // attach event listener
                el.addEventListener(eventType, eventEntry.handler, !bubbling);
                // store event entry
                this._events.push(eventEntry);

                return this;
            };
        })(),
        _on: function(el, event, handler, thisPtr) {
            var eventType = typeof event;

            thisPtr = thisPtr || this;

            if (eventType === "string") {
                this._capture(el, event, handler, thisPtr, true);
            } else if (eventType === "object") {
                Object.keys(event).forEach(function(key) {
                    this._capture(el, key, event[key], thisPtr, true);
                }, this);
            } else if (Array.isArray(event)) {
                event.forEach(function(key) {
                    this._capture(el, key, handler, thisPtr, true);
                }, this);
            } else {
                throw new DOMMethodCallError("on");
            }

            return this;
        },
        _off: function(node, event, callback) {
            if (typeof event !== "string" || callback !== undefined && typeof callback !== "function") {
                throw new DOMMethodCallError("off");
            }

            var eventType = event.split(" ")[0];

            this._events.forEach(function(entry) {
                if (event === entry.event && (!callback || callback === entry.callback)) {
                    // remove event listener from the element
                    node.removeEventListener(eventType, entry.handler, false);
                }
            });

            return this;
        },
        _fire: function(el, eventType, detail) {
            if (typeof eventType !== "string") {
                throw new DOMMethodCallError("fire");
            }

            var event; 
            
            if (~eventType.indexOf(":")) {
                event = new CustomEvent(eventType, {detail: detail, bubbles: true});
            } else {
                event = document.createEvent(eventType);
                event.initEvent(eventType, true, true);
            }
            
            el.dispatchEvent(event);

            return this;
        },
        _get: function(el, name) {
            if (typeof name !== "string" || ~name.indexOf("Node") || ~name.indexOf("Element")) {
                throw new DOMMethodCallError("get");
            }

            return el[name] || el.getAttribute(name);
        },
        _set: function(el, name, value) {
            var nameType = typeof name,
                valueType = typeof value;

            if (valueType === "function") {
                value = value.call(this, this._get(el, name));
                valueType = typeof value;
            }

            if (nameType === "string") {
                if (value !== null && valueType !== "string") {
                    throw new DOMMethodCallError("set");
                }

                if (value === null) {
                    el.removeAttribute(name);
                } else if (name in el) {
                    el[name] = value;
                } else {
                    el.setAttribute(name, value);
                } 
            } else if (Array.isArray(name)) {
                name.forEach(function(name) {
                    this._set(el, name, value);
                }, this);
            } else if (nameType === "object") {
                Object.keys(name).forEach(function(key) {
                    this._set(el, key, name[key]);
                }, this);
            } else {
                throw new DOMMethodCallError("set");
            }

            return this;
        },
        _clone: function(el, deep) {
            return new DOMElement(el.cloneNode(deep));
        },
        _css: function(el, property, value) {
            var propType = typeof property;

            if (property === undefined) {
                return window.getComputedStyle(el);
            }

            if (propType === "string") {
                if (value === undefined) {
                    return el.style[property] || window.getComputedStyle(el)[property];
                }

                el.style[property] = value;
            } else if (propType === "object") {
                Object.keys(property).forEach(function(key) {
                    this._css(el, key, property[key]);
                }, this);
            } else {
                throw new DOMMethodCallError("css");
            }

            return this;
        },
        _html: (function() {
            var processScripts = function(el) {
                    if (el.src) {
                        var script = document.createElement("script");

                        script.src = el.src;

                        headEl.removeChild(headEl.appendChild(script));
                    } else {
                        eval(el.textContent);
                    }
                };

            return function(el, value) {
                if (value === undefined) {
                    return el.innerHTML;
                }

                if (typeof value !== "string") {
                    throw new DOMMethodCallError("html");
                }
                // fix NoScope elements in IE9-
                el.innerHTML = "&shy;" + value;
                el.removeChild(el.firstChild);
                // fix script elements
                DOMElementCollection.prototype.forEach.call(slice.call(el.getElementsByTagName("script"), 0), processScripts);

                return this;
            };
        })(),
        _offset: function(el) {
            var bodyEl = document.body,
                boundingRect = el.getBoundingClientRect(),
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
        _call: function(el, name) {
            if (arguments.length === 1) {
                return el[name]();
            } else {
                return el[name].apply(el, slice.call(arguments, 1));
            }
        },
        _data: function(node, name, value) {
            if (typeof name !== "string") {
                throw new DOMMethodCallError("data");
            }

            var result;

            if (value === undefined) {
                result = this._data[name];

                if (result === undefined && node.hasAttribute("data-" + name)) {
                    result = this._data[name] = node.getAttribute("data-" + name);
                }
            } else {
                this._data[name] = value;

                result = this;
            }

            return result;
        }
    };

    // dom traversing
    (function() {
        var strategies = {
                firstChild: "firstElementChild",
                lastChild: "lastElementChild",
                next: "nextElementSibling",
                prev: "previousElementSibling"
            };

        Object.keys(strategies).forEach(function(methodName) {
            var propertyName = strategies[methodName];

            DOMElement.prototype["_" + methodName] = function(node, selector) {
                var matcher = selector ? new SelectorMatcher(selector) : null;

                while ( (node = node[propertyName]) && matcher && matcher.test(node) );

                return DOMElement(node);
            };
        });

    })();

    // dom manipulation
    (function() {
        // http://www.w3.org/TR/domcore/
        // 5.2.2 Mutation methods
        var strategies = {
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

            DOMElement.prototype["_" + methodName] = function(node, element, /*INTERNAL*/reverse) {
                var parent = node.parentNode, relatedNode;

                if (element) {
                    relatedNode = document.createElement("div");
                    relatedNode.innerHTML = element;
                    relatedNode = relatedNode.firstElementChild;
                } else {
                    // indicate case with remove() function
                    relatedNode = parent;
                }

                if (relatedNode) {
                   process(node, relatedNode, parent);
                } else {
                    throw new DOMMethodCallError(methodName);
                }

                return this;
            };
        });
    })();

    // css classes manipulation
    (function() {
        var rclass = /[\n\t\r]/g,
            strategies = htmlEl.classList ? {
                hasClass: function(el, className) {
                    return el.classList.constains(className);
                },
                addClass: function(el, className) {
                    el.classList.add(className);
                },
                removeClass: function(el, className) {
                    el.classList.remove(className);
                },
                toggleClass: function(el, className) {
                    el.classList.toggle(className);
                }
            } : {
                hasClass: function(el, className) {
                    return !!~((" " + el.className + " ")
                            .replace(rclass, " ")).indexOf(" " + className + " ");
                },
                addClass: function(el, className) {
                    if (!this.hasClass(className)) {
                        el.className += " " + className;
                    }
                },
                removeClass: function(el, className) {
                    el.className = (" " + el.className + " ")
                        .replace(rclass, " ").replace(" " + className + " ", " ").trim();
                },
                toggleClass: function(el, className) {
                    var originalClassName = el.className;

                    this.addClass(className);

                    if (originalClassName !== el.className) {
                        this.removeClass(className);
                    }
                }
            };

        Object.keys(strategies).forEach(function(methodName) {
            var process = strategies[methodName];

            DOMElement.prototype["_" + methodName] = function(el, classNames) {
                if (typeof classNames === "string") {
                    return process.call(this, el, classNames);
                } else if (Array.isArray(classNames)) {
                    if (methodName === "hasClass") {
                        return classNames.every(function(className) {
                            process.call(this, el, className);
                        }, this);
                    } else {
                        classNames.forEach(function(className) {
                            process.call(this, el, className);
                        }, this);

                        return this;
                    }
                } else {
                    throw new DOMMethodCallError(methodName);
                }
            };
        });

    })();

    Object.keys(DOMElement.prototype).forEach(function(key) {
        DOMElement.prototype[key.substr(1)] = function() {
            return this._do(key, slice.call(arguments, 0));
        };
    });

    // types finalization
    [DOMElement, DOMElementCollection].forEach(function(ctr) {
        var proto = ctr.prototype;
        // fix constructor
        proto.constructor = ctr;
        // make all methods not to be enumerable
        Object.keys(proto).forEach(function(key) {
            Object.defineProperty(proto, key, {
                value: proto[key],
                enumerable: false
            });
        });
        // prevent extensions
        Object.preventExtensions(proto);
    });

    // DOMMethodCallError
    DOMMethodCallError.prototype = new Error();

    // initialize constants
    DOM = Object.create(new DOMElement(htmlEl), {
        create: {
            value: function(tagName) {
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

                return DOMElement(elem);
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

    // register API
    if (typeof window.define === "function") {
        window.define("DOM", [], function() { return DOM; });
    } else {
        window.DOM = DOM;
    }

})(window, document, undefined, Array.prototype.slice);