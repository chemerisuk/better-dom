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
        scripts = document.scripts,
        // helpers
        extend = function(proto, name, value) {
            if (arguments.length === 3) {
                Object.defineProperty(proto, name, {
                    value: value,
                    enumerable: true
                });
            } else {
                Object.keys(name).forEach(function(key) {
                    extend(proto, key, name[key]);
                });
            }

            return proto;
        },
        makeArgumentsError = function(methodName, type) {
            // http://domjs.net/doc/{objectName}/{methodName}[#{hashName}]
            return "Error: '" + (type ? type + "." : "") + methodName + "' method called with illegal arguments";
        },
        makeDOMEventsArgumentsError = function(methodName) {
            return makeArgumentsError(methodName, "DOMEvent");
        },
        // types
        DOMNode = function(node) {
            if (!(this instanceof DOMNode)) {
                return node ? node.__dom__ || new DOMNode(node) : new DOMNullNode();
            }

            if (node) {
                node.__dom__ = Object.defineProperties(this, {
                    _node: { value: node },
                    // private data objects
                    _data: { value: {} },
                    _events: { value: [] }
                }); 
            }
        },
        DOMElement = function(el) {
            if (!(this instanceof DOMElement)) {
                return el ? el.__dom__ || new DOMElement(el) : new DOMNullElement();
            }

            DOMNode.call(this, el);
        },
        DOMNullNode = function() { },
        DOMNullElement = function() { },
        DOMElementCollection = (function() {
            // Create clean copy of Array prototype. Inspired by
            // http://dean.edwards.name/weblog/2006/11/hooray/
            var ref = scripts[0],
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
            "set on off capture fire data addClass removeClass toggleClass".split(" ").forEach(function(methodName) {
                var process = function(el) {
                    el[methodName].apply(el, this);
                };

                extend(proto, methodName, function() {
                    if (this.length > 0) {
                        this.forEach(process, slice.call(arguments));
                    }

                    return this;
                });
            });

            // temporary store operator for internal use only
            ctr._new = proto.map;
            // use Array.prototype implementation to return regular array for map
            proto.map = Array.prototype.map;
            
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
                        throw makeArgumentsError("quick");
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
        DOMEvent = function(event) {
            if (!(this instanceof DOMEvent)) {
                return event.__dom__ || ( event.__dom__ = new DOMEvent(event) );
            }

            this._event = event;
        };

    DOMNode.prototype = extend({}, {
        find: function(selector) {
            if (typeof selector !== "string") {
                throw makeArgumentsError("find");
            }

            var result;

            if (selector.charAt(0) === "#" && !~selector.indexOf(" ")) {
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
                    throw makeArgumentsError("findAll");
                }

                var node = this._node, elements, m, elem, match, matcher;

                if (match = rquickExpr.exec(selector)) {
                    // Speed-up: "#ID"
                    if (m = match[1]) {
                        elem = document.getElementById(m);
                        // Handle the case where IE, Opera, and Webkit return items
                        // by name instead of ID
                        if ( elem && elem.parentNode && elem.id === m && (node === document || this.contains(elem)) ) {
                            elements = [elem];
                        }
                    // Speed-up: "TAG"
                    } else if (match[2]) {
                        elements = slice.call(node.getElementsByTagName(selector));
                    // Speed-up: ".CLASS"
                    } else if (m = match[3]) {
                        elements = slice.call(node.getElementsByClassName(m));
                    }
                } else if (match = rsiblingQuick.exec(selector)) {
                    // Speed-up "+ selector", "> selector", "~ selector"
                    matcher = new SelectorMatcher(match[2], true);
                    elements = [];

                    for (elem = node[match[1] === ">" ? "firstElementChild" : "nextElementSibling"]; elem; elem = elem.nextElementSibling) {
                        if (matcher.test(elem)) {
                            elements.push(elem);
                        }

                        if (match[1] === "+") break;
                    }
                } else {
                    var old = true,
                        nid = expando,
                        newContext = node,
                        newSelector = node === document && selector;

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

            return function(element, /*INTERNAL*/reverse) {
                var node = this._node;

                if (element instanceof Element) {
                    return containsElement(reverse ? element : node, reverse ? node : element);
                } else if (element instanceof DOMElement) {
                    return element.contains(node, true);
                } else if (element instanceof DOMElementCollection) {
                    return element.every(function(element) {
                        return element.contains(node, true);
                    });
                } else {
                    throw makeArgumentsError("contains");
                }
            };
        })(),
        capture: function(event, callback, thisPtr, /*INTERNAL*/bubbling) {
            if (typeof callback !== "function") {
                throw makeArgumentsError("capture");
            }

            var selectorStart = event.indexOf(" "),
                eventType = ~selectorStart ? event.substr(0, selectorStart) : event,
                selector = ~selectorStart ? event.substr(selectorStart + 1) : null,
                matcher = selector ? new SelectorMatcher(selector) : null,
                handleEvent = function(e) {
                    callback.call(thisPtr, DOMEvent(e));
                },
                eventEntry = {
                    capturing: !bubbling,
                    event: event,
                    callback: callback, 
                    handler: !selector ? handleEvent : function(e) {
                        for (var elem = e.target, root = e.currentTarget.parentNode; elem !== root; elem = elem.parentNode) {
                            if (matcher.test(elem)) {
                                return handleEvent(e);
                            }
                        }
                    }
                };
            // attach event listener
            this._node.addEventListener(eventType, eventEntry.handler, !bubbling);
            // store event entry
            this._events.push(eventEntry);

            return this;
        },
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
                throw makeArgumentsError("on");
            }

            return this;
        },
        off: function(event, callback) {
            if (typeof event !== "string" || callback !== undefined && typeof callback !== "function") {
                throw new makeArgumentsError("off");
            }

            var eventType = event.split(" ")[0];

            this._events.forEach(function(entry) {
                if (event === entry.event && (!callback || callback === entry.callback)) {
                    // remove event listener from the element
                    this._node.removeEventListener(eventType, entry.handler, entry.capturing);
                }
            }, this);

            return this;
        },
        fire: function(eventType, detail) {
            if (typeof eventType !== "string") {
                throw new makeArgumentsError("fire");
            }

            var event; 
            
            if (~eventType.indexOf(":")) {
                event = new CustomEvent(eventType, {detail: detail, bubbles: true});
            } else {
                event = document.createEvent(eventType);
                event.initEvent(eventType, true, true);
            }
            
            this._node.dispatchEvent(event);

            return this;
        },
        call: function(name) {
            if (arguments.length === 1) {
                return this._node[name]();
            } else {
                return this._node[name].apply(this._node, slice.call(arguments, 1));
            }
        },
        data: function(name, value) {
            if (typeof name !== "string") {
                throw makeArgumentsError("data");
            }

            var node = this._node, 
                result = this;

            if (value === undefined) {
                result = this._data[name];

                if (result === undefined && node.hasAttribute("data-" + name)) {
                    result = this._data[name] = node.getAttribute("data-" + name);
                }
            } else {
                this._data[name] = value;
            }

            return result;
        }
    });

    DOMElement.prototype = extend(new DOMNode(), {
        matches: function(selector) {
            return new SelectorMatcher(selector).test(this._node);
        },
        get: function(name) {
            if (typeof name !== "string" || ~name.indexOf("Node") || ~name.indexOf("Element")) {
                throw makeArgumentsError("get");
            }

            var el = this._node;

            return el[name] || el.getAttribute(name);
        },
        set: function(name, value) {
            var el = this._node,
                nameType = typeof name,
                valueType = typeof value;

            if (valueType === "function") {
                valueType = typeof ( value = value.call(this, this.get(name)) );
            }

            if (nameType === "string") {
                if (valueType === "function") {
                    throw makeArgumentsError("set");
                }

                if (value === null || value === false) {
                    el.removeAttribute(name);
                } else if (name in el) {
                    el[name] = value;
                } else {
                    el.setAttribute(name, value);
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
                throw makeArgumentsError("set");
            }

            return this;
        },
        clone: function(deep) {
            return new DOMElement(this._node.cloneNode(deep));
        },
        css: function(property, value) {
            var el = this._node,
                propType = typeof property;

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
                    this.css(key, property[key]);
                }, this);
            } else {
                throw makeArgumentsError("css");
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

            return function(value) {
                var el = this._node;

                if (value === undefined) {
                    return el.innerHTML;
                }

                if (typeof value !== "string") {
                    throw makeArgumentsError("html");
                }
                // fix NoScope elements in IE
                el.innerHTML = "&shy;" + value;
                el.removeChild(el.firstChild);
                // fix script elements
                slice.call(el.getElementsByTagName("script"), 0).forEach(processScripts);

                return this;
            };
        })(),
        offset: function() {
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
        },
        show: function() {
            this._node.removeAttribute("hidden");
            this._node.hidden = false;

            return this;
        },
        hide: function() {
            this._node.setAttribute("hidden", "");
            this._node.hidden = true;

            return this;
        }
    });

    // dom traversing strategies
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

            extend(DOMElement.prototype, methodName, function(selector) {
                var el = this._node,
                    matcher = selector ? new SelectorMatcher(selector) : null;

                while ( (el = el[propertyName]) && matcher && !matcher.test(el) );

                return DOMElement(el);
            });
        });
    })();

    // dom manipulation strategies
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

            extend(DOMElement.prototype, methodName, function(element, /*INTERNAL*/reverse) {
                var el = this._node,
                    parent = el.parentNode, 
                    relatedNode;

                if (element) {
                    relatedNode = document.createElement("div");
                    relatedNode.innerHTML = element;
                    relatedNode = relatedNode.firstElementChild;
                } else {
                    // indicate case with remove() function
                    relatedNode = parent;
                }

                if (relatedNode) {
                   process(el, relatedNode, parent);
                } else {
                    throw makeArgumentsError(methodName);
                }

                return this;
            });
        });
    })();

    // css classes manipulation strategies
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

            extend(DOMElement.prototype, methodName, function(classNames) {
                var el = this._node;

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
                    throw makeArgumentsError(methodName);
                }
            });
        });
    })();

    DOMEvent.prototype = extend({}, {
        get: function(name) {
            if (typeof name !== "string" || ~name.indexOf("arget") || ~name.indexOf("lement")) {
                throw makeDOMEventsArgumentsError("get");
            }

            return this._event[name];
        }
    });
    // methods
    "preventDefault stopPropagation stopImmediatePropagation".split(" ").forEach(function(key) {
        extend(DOMEvent.prototype, key, function() {
            this._event[key]();
        });
    });
    // getters
    "target currentTarget relatedTarget".split(" ").forEach(function(key) {
        Object.defineProperty(DOMEvent.prototype, key, {
            enumerable: true,
            get: function() {
                return DOMElement(this._event[key]);
            }
        });
    });

    // null object types
    DOMNullNode.prototype = new DOMNode();
    DOMNullElement.prototype = new DOMElement();

    Object.keys(DOMNode.prototype).forEach(function(key) {
        extend(DOMNullNode.prototype, key, function() {});
        extend(DOMNullElement.prototype, key, function() {});
    });

    Object.keys(DOMElement.prototype).forEach(function(key) {
        extend(DOMNullElement.prototype, key, function() {});
    });

    // fix constructor property
    [DOMNode, DOMElement, DOMEvent, DOMNullNode, DOMNullElement].forEach(function(ctr) {
        Object.defineProperty(ctr.prototype, "constructor", { value: ctr });
    });

    // publi API
    DOM = window.DOM = extend(new DOMNode(document), {
        create: (function() {
            var newCollection = DOMElementCollection._new;
            // cleanup temporary var
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
                } else if ("length" in content) {
                    return newCollection.call(content, DOMElement);
                }

                if (!elem) {
                    throw makeArgumentsError("create");
                }

                return DOMElement(elem);
            };
        })(),
        ready: (function() {
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
                    throw makeArgumentsError("ready");
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
                computed = window.getComputedStyle(htmlEl, ""),
                pre = (slice.call(computed).join("").match(/moz|webkit|ms/)||(computed.OLink===""&&["o"]))[0],
                process = function(selector, styles) {
                    var ruleText = selector + " { ";

                    if (typeof styles === "object") {
                        Object.keys(styles).forEach(function(styleName) {
                            var prefixed = (pre + styleName.charAt(0).toUpperCase() + styleName.substr(1) in computed);
                            // append vendor prefix if it's required
                            ruleText += (prefixed ? "-" + pre + "-" : "") + styleName + ":" + styles[styleName] + "; ";
                        });
                    } else if (typeof styles === "string") {
                        ruleText += styles;
                    } else {
                        throw makeArgumentsError("importStyles");
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
                    slice.call(arguments, 0).forEach(function(rule) {
                        var selector = Object.keys(rule)[0];

                        process(selector, rule[selector]);
                    });
                } else {
                    throw makeArgumentsError("importStyles");
                }
            };
        })(),
        watch: htmlEl.addBehavior ? (function() {
            var behavior = scripts[scripts.length - 1].getAttribute("src"),
                watch = function(selector, callback) {
                    var entry = watch._listeners[selector];

                    if (entry) {
                        entry.push(callback);
                    } else {
                        watch._listeners[selector] = [callback];
                        // append style rule at the last step
                        DOM.importStyles(selector, { behavior: behavior });
                    }
                };

            behavior = "url(" + behavior.substr(0, behavior.lastIndexOf(".")) + ".htc)";

            watch._listeners = {};
            
            return watch;
        })() : (function() {
            // use trick discovered by Daniel Buchner: 
            // https://github.com/csuwldcat/SelectorListener
            var startNames = ["animationstart", "oAnimationStart", "MSAnimationStart", "webkitAnimationStart"],
                computed = window.getComputedStyle(htmlEl, ""),
                pre = (slice.call(computed).join("").match(/moz|webkit|ms/)||(computed.OLink===""&&["o"]))[0],
                keyframes = !!(window.CSSKeyframesRule || window[("WebKit|Moz|MS|O").match(new RegExp("(" + pre + ")", "i"))[1] + "CSSKeyframesRule"]);

            return function(selector, callback) {
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
                            callback.call(DOMElement(el));
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
        })(),
        extend: function(selector, mixins) {
            if (!mixins || typeof mixins !== "object") {
                throw makeArgumentsError("extend");
            }

            var props = {};

            Object.keys(mixins).forEach(function(key) {
                if (key !== "constructor") {
                    props[key] = { 
                        value: mixins[key],
                        enumerable: true
                    };
                }
            });

            DOM.watch(selector, function() {
                Object.defineProperties(this, props);

                if (mixins.hasOwnProperty("constructor")) {
                    mixins.constructor.call(this);
                }
            });
        }
    });

})(window, document, undefined, Array.prototype.slice);