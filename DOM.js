/*!
 * DOM.js
 *
 * Copyright (c) 2013 Maksim Chemerisuk
 *
 * 1) encapsulation: completely hides native objects
 * 2) usability: provides more friendly apis
 * 3) safety: api can't be changed after initialization
 * 4) performance: use native methods where it's possible
 * 5) self-documenting: every error message has a link with detailed explaination
 * 6) jsdoc, generate documentation by it
 */
/*jslint browser:true boss:true*/
/*global define CustomEvent */
// TODO: remove, specs
(function(window, document, undefined, docElem) {
    "use strict";

    var factory = (function() {
        var storage = [];
   
            return {
                get: function(guid) {
                    return storage[guid];
                },
                remove: function(guid) {
                    storage[guid] = null;
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
                        
                        instance.guid = storage.push(native) - 1;
                        // data should be a simple object without toString, hasOwnProperty etc.
                        instance.data = Object.create(null);
                    }
                
                    return instance;
                }
            };
        })(),
        // helpers
        rquickIs = /^(\w*)(?:#([\w\-]+))?(?:\[([\w\-]+)\])?(?:\.([\w\-]+))?$/,
        
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
        // classes
        DOMElement = function() { },
        DOMElements = (function() {
            // Creates clean copy of Array prototype. Inspired by
            // http://dean.edwards.name/weblog/2006/11/hooray/
            var ref = document.getElementsByTagName('script')[0],
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

    // Required Polyfills. They will make code lighter

    // http://www.quirksmode.org/blog/archives/2006/01/contains_for_mo.html
    if (window.Node && Node.prototype && !Node.prototype.contains) {
        Node.prototype.contains = function(arg) {
            return !!(this.compareDocumentPosition(arg) & 16);
        };
    }

    if (!Function.prototype.bind) {
        Function.prototype.bind = (function (slice) {
            // (C) WebReflection - Mit Style License
            function bind(context) {
                var self = this; // "trapped" function reference

                // only if there is more than an argument
                // we are interested into more complex operations
                // this will speed up common bind creation
                // avoiding useless slices over arguments
                if (1 < arguments.length) {
                    // extra arguments to send by default
                    var $arguments = slice.call(arguments, 1);
                    return function () {
                        return self.apply(
                            context,
                            // thanks @kangax for this suggestion
                            arguments.length ?
                                // concat arguments with those received
                                $arguments.concat(slice.call(arguments)) :
                                // send just arguments, no concat, no slice
                                $arguments
                        );
                    };
                }
                // optimized callback
                return function () {
                    // speed up when function is called without arguments
                    return arguments.length ? self.apply(context, arguments) : self.call(context);
                };
            }

            // the named function
            return bind;

        }(Array.prototype.slice));
    }

    // DOMElement

    DOMElement.prototype = {
        find: function(selector) {
            if (typeof selector !== "string") {
                throw new DOMMethodError("find");
            }

            var element;

            if (selector.charAt(0) === "#" && selector.indexOf(" ") === -1) {
                element = document.getElementById(selector.substr(1));
            } else {
                element = this.querySelector(selector);
            }
            
            return factory.create(element);
        },
        findAll: (function() {
            // big part of code is stoled from Sizzle:
            // https://github.com/jquery/sizzle/blob/master/sizzle.js

            // TODO: disallow to use buggy selectors

            // Easily-parseable/retrievable ID or TAG or CLASS selectors
            var rquickExpr = /^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/,
                rsibling = /[\x20\t\r\n\f]*[+~>]/,
                rsiblingQuick = /\w*([+~>])[\s]*(.+)*/,
                rescape = /'|\\/g,
                expando = "DOM" + new Date().getTime();

            return function(selector) {
                if (typeof selector !== "string") {
                    throw new DOMMethodError("findAll");
                }

                var elements, m, elem, match, quick;

                if (match = rquickExpr.exec(selector)) {
                    // Speed-up: "#ID"
                    if (m = match[1]) {
                        if (this === docElem) {
                            elem = this.getElementById(m);
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
                            if (this.ownerDocument && (elem = this.ownerDocument.getElementById(m)) &&
                                this.contains(elem) && elem.id === m) {
                                elements = [elem];
                            }
                        }
                    // Speed-up: "TAG"
                    } else if (match[2]) {
                        elements = this.getElementsByTagName(selector);
                    // Speed-up: ".CLASS"
                    } else if (m = match[3]) {
                        elements = this.getElementsByTagName(this.getElementsByClassName( m ));
                    }
                } else if ((match = rsiblingQuick.exec(selector)) && (quick = quickParse(match[2]))) {
                    elements = [];

                    switch (match[1]) {
                        case "+":
                            for (elem = this; elem; elem = elem.nextSibling) {
                                if (elem.nodeType === 1) {
                                    if (quickIs(elem, quick)) {
                                        elements.push(elem);

                                        break;
                                    }
                                }
                            }
                            break;

                        case "~":
                            for (elem = this; elem; elem = elem.nextSibling) {
                                if (elem.nodeType === 1 && quickIs(elem, quick)) {
                                    elements.push(elem);
                                }
                            }
                            break;

                        case ">":
                            for (elem = this.firstChild; elem; elem = elem.nextSibling) {
                                if (elem.nodeType === 1 && quickIs(elem, quick)) {
                                    elements.push(elem);
                                }
                            }
                            break;
                    }
                } else {
                    var old = true,
                        nid = expando,
                        newContext = this,
                        newSelector = this === docElem && selector;

                    if (this !== docElem) {
                        // qSA works strangely on Element-rooted queries
                        // We can work around this by specifying an extra ID on the root
                        // and working up from there (Thanks to Andrew Dupont for the technique)
                        if ( (old = this.getAttribute("id")) ) {
                            nid = old.replace(rescape, "\\$&");
                        } else {
                            this.setAttribute("id", nid);
                        }

                        nid = "[id='" + nid + "'] ";

                        newContext = rsibling.test(selector) && this.parentNode || this;
                        newSelector = nid + selector.replace(/","/g, "," + nid);
                    }

                    if (newSelector) {
                        try {
                            elements = newContext.querySelectorAll(newSelector);
                        } catch(qsaError) {
                        } finally {
                            if ( !old ) {
                                this.removeAttribute("id");
                            }
                        }
                    }
                }

                return factory.create(elements);
            };
        })(),
        contains: (function() {
            // http://www.quirksmode.org/blog/archives/2006/01/contains_for_mo.html
            var containsElement = function(element) {
                    return this.contains(factory.get(element.guid));
                };

            return function(element) {
                var ctr = element.constructor;

                if (ctr === DOMElement) {
                    return containsElement.call(this, element);
                } else if (ctr === DOMElements) {
                    return factory.get(element.guid).every(containsElement, this);
                } else {
                    throw new DOMMethodError("contains");
                }
            };
        })(),
        matches: (function() {
            var matches = docElem.matchesSelector ||
                docElem.mozMatchesSelector ||
                docElem.webkitMatchesSelector ||
                docElem.oMatchesSelector ||
                docElem.msMatchesSelector;

            return function(selector, quick) {
                if (!quick) {
                    quick = quickParse(selector);
                }

                return quick ? quickIs(this, quick) : matches.call(this, selector);
            };
        })(),
        on: (function() {
            var getArgValue = function(arg) {
                    return this[arg];
                },
                eventElementProperties = ["target", "currentTarget", "relatedTarget"],
                processHandlers = function(event, selector, handler, thisPtr) {
                    if (typeof handler !== "function") {
                        throw new DOMMethodError("on");
                    }

                    selector = selector ? quickParse(selector) : null;
                    thisPtr = thisPtr || this._DOM;

                    var nativeEventHandler = function(e) {
                            var originalProperties = {};

                            // modify event object
                            eventElementProperties.forEach(function(prop) {
                                var element = e[prop];

                                delete e[prop];

                                e[prop] = factory.create(element);

                                originalProperties[prop] = element;
                            });

                            handler.call(thisPtr, e);

                            // restore event object
                            eventElementProperties.forEach(function(prop) {
                                e[prop] = originalProperties[prop];
                            });
                        };
                    // TODO: store handler in _events property of the native element
                    this.addEventListener(event, !selector ? nativeEventHandler : function(e) {
                        for (var el = e.target, root = this.parentNode; el !== root; el = el.parentNode) {
                            if (quickIs(el, selector)) {
                                nativeEventHandler(e);

                                break;
                            }
                        }
                    }, false);
                };

            return function(event, selector, handler, thisPtr) {
                var filterType = typeof selector,
                    eventType = typeof event;

                if (filterType === "function") {
                    thisPtr = handler;
                    handler = selector;
                    selector = undefined;
                } else if (selector && filterType !== "string") {
                    throw new DOMMethodError("on");
                }

                if (eventType === "string") {
                    processHandlers.call(this, event, selector, handler, thisPtr);
                } else if (event && eventType === "object") {
                    Object.keys(event).forEach(function(eventType) {
                        processHandlers.call(this, eventType, undefined, event[eventType], thisPtr);
                    }, this);
                } else {
                    throw new DOMMethodError("on");
                }

                return this;
            };
        })(),
        fire: function(eventType, detail) {
            var event;
            
            if (detail !== undefined) {
                event = new CustomEvent(eventType, {detail: detail});
            } else {
                event = document.createEvent(eventType);
                event.initEvent(eventType, true, true);
            }
            
            this.dispatchEvent(event);

            return this;
        },
        get: function(name) {
            var value = this[name];
            
            if (value === undefined) {
                value = this.getAttribute(name);
            }
            
            return value;
        },
        set: (function() {
            var processAttribute = function(name, value) {
                var valueType = typeof value;

                if (valueType === "function") {
                    value = value.call(this._DOM, DOMElement.prototype.get.call(this, name));
                } else if (valueType !== "string") {
                    throw new DOMMethodError("set");
                }

                if (name in this) {
                    this[name] = value;
                } else {
                    this.setAttribute(name, value);
                }
            };

            return function(name, value) {
                var nameType = typeof name;

                if (nameType === "string") {
                    processAttribute.call(this, name, value);
                } else if (name && nameType === "object") {
                    Object.keys(name).forEach(function(attrName) {
                        processAttribute.call(this, attrName, name[attrName]);
                    }, this);
                } else {
                    throw new DOMMethodError("set");
                }

                return this;
            };
        })(),
        call: function(name) {
            var functor = this[name], result;

            if (typeof functor !== "function") {
                throw new DOMMethodError("call");
            }

            result = functor.apply(this, arguments.length > 1 ?
                Array.prototype.splice.call(arguments, 1) : undefined);

            return result === undefined ? this : result;
        },
        clone: function(deep) {
            return factory.create(this.clone(deep));
        },
        css: function() {
            return window.getComputedStyle(this);
        }
    };

    // dom manipulation
    (function() {
        // http://www.w3.org/TR/domcore/
        // 5.2.2 Mutation methods
        var populateFragment = function(element) {
                this.appendChild(factory.get(element.guid));
            },
            strategies = {
                after: function(element, parent) {
                    parent.insertBefore(element, this.nextSibling);
                },
                before: function(element, parent) {
                    parent.insertBefore(element, this);
                },
                append: function(element, parent) {
                    this.appendChild(element);
                },
                prepend: function(element, parent) {
                    this.insertBefore(element, this.firstChild);
                },
                replace: function(element, parent) {
                    parent.replaceChild(this, element);
                },
                remove: function(parent) {
                    parent.removeChild(this);
                    // cleanup cache entry
                    factory.remove(this._DOM.guid);
                }
            };

        Object.keys(strategies).forEach(function(methodName) {
            var process = strategies[methodName];

            DOMElement.prototype[methodName] = function(element) {
                var parent = this.parentNode;

                if (parent) {
                    var fragment, ctr = element.constructor;

                    if (element) {
                        if (ctr === DOMElement) {
                            fragment = factory.get(element.guid);
                        } else if (ctr === DOMElements) {
                            fragment = document.createDocumentFragment();

                            factory.get(element.guid).forEach(populateFragment, fragment);
                        }
                    } else if (process.length === 1) {
                        fragment = parent;
                    }

                    if (fragment) {
                       process.call(this, fragment, parent);
                    } else {
                        throw new DOMMethodError(methodName);
                    }
                }

                return this;
            };
        });
    })();

    // classes manipulation
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

            DOMElement.prototype[methodName] = function(className) {
                if (typeof className !== "string") {
                    throw new DOMMethodError(methodName);
                }

                var classes = className.split(" ");

                if (methodName === "hasClass") {
                    return classes.any(process, this);
                } else {
                    classes.forEach(process, this);

                    return this;
                }
            };
        });

    })();

    // add guid support to prototype methods
    Object.keys(DOMElement.prototype).forEach(function(methodName) {
        var method = DOMElement.prototype[methodName];

        DOMElement.prototype[methodName] = function() {
            var element = factory.get(this.guid),
                getter = function() {
                    var result = method.apply(element, arguments);

                    return result === element ? this : result;
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

    // extend DOMElements.prototype with only specific methods
    ["set", "on", "show", "hide", "addClass", "removeClass", "toggleClass"].forEach(function(methodName) {
        var process = function(elem) {
                // 'this' will be an arguments object
                elem[methodName].apply(elem, this);
            };

        DOMElements.prototype[methodName] = function() {
            this.forEach(process, arguments);

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
            value: function(tagName, attrs) {
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