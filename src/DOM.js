/*!
 * DOM.js (https://github.com/chemerisuk/DOM.js)
 * Modern javascript library for working with DOM
 *
 * Copyright (c) 2013 Maksim Chemerisuk
 */
(function(window, document, slice, filter, undefined) {
    "use strict";

    var DOM,
        htmlEl = document.documentElement,
        headEl = document.head,
        scripts = document.scripts,
        vendorPrefix = (function() {
            var computed = window.getComputedStyle(htmlEl, "");

            return (slice.call(computed).join("").match(/moz|webkit|ms/)||(computed.OLink===""&&["o"]))[0];
        })(),
        // helpers
        sandbox = (function() {
            var el = document.createElement("body"),
                appendTo = function(el) { 
                    this.appendChild(el); 
                };

            return {
                parse: function(html) {
                    el.innerHTML = "shy;" + html;
                    el.removeChild(el.firstChild);

                    return el.children;
                },
                fragment: function(html) {
                    var fragment = document.createDocumentFragment();

                    Array.prototype.forEach.call(this.parse(html), appendTo, fragment);

                    return fragment;
                }
            };
        })(),
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
        DOMNullNode = function() { this._node = null; },
        DOMNullElement = function() { this._node = null; },
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
                ~"forEach map every some filter length reduce reduceRight".indexOf(methodName) || delete proto[methodName];
            });

            // shortcuts
            "set on off fire data addClass removeClass toggleClass".split(" ").forEach(function(methodName) {
                var process = function(el) {
                    el[methodName].apply(el, this);
                };

                extend(proto, methodName, function() {
                    if (this.length) {
                        this.forEach(process, slice.call(arguments));
                    }

                    return this;
                });
            });

            // static method to create a collection
            ctr.create = (function(){
                var _map = proto.map;

                return function(collection) {
                    return _map.call(collection || [], DOMElement);
                };
            })();

            // use Array.prototype implementation to return regular array for map
            proto.map = Array.prototype.map;
            proto.each = proto.forEach;
            
            return ctr;
        })(),
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
                        throw makeArgumentsError("quick");
                    }
                },
                matchesProp = htmlEl.matchesSelector ? "matchesSelector" : vendorPrefix + "MatchesSelector";

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
        })(),
        DOMEvent = function(event) {
            if (!(this instanceof DOMEvent)) {
                return event.__dom__ || ( event.__dom__ = new DOMEvent(event) );
            }

            this._event = event;
        };

    DOMNode.prototype = extend({}, {
        find: (function() {
            // big part of code inspired by Sizzle:
            // https://github.com/jquery/sizzle/blob/master/sizzle.js

            // TODO: disallow to use buggy selectors?
            var rquickExpr = /^(?:#([\w\-]+)|(\w+)|\.([\w\-]+))$/,
                rsibling = /[\x20\t\r\n\f]*[+~>]/,
                rescape = /'|\\/g,
                tmpId = "DOM" + new Date().getTime();

            return function(selector, /*INTERNAL*/multiple) {
                if (typeof selector !== "string") {
                    throw makeArgumentsError("find");
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
        })(),
        findAll: function(selector) {
            return this.find(selector, true);
        },
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
                } else if (Array.isArray(element)) {
                    return element.every(function(element) {
                        if (element instanceof DOMElement) {
                            return element.contains(node, true);
                        }
                        
                        throw makeArgumentsError("contains");
                    });
                } else {
                    throw makeArgumentsError("contains");
                }
            };
        })(),
        on: (function() {
            var createEventHandler = function(thisPtr, callback, selector) {
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
            };

            return function(event, selector, callback, capturing) {
                var eventType = typeof event,
                    eventHandler;

                if (eventType === "string") {
                    if (typeof selector === "function") {
                        capturing = callback;
                        callback = selector;
                        selector = null;
                    }

                    capturing = !!capturing;
                    eventHandler = createEventHandler(this, callback, selector);

                    event.split(" ").forEach(function(event) {
                        // fix IE9 focus/blur handlers
                        if (this._node.attachEvent) {
                            if (event === "focus") {
                                event = "focusin";
                            } else if (event === "blur") {
                                event = "focusout";
                            }
                        }
                        // attach event listener
                        this._node.addEventListener(event, eventHandler, capturing);
                        // store event entry
                        this._events.push({
                            capturing: capturing,
                            event: event,
                            callback: callback, 
                            handler: eventHandler
                        });
                    }, this);
                } else if (eventType === "object") {
                    Object.keys(event).forEach(function(key) {
                        this.on(key, event[key]);
                    }, this);
                } else {
                    throw makeArgumentsError("on");
                }

                return this;
            };
        })(),
        off: function(event, callback) {
            if (typeof event !== "string" || callback !== undefined && typeof callback !== "function") {
                throw new makeArgumentsError("off");
            }

            this._events.forEach(function(entry) {
                if (event === entry.event && (!callback || callback === entry.callback)) {
                    // remove event listener from the element
                    this._node.removeEventListener(event, entry.handler, entry.capturing);
                }
            }, this);

            return this;
        },
        fire: function(eventType, detail) {
            if (typeof eventType !== "string") {
                throw new makeArgumentsError("fire");
            }

            var isCustomEvent = ~eventType.indexOf(":"),
                event = document.createEvent(isCustomEvent ? "CustomEvent" : "Event");

            if (isCustomEvent) {
                event.initCustomEvent(eventType, true, false, detail);
            } else {
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
            if (typeof selector !== "string") {
                throw makeArgumentsError("matches");
            }

            return new SelectorMatcher(selector).test(this._node);
        },
        clone: function() {
            return new DOMElement(this._node.cloneNode(true));
        },
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
            return this.set("hidden", false);
        },
        hide: function() {
            return this.set("hidden", true);
        },
        toString: function() {
            var el = this._node, result;

            if (el.elements) {
                result = Array.prototype.reduce.call(el.elements, function(parts, field) {
                    if (field.name) { // don't include form fields without names
                        switch(field.type) {
                            case "select-one":
                            case "select-multiple":
                                Array.prototype.forEach.call(field.options, function(option) {
                                    if (option.selected) {
                                        parts.push(encodeURIComponent(field.name) + "=" + encodeURIComponent(
                                                option.hasAttribute("value") ? option.value : option.text));
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
                                parts.push(encodeURIComponent(field.name) + "=" +encodeURIComponent(field.value));
                        }
                    }
                }, []);

                result = result.join("&").replace(/%20/g, "+");
            } else if (el.form) {
                result = el.value;
            } else {
                result = el.outerHTML;
            }

            return result;
        }
    });

    // getter/setter
    (function() {
        var propHooks = {},
            throwIllegalAccess = function(el) { 
                throw makeArgumentsError("get"); 
            };
        // protect access to some properties
        "children childNodes elements parentNode firstElementChild lastElementChild nextElementSibling previousElementSibling".split(" ").forEach(function(key) {
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

        extend(DOMElement.prototype, {
            get: function(name) {
                if (typeof name !== "string") {
                    throw makeArgumentsError("get");
                }

                var el = this._node,
                    hook = propHooks[name];

                hook && (hook = hook.get);

                return hook ? hook(el) : el[name] || el.getAttribute(name);
            },
            set: function(name, value) {
                var el = this._node,
                    nameType = typeof name,
                    valueType = typeof value;

                if (nameType === "string") {
                    if (valueType === "function") {
                        value = value.call(this, this.get(name));
                    }

                    name.split(" ").forEach(function(name) {
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
                    Object.keys(name).forEach(function(key) {
                        this.set(key, name[key]);
                    }, this);
                } else {
                    throw makeArgumentsError("set");
                }

                return this;
            }
        });
    })();

    // dom traversing strategies
    (function() {
        var traversingProps = {
                nextAll: "nextElementSibling",
                prevAll: "previousElementSibling",
                children: "children",
                firstChild: "firstElementChild",
                lastChild: "lastElementChild",
                next: "nextElementSibling",
                prev: "previousElementSibling",
                parent: "parentNode"
            };

        Object.keys(traversingProps).forEach(function(methodName) {
            var propertyName = traversingProps[methodName];

            if (methodName === "children") {
                extend(DOMElement.prototype, methodName, function(selector) {
                    var children = this._node.children,
                        matcher = selector ? new SelectorMatcher(selector) : null;

                    return DOMElementCollection.create(!matcher ? children : 
                        filter.call(children, matcher.test, matcher));
                });                
            } else {
                extend(DOMElement.prototype, methodName, function(selector) {
                    var matcher = selector ? new SelectorMatcher(selector) : null,
                        nodes = ~methodName.lastIndexOf("All") ? [] : null,
                        it = this._node;

                    while (it = it[propertyName]) {
                        if (!matcher || matcher.test(it)) {
                            if (!nodes) {
                                return DOMElement(it);
                            }

                            nodes.push(it);
                        }
                    }

                    return !nodes ? new DOMNullElement() : DOMElementCollection.create(nodes);
                });
            }
        });
    })();

    // dom manipulation strategies
    (function() {
        // http://www.w3.org/TR/domcore/
        // 5.2.2 Mutation methods
        var manipulationStrategies = {
            after: function(node, relatedNode) {
                node.parentNode.insertBefore(relatedNode, node.nextSibling);
            },
            before: function(node, relatedNode) {
                node.parentNode.insertBefore(relatedNode, node);
            },
            append: function(node, relatedNode) {
                node.appendChild(relatedNode);
            },
            prepend: function(node, relatedNode) {
                node.insertBefore(relatedNode, node.firstChild);
            },
            replace: function(node, relatedNode) {
                node.parentNode.replaceChild(relatedNode, node);
            },
            remove: function(node, parentNode) {
                parentNode.removeChild(node);
            }
        },
        optimizedManipulationStrategies = {
            after: "afterend",
            before: "beforebegin",
            append: "beforeend",
            prepend: "afterbegin"
        };

        Object.keys(manipulationStrategies).forEach(function(methodName) {
            var process = manipulationStrategies[methodName],
                adjStrategy = optimizedManipulationStrategies[methodName];

            extend(DOMElement.prototype, methodName, function(element, /*INTERNAL*/reverse) {
                var el = this._node,
                    relatedNode = el.parentNode;

                if (typeof element === "string") {
                    relatedNode = adjStrategy ? null : sandbox.fragment(element);
                } else if (element && (element.nodeType === 1 || element.nodeType === 11)) {
                    relatedNode = element;
                } else if (element !== undefined) {
                    throw makeArgumentsError(methodName);
                }

                if (relatedNode) {
                    process(el, relatedNode);
                } else {
                    el.insertAdjacentHTML(adjStrategy, element);
                }

                return this;
            });
        });
    })();

    // classes manipulation
    (function() {
        var rclass = /[\n\t\r]/g,
            classStrategies = htmlEl.classList ? {
                hasClass: function(className) {
                    return this._node.classList.contains(className);
                },
                addClass: function(className) {
                    this._node.classList.add(className);
                },
                removeClass: function(className) {
                    this._node.classList.remove(className);
                },
                toggleClass: function(className) {
                    this._node.classList.toggle(className);
                }
            } : {
                hasClass: function(className) {
                    return !!~((" " + this._node.className + " ")
                            .replace(rclass, " ")).indexOf(" " + className + " ");
                },
                addClass: function(className) {
                    if (!classStrategies.hasClass.call(this, className)) {
                        this._node.className += " " + className;
                    }
                },
                removeClass: function(className) {
                    this._node.className = (" " + this._node.className + " ")
                        .replace(rclass, " ").replace(" " + className + " ", " ").trim();
                },
                toggleClass: function(className) {
                    var oldClassName = this._node.className;

                    classStrategies.addClass.call(this, className);

                    if (oldClassName === this._node.className) {
                        classStrategies.removeClass.call(this, className);
                    }
                }
            };

        Object.keys(classStrategies).forEach(function(methodName) {
            var process = classStrategies[methodName],
                arrayMethodName = methodName === "hasClass" ? "every" : "forEach";

            extend(DOMElement.prototype, methodName, function(classNames) {
                if (typeof classNames !== "string") {
                    throw makeArgumentsError(name);
                }

                var result = classNames.split(" ")[arrayMethodName](process, this);

                return result === undefined ? this : result;
            });
        });
    })();

    // style manipulation
    (function() {
        var cssHooks = {},
            rdash = /\-./g,
            dashSeparatedToCamelCase = function(str) { return str.charAt(1).toUpperCase(); };

        slice.call(window.getComputedStyle(htmlEl, "")).forEach(function(propName) {
            var unprefixedName = propName.indexOf(vendorPrefix) === 1 ? propName.substr(vendorPrefix.length + 2) : propName,
                stylePropName = unprefixedName !== propName ? propName.substr(1) : propName;

            stylePropName = stylePropName.replace(rdash, dashSeparatedToCamelCase);

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

        DOMElement.prototype.getStyle = function(name) {
            var style = this._node.style,
                hook, result;

            if (typeof name !== "string") {
                throw makeArgumentsError("getStyle"); 
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

        DOMElement.prototype.setStyle = function(name, value) {
            var style = this._node.style,
                nameType = typeof name,
                hook;

            if (nameType === "string") {
                hook = cssHooks[name];
                hook = hook && hook.set;

                hook ? hook(style, value) : style[name] = value;
            } else if (nameType === "object") {
                Object.keys(name).forEach(function(key) {
                    this.setStyle(key, name[key]);
                }, this);
            } else {
                throw makeArgumentsError("setStyle");
            }

            return this;
        };
    })();

    DOMEvent.prototype = extend({}, {
        get: function(name) {
            if (typeof name !== "string" || ~name.indexOf("arget") || ~name.indexOf("lement")) {
                throw makeArgumentsError("get", "DOMEvent");
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

    // public API
    DOM = window.DOM = extend(new DOMNode(document), {
        create: function(content) {
            var elem = content;

            if (typeof content === "string") {
                if (~content.indexOf("<")) {
                    return DOMElementCollection.create(sandbox.parse(content));
                } else {
                    elem = document.createElement(content);
                }
            } else if (!(content instanceof Element)) {
                throw makeArgumentsError("create");
            }

            return DOMElement(elem);
        },
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
                prefixedProps = filter.call(window.getComputedStyle(htmlEl, ""), function(prop) {
                    return prop.indexOf(vendorPrefix) === 1;
                }),
                process = function(selector, styles) {
                    var ruleText = selector + " { ";

                    if (typeof styles === "object") {
                        Object.keys(styles).forEach(function(propName) {
                            var prefixedPropName = "-" + vendorPrefix + "-" + propName;
                            // append vendor prefix if it's required
                            ruleText += (~prefixedProps.indexOf(prefixedPropName) ? prefixedPropName : propName) + ":" + styles[propName] + "; ";
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
                    slice.call(arguments).forEach(function(rule) {
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
                keyframes = !!(window.CSSKeyframesRule || window[("WebKit|Moz|MS|O").match(new RegExp("(" + vendorPrefix + ")", "i"))[1] + "CSSKeyframesRule"]);

            return function(selector, callback) {
                var animationName = "DOM" + new Date().getTime(),
                    cancelBubbling = function(e) {
                        if (e.animationName === animationName) {
                            e.stopPropagation();
                        }
                    };

                DOM.importStyles(
                    "@" + (keyframes ? "-" + vendorPrefix + "-" : "") + "keyframes " + animationName,
                    "from { clip: rect(1px, auto, auto, auto) } to { clip: rect(0px, auto, auto, auto) }"
                );

                DOM.importStyles(selector, {
                    "animation-duration": "0.001s",
                    "animation-name": animationName + " !important"
                });

                startNames.forEach(function(name) {
                    document.addEventListener(name, function(e) {
                        var el = e.target;

                        if (e.animationName === animationName) {
                            callback(DOMElement(el));
                            // prevent double initialization
                            el.addEventListener(name, cancelBubbling, false);
                        }
                    }, false);
                });
            };
        })(),
        extend: function(selector, options) {
            if (!options || typeof options !== "object") {
                throw makeArgumentsError("extend");
            }

            var mixins = {}, 
                template = options.template,
                css = options.css;

            if (template) {
                Object.keys(template).forEach(function(key) {
                    template[key] = sandbox.fragment(template[key]);
                });

                delete options.template;
            }

            if (css) {
                DOM.importStyles.apply(DOM, css);

                delete options.css;
            }

            Object.keys(options).forEach(function(key) {
                if (key !== "constructor") {
                    mixins[key] = {
                        value: options[key],
                        enumerable: true
                    };
                }
            });

            DOM.watch(selector, function(el) {
                Object.defineProperties(el, mixins);

                template && Object.keys(template).forEach(function(key) {
                    el[key](template[key].cloneNode(true));
                });

                if (options.hasOwnProperty("constructor")) {
                    options.constructor.call(el);
                }
            });
        }
    });

    // finish prototypes
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
        ctr.prototype.constructor = ctr;
    });

})(window, document, Array.prototype.slice, Array.prototype.filter);
