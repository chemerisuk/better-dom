/*!
 * DOM.js
 * Modern javascript library for working with DOM
 *
 * Copyright (c) 2013 Maksim Chemerisuk
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
/*jslint browser:true boss:true*/
/*global define CustomEvent */
(function(window, document, undefined, docElem) {
    "use strict";

    var factory = (function() {
            var repository = [];
       
            return {
                get: function(guid) {
                    return repository[guid];
                },
                remove: function(guid) {
                    repository[guid] = null;
                },
                create: function(native) {
                    if (!native) return new NullElement();
                    
                    var instance = native._DOM;
                    
                    if (!instance) {
                        if (native.length === undefined) {
                            native._DOM = (instance = new DOMElement(native));
                        } else {
                            instance = new DOMElements();
                
                            Array.prototype.forEach.call(native, function(e) {
                                instance.push(factory.create(e));
                            });
                        }
                        
                        instance.guid = repository.push(native) - 1;
                        // data should be a simple object without toString, hasOwnProperty etc.
                        instance.data = Object.create(null);
                    }
                
                    return instance;
                }
            };
        })(),
        // classes
        DOMElement = function() { },
        DOMElements = (function() {
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
        NullElement = function() { },
        // errors
        DOMMethodError = function(methodName, objectName, hashName) {
            this.name = "DOMMethodError";
            // http://domjs.net/doc/{objectName}/{methodName}[#{hashName}]
            this.message = "Invalid call of the " + methodName +
                " method. See http://domjs.net/doc/" + methodName + " for details";
        };

    // DOMElement

    DOMElement.prototype = {
        matches: (function() {
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
                lastQuick, lastQuickSelector, matchesProperty;

            ["m","oM","msM","mozM","webkitM"].some(function(prefix) {
                return !!docElem[matchesProperty = prefix + "atchesSelector"];
            });

            return function(node, selector) {
                var quick;

                if (lastQuick && lastQuickSelector === selector) {
                    quick = lastQuick;
                } else if (typeof selector === "string") {
                    quick = quickParse(selector);
                } else {
                    throw new DOMMethodError("matches");
                }

                if (quick) {
                    lastQuick = quick;
                    lastQuickSelector = selector;

                    return quickIs(node, quick);
                } else {
                    return node[matchesProperty](selector);
                }
            };
        })(),
        find: function(node, selector) {
            if (typeof selector !== "string") {
                throw new DOMMethodError("find");
            }

            var element;

            if (selector.charAt(0) === "#" && selector.indexOf(" ") === -1) {
                element = document.getElementById(selector.substr(1));
            } else {
                element = node.querySelector(selector);
            }
            
            return factory.create(element);
        },
        contains: (function() {
            var containsElement = Node.prototype.contains ?
                function(element) {
                    return this.contains(factory.get(element.guid));
                } :
                function(element) {
                    return !!(this.compareDocumentPosition(factory.get(element.guid)) & 16);
                };

            return function(node, element) {
                var ctr = element.constructor;

                if (ctr === DOMElement) {
                    return containsElement.call(node, element);
                } else if (ctr === DOMElements) {
                    return factory.get(element.guid).every(containsElement, node);
                } else {
                    throw new DOMMethodError("contains");
                }
            };
        })(),
        fire: function(node, eventType, detail) {
            var event;
            
            if (detail !== undefined) {
                event = new CustomEvent(eventType, {detail: detail});
            } else {
                event = document.createEvent(eventType);
                event.initEvent(eventType, true, true);
            }
            
            node.dispatchEvent(event);

            return node;
        },
        get: function(node, name) {
            var value = node[name];
            
            if (value === undefined) {
                value = node.getAttribute(name);
            }
            
            return value;
        },
        call: function(node, name) {
            var functor = node[name], result;

            if (typeof functor !== "function") {
                throw new DOMMethodError("call");
            }

            result = functor.apply(node, arguments.length > 2 ?
                Array.prototype.splice.call(arguments, 2) : undefined);

            return result === undefined ? node : result;
        },
        clone: function(node, deep) {
            return factory.create(node.clone(deep));
        },
        css: function(node) {
            return window.getComputedStyle(node);
        },
        index: function(node) {
            var parent = node.parentNode;
            
            if (parent) {
                for (var it = parent.firstElementChild, i = 0; it; it = it.nextElementSibling, ++i) {
                    if (it === node) return i;
                }
            }
            
            return -1;
        }
    };

    DOMElement.prototype.findAll = (function() {
        // big part of code is stoled from Sizzle:
        // https://github.com/jquery/sizzle/blob/master/sizzle.js

        // TODO: disallow to use buggy selectors

        // Easily-parseable/retrievable ID or TAG or CLASS selectors
        var rquickExpr = /^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/,
            rsibling = /[\x20\t\r\n\f]*[+~>]/,
            rsiblingQuick = /\s*([+~>])\s*(\w*(?:#[\w\-]+)?(?:\[[\w\-]+\])?(?:\.[\w\-]+)?)/,
            rescape = /'|\\/g,
            expando = "DOM" + new Date().getTime(),
            matches = DOMElement.prototype.matches,
            contains = DOMElement.prototype.contains;

        return function(node, selector) {
            if (typeof selector !== "string") {
                throw new DOMMethodError("findAll");
            }

            var elements, m, elem, match;

            if (match = rquickExpr.exec(selector)) {
                // Speed-up: "#ID"
                if (m = match[1]) {
                    if (node === docElem) {
                        elem = node.getElementById(m);
                        // Check parentNode to catch when Blackberry 4.6 returns
                        // nodes that are no longer in the document #6963
                        if (elem && elem.parentNode) {
                            // Handle the case where IE, Opera, and Webkit return items
                            // by name instead of ID
                            if (elem.id === m) {
                                elements = [elem];
                            }
                        }
                    } else {
                        // Context is not a document
                        if (node.ownerDocument && (elem = node.ownerDocument.getElementById(m)) &&
                            contains(node, elem) && elem.id === m) {
                            elements = [elem];
                        }
                    }
                // Speed-up: "TAG"
                } else if (match[2]) {
                    elements = node.getElementsByTagName(selector);
                // Speed-up: ".CLASS"
                } else if (m = match[3]) {
                    elements = node.getElementsByClassName(m);
                }
            } else if (match = rsiblingQuick.exec(selector)) {
                selector = match[2];
                elements = [];

                switch (match[1]) {
                    case "+":
                        for (elem = node.nextElementSibling; elem; elem = null) {
                            if (matches(elem, selector)) {
                                elements.push(elem);
                            }
                        }
                        break;

                    case "~":
                        for (elem = node; elem = elem.nextElementSibling; ) {
                            if (matches(elem, selector)) {
                                elements.push(elem);
                            }
                        }
                        break;

                    case ">":
                        for (elem = node.firstElementChild; elem; elem = elem.nextElementSibling) {
                            if (matches(elem, selector)) {
                                elements.push(elem);
                            }
                        }
                        break;
                }
            } else {
                var old = true,
                    nid = expando,
                    newContext = node,
                    newSelector = node === docElem && selector;

                if (node !== docElem) {
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

            return factory.create(elements);
        };
    })();

    DOMElement.prototype.on = (function() {
        var matches = DOMElement.prototype.matches,
            nodeProperties = ["target", "currentTarget", "relatedTarget"],
            modifyProperties = function(prop) {
                var node = this[prop];

                if (node) {
                    delete this[prop];

                    this[prop] = factory.create(node);
                }

                return node;
            },
            processHandlers = function(node, event, selector, handler, thisPtr) {
                if (typeof handler !== "function") {
                    throw new DOMMethodError("on");
                }

                thisPtr = thisPtr || node._DOM;

                var nativeEventHandler = function(e) {
                        // modify event object
                        var props = nodeProperties.map(modifyProperties, e);

                        handler.call(thisPtr, e);

                        // restore event object
                        nodeProperties.forEach(function(prop, i) {
                            e[prop] = props[i];
                        });
                    };
                // TODO: store handler in _events property of the native element
                node.addEventListener(event, !selector ? nativeEventHandler : function(e) {
                    for (var el = e.target, root = node.parentNode; el !== root; el = el.parentNode) {
                        if (matches(el, selector)) {
                            nativeEventHandler(e);

                            break;
                        }
                    }
                }, false);
            };

        return function(node, event, selector, handler, thisPtr) {
            var selectorType = typeof selector,
                eventType = typeof event;

            if (selectorType === "function") {
                thisPtr = handler;
                handler = selector;
                selector = undefined;
            } else if (selector && selectorType !== "string") {
                throw new DOMMethodError("on");
            }

            if (eventType === "string") {
                processHandlers(node, event, selector, handler, thisPtr);
            } else if (event && eventType === "object") {
                Object.keys(event).forEach(function(eventType) {
                    processHandlers(node, eventType, undefined, event[eventType], thisPtr);
                });
            } else {
                throw new DOMMethodError("on");
            }

            return node;
        };
    })();

    DOMElement.prototype.set = (function() {
        var getter = DOMElement.prototype.get,
            processAttribute = function(node, name, value) {
                var valueType = typeof value;

                if (valueType === "function") {
                    value = value.call(node._DOM, getter(node, name));
                } else if (valueType !== "string") {
                    throw new DOMMethodError("set");
                }

                if (name in node) {
                    node[name] = value;
                } else {
                    node.setAttribute(name, value);
                }
            };

        return function(node, name, value) {
            var nameType = typeof name;

            if (nameType === "string") {
                processAttribute(node, name, value);
            } else if (name && nameType === "object") {
                Object.keys(name).forEach(function(attrName) {
                    processAttribute(node, attrName, name[attrName]);
                });
            } else {
                throw new DOMMethodError("set");
            }

            return node;
        };
    })();

    // dom traversing
    (function() {
        var matches = DOMElement.prototype.matches,
            strategies = {
                firstChild: "firstElementChild",
                lastChild: "lastElementChild",
                parent: "parentNode",
                next: "nextElementSibling",
                prev: "previousElementSibling"
            };

        Object.keys(strategies).forEach(function(methodName) {
            var propertyName = strategies[methodName];

            DOMElement.prototype[methodName] = function(node, selector) {
                while ( !(node = node[propertyName]) || !selector || matches(node, selector) );

                return factory.create(node);
            };
        });

    })();

    // dom manipulation
    (function() {
        // http://www.w3.org/TR/domcore/
        // 5.2.2 Mutation methods
        var populateNode = function(element) {
                this.appendChild(factory.get(element.guid));
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
                    // cleanup cache entry
                    factory.remove(node._DOM.guid);
                }
            };

        Object.keys(strategies).forEach(function(methodName) {
            var process = strategies[methodName];

            DOMElement.prototype[methodName] = function(node, element) {
                var parent = node.parentNode;

                if (parent) {
                    var relatedNode, ctr;

                    if (element) {
                        ctr = element.constructor;

                        if (ctr === DOMElement) {
                            relatedNode = factory.get(element.guid);
                        } else if (ctr === DOMElements) {
                            relatedNode = document.createDocumentFragment();

                            factory.get(element.guid).forEach(populateNode, relatedNode);
                        }
                    } else {
                        relatedNode = parent;
                    }

                    if (relatedNode) {
                       process(node, relatedNode, parent);
                    } else {
                        throw new DOMMethodError(methodName);
                    }
                }

                return node;
            };
        });
    })();

    // css classes manipulation
    (function() {
        var rclass = /[\n\t\r]/g,
            strategies = docElem.classList ? {
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

            DOMElement.prototype[methodName] = function(node, className) {
                if (typeof className !== "string") {
                    throw new DOMMethodError(methodName);
                }

                var classes = className.split(" ");

                if (methodName === "hasClass") {
                    return classes.every(process, node);
                } else {
                    classes.forEach(process, node);

                    return node;
                }
            };
        });

    })();

    // add guid support to prototype methods
    Object.keys(DOMElement.prototype).forEach(function(methodName) {
        var method = DOMElement.prototype[methodName];

        DOMElement.prototype[methodName] = function() {
            var node = factory.get(this.guid),
                getter = function(a, b, c, d, e) {
                    var result = method(node, a, b, c, d, e);

                    return result === node ? this : result;
                };

            Object.defineProperty(this, methodName, {
                value: getter,
                writable: false,
                configurable: false
            });

            return getter.apply(this, arguments);
        };
    });

    // DOMElements

    // shortcuts
    ["set", "on", "show", "hide", "addClass", "removeClass", "toggleClass"].forEach(function(methodName) {
        var slice = Array.prototype.slice,
            process = function(element) {
                // 'this' will be an arguments object
                element[methodName].apply(element, this);
            };

        DOMElements.prototype[methodName] = function() {
            var args = slice.call(arguments, 0);

            this.forEach(process, args);

            return this;
        };
    });

    // initialize null element prototype
    NullElement.prototype = {};

    Object.keys(DOMElement.prototype).forEach(function(method) {
        // each method is a noop function
        NullElement.prototype[method] = function() {};
    });
    
    // DOMMethodError
    DOMMethodError.prototype = new Error();

    // finish prototypes
    [DOMElement, DOMElements, NullElement].forEach(function(ctr) {
        // fix constructor
        ctr.prototype.constructor = ctr;
        // lock interfaces
        if (Object.freeze) {
            Object.freeze(ctr.prototype);
        }
    });

    // initialize publicAPI
    var publicAPI = Object.create(factory.create(docElem), {
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

                elem = factory.create(elem);

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

    // make static properties readonly
    Object.getOwnPropertyNames(publicAPI).forEach(function(prop) {
        var desc = Object.getOwnPropertyDescriptor(publicAPI, prop);

        desc.configurable = false;
        desc.writable = false;

        Object.defineProperty(publicAPI, prop, desc);
    });

    // register API
    if (window.define) {
        define("DOM", [], function() { return publicAPI; });
    } else {
        window.DOM = publicAPI;
    }

})(window, document, undefined, document.documentElement);