/*!
 * DOM.js (https://github.com/chemerisuk/DOM.js)
 * Modern javascript library for working with DOM
 *
 * Copyright (c) 2013 Maksim Chemerisuk
 */
(function(window, document, undefined, slice, map) {
    "use strict";

    var DOM,
        DOMElementStrategies,
        htmlEl = document.documentElement,
        headEl = document.head,
        // classes 
        DOMElement = function(node) {
            if (node.__DOM__) {
                return node.__DOM__;
            }

            return node.__DOM__ = Object.create(this || DOMElement.prototype, {
                _do: {
                    value: !node ? function() {} : function(methodName, args) {
                        var functor = DOMElementStrategies[methodName];

                        if (!this.hasOwnProperty(methodName)) {
                            // improve performance by creating a local method (-1 function call next time)
                            Object.defineProperty(this, methodName, {
                                value: function() {
                                    return functor.apply(this, [node].concat(slice.call(arguments, 0)));
                                }
                            });
                        }

                        return functor.apply(this, [node].concat(args));
                    }
                },
                // private data objects
                _data: { value: {} },
                _events: { value: [] }
            });
        },
        DOMElementCollection = (function() {
            // Create clean copy of Array prototype. Inspired by
            // http://dean.edwards.name/weblog/2006/11/hooray/
            var ref = document.scripts[0],
                iframe = document.createElement("iframe"),
                ctr, proto;
                
            iframe.src = "about:blank";
            iframe.style.display = "none";
                
            ref.parentNode.insertBefore(iframe, ref);
            // store reference to clean Array
            ctr = iframe.contentWindow.Array;
            // cleanup DOM
            ref.parentNode.removeChild(iframe);

            proto = ctr.prototype;
            // cleanup collection prototype
            Object.getOwnPropertyNames(proto).forEach(function(methodName) {
                ~"forEach map every some filter length".indexOf(methodName) || delete proto[methodName];
            });
            // shortcuts
            "set on off capture addClass removeClass toggleClass".split(" ").forEach(function(methodName) {
                var process = function(obj) { obj._do(methodName, this); };

                proto[methodName] = function() {
                    if (this.length > 0) {
                        this.forEach(process, slice.call(arguments, 0));
                    }

                    return this;
                };
            });

            // temporary store operator for internal use only
            ctr._new = proto.map;
            // use Array.prototype implementation to return regular array for map
            proto.map = map;
            
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
                        throw makeArgumentsError();
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
        makeArgumentsError = function() {
            var methodName = new Error().stack.split("\n")[2].replace(/^\s+at\s+|\s+.+$/g,"").split(".")[1];
            // http://domjs.net/doc/{objectName}/{methodName}[#{hashName}]
            return "Error: '" + methodName + "' method called with illegal arguments";
        };

    // DOMElement
    DOMElementStrategies = {
        matches: function(el, selector) {
            return new SelectorMatcher(selector).test(el);
        },
        find: function(el, selector) {
            if (typeof selector !== "string") {
                throw makeArgumentsError();
            }

            var node;

            if (selector.charAt(0) === "#" && selector.indexOf(" ") === -1) {
                node = document.getElementById(selector.substr(1));
            } else {
                node = el.querySelector(selector);
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
                expando = "DOM" + new Date().getTime();

            return function(el, selector) {
                if (typeof selector !== "string") {
                    throw makeArgumentsError();
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
                    // Speed-up "+ selector", "> selector", "~ selector"
                    matcher = new SelectorMatcher(match[2], true);
                    elements = [];

                    for (elem = el[match[1] === ">" ? "firstElementChild" : "nextElementSibling"]; elem; elem = elem.nextElementSibling) {
                        if (matcher.test(elem)) {
                            elements.push(elem);
                        }

                        if (match[1] === "+") break;
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

                return DOM.create(elements || []);
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

            return function(node, element, /*INTERNAL*/reverse) {
                if (element instanceof Element) {
                    return containsElement(reverse ? element : node, reverse ? node : element);
                } else if (element instanceof DOMElement) {
                    return element.contains(node, true);
                } else if (element instanceof DOMElementCollection) {
                    return element.every(function(element) {
                        return element.contains(node, true);
                    });
                } else {
                    throw makeArgumentsError();
                }
            };
        })(),
        capture: (function() {
            var nodeProperties = ["target", "currentTarget", "relatedTarget", "srcElement", "toElement", "fromElement"];
                
            return function(el, event, callback, thisPtr, /*INTERNAL*/bubbling) {
                if (typeof callback !== "function") {
                    throw makeArgumentsError();
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
        on: function(el, event, handler, thisPtr) {
            var eventType = typeof event;

            thisPtr = thisPtr || this;

            if (eventType === "string") {
                this._do("capture", [event, handler, thisPtr, true]);
            } else if (eventType === "object") {
                Object.keys(event).forEach(function(key) {
                    this._do("capture", [key, event[key], thisPtr, true]);
                }, this);
            } else if (Array.isArray(event)) {
                event.forEach(function(key) {
                    this._do("capture", [key, handler, thisPtr, true]);
                }, this);
            } else {
                throw makeArgumentsError();
            }

            return this;
        },
        off: function(node, event, callback) {
            if (typeof event !== "string" || callback !== undefined && typeof callback !== "function") {
                throw new makeArgumentsError();
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
        fire: function(el, eventType, detail) {
            if (typeof eventType !== "string") {
                throw new makeArgumentsError();
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
        get: function(el, name) {
            if (typeof name !== "string" || ~name.indexOf("Node") || ~name.indexOf("Element")) {
                throw makeArgumentsError();
            }

            return el[name] || el.getAttribute(name);
        },
        set: function(el, name, value) {
            var nameType = typeof name,
                valueType = typeof value;

            if (valueType === "function") {
                value = value.call(this, this._get(el, name));
                valueType = typeof value;
            }

            if (nameType === "string") {
                if (value !== null && valueType !== "string") {
                    throw makeArgumentsError();
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
                    this._do("set", [name, value]);
                }, this);
            } else if (nameType === "object") {
                Object.keys(name).forEach(function(key) {
                    this._do("set", [key, name[key]]);
                }, this);
            } else {
                throw makeArgumentsError();
            }

            return this;
        },
        clone: function(el, deep) {
            return new DOMElement(el.cloneNode(deep));
        },
        css: function(el, property, value) {
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
                    this._do("css", [key, property[key]]);
                }, this);
            } else {
                throw makeArgumentsError();
            }

            return this;
        },
        html: (function() {
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
                    throw makeArgumentsError();
                }
                // fix NoScope elements in IE
                el.innerHTML = "&shy;" + value;
                el.removeChild(el.firstChild);
                // fix script elements
                slice.call(el.getElementsByTagName("script"), 0).forEach(processScripts);

                return this;
            };
        })(),
        offset: function(el) {
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
        call: function(el, name) {
            if (arguments.length === 1) {
                return el[name]();
            } else {
                return el[name].apply(el, slice.call(arguments, 1));
            }
        },
        data: function(node, name, value) {
            if (typeof name !== "string") {
                throw makeArgumentsError();
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
        var traversingStrategies = {
                firstChild: "firstElementChild",
                lastChild: "lastElementChild",
                next: "nextElementSibling",
                prev: "previousElementSibling",
                parent: "parentNode"
            };

        Object.keys(traversingStrategies).forEach(function(methodName) {
            var propertyName = traversingStrategies[methodName];

            DOMElementStrategies[methodName] = function(node, selector) {
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
        var manipulationStrategies = {
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

        Object.keys(manipulationStrategies).forEach(function(methodName) {
            var process = manipulationStrategies[methodName];

            DOMElementStrategies[methodName] = function(node, element, /*INTERNAL*/reverse) {
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
                    throw makeArgumentsError();
                }

                return this;
            };
        });
    })();

    // css classes manipulation
    (function() {
        var rclass = /[\n\t\r]/g,
            classStrategies = htmlEl.classList ? {
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

        Object.keys(classStrategies).forEach(function(methodName) {
            var process = classStrategies[methodName];

            DOMElementStrategies[methodName] = function(el, classNames) {
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
                    throw makeArgumentsError();
                }
            };
        });

    })();

    Object.keys(DOMElementStrategies).forEach(function(key) {
        DOMElement.prototype[key] = function() {
            return this._do(key, slice.call(arguments, 0));
        };
    });

    // types finalization
    [DOMElement, DOMElementCollection].forEach(function(ctr) {
        var proto = ctr.prototype;
        // fix constructor
        proto.constructor = ctr;
        // make all methods to be readonly and not enumerable
        Object.keys(proto).forEach(function(key) {
            Object.defineProperty(proto, key, {
                value: proto[key],
                writable: false,
                enumerable: false
            });
        });
    });

    // initialize constants
    DOM = Object.create(new DOMElement(htmlEl), {
        create: {
            value: (function() {
                var newCollection = DOMElementCollection._new;
                // cleanup temporary stored var
                delete DOMElementCollection._new; 

                return function(content) {
                    var elem;

                    if (typeof content === "string") {
                        if (content.indexOf(">") !== content.length - 1) {
                            elem = document.createElement("div");
                            elem.innerHTML = content;

                            if (elem.children.length === 1) {
                                elem = elem.firstChild;
                            }
                        } else {
                            elem = document.createElement(content.substr(1, content.length - 2));
                        }
                    } else if (content instanceof Element) {
                        elem = content;
                    } else if (Array.isArray(content) || content instanceof NodeList) {
                        return newCollection.call(content, DOMElement);
                    }

                    if (!elem) {
                        throw makeArgumentsError();
                    }

                    return DOMElement(elem);
                };
            })()
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
                        throw makeArgumentsError();
                    }

                    if (readyCallbacks) {
                        readyCallbacks.push(callback);
                    } else {
                        callback();
                    }
                };
            })()
        },
        importStyles: {
            value: (function() {
                var styleEl = headEl.insertBefore(document.createElement("style"), headEl.firstChild),
                    computed = window.getComputedStyle(htmlEl, ""),
                    pre = (slice.call(computed).join("").match(/moz|webkit|ms/)||(computed.OLink===""&&["o"]))[0],
                    process = function(selector, styles) {
                        var ruleText = selector + " {";

                        if (typeof styles === "object") {
                            Object.keys(styles).forEach(function(styleName) {
                                var prefixed = (pre + styleName.charAt(0).toUpperCase() + styleName.substr(1) in computed);
                                // append vendor prefix if it's required
                                ruleText += (prefixed ? "-" + pre + "-" : "") + styleName + ": " + styles[styleName] + ";";
                            });
                        } else if (typeof styles === "string") {
                            ruleText += styles;
                        } else {
                            throw makeArgumentsError();
                        }

                        styleEl.appendChild(document.createTextNode(ruleText + "}"));
                    };
                            
                return function(selector, styles) {
                    var selectorType = typeof selector;

                    if (selectorType === "string") {
                        process(selector, styles);
                    } else if (selectorType === "object") {
                        slice.call(arguments, 0).forEach(function(rule) {
                            var selector = Object.keys(rule)[0];

                            process(selector, rule[selector]);
                        });
                    } else {
                        throw makeArgumentsError();
                    }
                };
            })()
        },
        watch: {
            value: (function() {
                var listeners = {};

                if (htmlEl.addBehavior) {
                    return (function() {
                        var scripts = document.scripts,
                            behavior = scripts[scripts.length - 1].getAttribute("src"),
                            watch = function(selector, callback) {
                                var entry = listeners[selector];
                                
                                if (entry) {
                                    entry.push(callback);
                                } else {
                                    listeners[selector] = [callback];
                                    // append style rule at the last step
                                    DOM.importStyles(selector, {"behavior": behavior});
                                }
                            };
                        
                        behavior = "url(" + behavior.substr(0, behavior.lastIndexOf(".")) + ".htc)";
                        // IE-SPECIFIC: this function will be called inside of htc file
                        watch._init = function(el) {
                            Object.keys(listeners).forEach(function(selector) {
                                var entry = listeners[selector];
                                
                                if (el.msMatchesSelector(selector)) {
                                    entry.forEach(function(callback) {
                                        callback.call(DOMElement(el));
                                    });
                                }
                            });
                        };
                        
                        return watch;
                    })();
                } else {
                    return (function() {
                        // use trick discovered by Daniel Buchner: 
                        // https://github.com/csuwldcat/SelectorListener
                        var startNames = ["animationstart", "oAnimationStart", "MSAnimationStart", "webkitAnimationStart"],
                            computed = window.getComputedStyle(htmlEl, ""),
                            pre = (slice.call(computed).join("").match(/moz|webkit|ms/)||(computed.OLink===""&&["o"]))[0],
                            keyframes = !!(window.CSSKeyframesRule || window[("WebKit|Moz|MS|O").match(new RegExp("(" + pre + ")", "i"))[1] + "CSSKeyframesRule"]);

                        return function(selector, fn) {
                            var animationName = "DOM-" + new Date().getTime();

                            DOM.importStyles(
                                "@" + (keyframes ? "-" + pre + "-" : "") + "keyframes " + animationName,
                                "from { clip: rect(1px, auto, auto, auto) } to { clip: rect(0px, auto, auto, auto) }"
                            );

                            DOM.importStyles(selector, {
                                "animation-duration": "0.001s",
                                "animation-name": animationName + " !important"
                            });

                            startNames.forEach(function(name){
                                document.addEventListener(name, function(e) {
                                    var el = e.target;

                                    if (e.animationName === animationName) {
                                        fn.call(DOMElement(el));
                                        // prevent double initialization
                                        el.addEventListener(name, function(e) {
                                            if (e.animationName === animationName) {
                                                e.stopPropagation();
                                            }
                                        }, false);
                                    }
                                }, false);
                            });
                        };
                    })();
                }
            })()
        }
    });

    // register API
    window.DOM = DOM;

})(window, document, undefined, Array.prototype.slice, Array.prototype.map);