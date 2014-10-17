/**
 * @file better-dom.js
 * @overview better-dom: Live extension playground
 * @version 2.0.1 Fri, 17 Oct 2014 13:22:35 GMT
 * @copyright 2013-2014 Maksim Chemerisuk
 * @license MIT
 * @see https://github.com/chemerisuk/better-dom
 */
(function() {
    "use strict";
    var const$$WINDOW = window;
    var const$$DOCUMENT = const$$WINDOW.document;
    var const$$HTML = const$$DOCUMENT.documentElement;

    var const$$userAgent = const$$WINDOW.navigator.userAgent;

    var const$$JSCRIPT_VERSION=/*@cc_on @_jscript_version|@*/void 0;
    var const$$LEGACY_ANDROID = ~const$$userAgent.indexOf("Android") && const$$userAgent.indexOf("Chrome") < 0;
    var const$$WEBKIT_PREFIX = const$$WINDOW.WebKitAnimationEvent ? "-webkit-" : "";
    var const$$CUSTOM_EVENT_TYPE = "dataavailable";

    function types$$$NullElement() {}

    function types$$$Element(node) {
        if (this instanceof types$$$Element) {
            if (node) {
                this[0] = node;
                // use a generated property to store a reference
                // to the wrapper for circular object binding
                node["__2000001__"] = this;
            }

            this._ = { _handlers: [], _watchers: {}, _extensions: [] };
        } else if (node) {
            var cached = node["__2000001__"];
            // create a wrapper only once for each native element
            return cached ? cached : new types$$$Element(node);
        } else {
            return new types$$$NullElement();
        }
    }

    types$$$Element.prototype = {
        constructor: function(node) {
            // filter non elements like text nodes, comments etc.
            return types$$$Element(node && node.nodeType === 1 ? node : null);
        },
        toString: function() {
            var node = this[0];

            return node ? "<" + node.tagName.toLowerCase() + ">" : "";
        },
        version: "2.0.1"
    };

    types$$$NullElement.prototype = new types$$$Element();

    var types$$DOM = new types$$$Element(const$$HTML);

    var util$index$$arrayProto = Array.prototype,
        util$index$$head = const$$DOCUMENT.getElementsByTagName("head")[0];

    var util$index$$default = {
        computeStyle: function(node)  {
            if (const$$WINDOW.getComputedStyle) {
                return const$$WINDOW.getComputedStyle(node);
            } else {
                return node.currentStyle;
            }
        },
        injectElement: function(el)  {
            if (el && el.nodeType === 1) {
                return util$index$$head.appendChild(el);
            }
        },
        // utilites
        every: util$index$$arrayProto.every,
        each: util$index$$arrayProto.forEach,
        filter: util$index$$arrayProto.filter,
        map: util$index$$arrayProto.map,
        slice: util$index$$arrayProto.slice,
        isArray: Array.isArray,
        keys: Object.keys,
        safeInvoke: function(context, fn, arg1, arg2)  {
            if (typeof fn === "string") fn = context[fn];

            try {
                return fn.call(context, arg1, arg2);
            } catch (err) {
                const$$WINDOW.setTimeout(function()  { throw err }, 1);

                return false;
            }
        },
        register: function(mixins, defaultBehavior)  {
            defaultBehavior = defaultBehavior || function() {};

            Object.keys(mixins).forEach(function(key)  {
                var defaults = defaultBehavior(key) || function() { return this };

                types$$$Element.prototype[key] = mixins[key];
                types$$$NullElement.prototype[key] = defaults;
            });
        }
    };

    // customized errors

    function errors$$MethodError(methodName, args) {var type = arguments[2];if(type === void 0)type = "$Element";
        var url = "http://chemerisuk.github.io/better-dom/" + type + ".html#" + methodName,
            line = "invalid call `" + type + (type === "DOM" ? "." : "#") + methodName + "(";

        line += util$index$$default.map.call(args, function(arg)  {return String(arg)}).join(", ") + ")`;";

        this.message = line + " check " + url + " to verify the function arguments";
    }

    errors$$MethodError.prototype = new TypeError();

    function errors$$StaticMethodError(methodName, args) {
        errors$$MethodError.call(this, methodName, args, "DOM");
    }

    errors$$StaticMethodError.prototype = new TypeError();

    var exports$$_DOM = const$$WINDOW.DOM;

    types$$DOM.noConflict = function() {
        if (const$$WINDOW.DOM === types$$DOM) {
            const$$WINDOW.DOM = exports$$_DOM;
        }

        return types$$DOM;
    };

    const$$WINDOW.DOM = types$$DOM;

    /* es6-transpiler has-iterators:false, has-generators: false */

    var // operator type / priority object
        dom$emmet$$operators = {"(": 1,")": 2,"^": 3,">": 4,"+": 5,"*": 6,"`": 7,"[": 8,".": 8,"#": 8},
        dom$emmet$$reParse = /`[^`]*`|\[[^\]]*\]|\.[^()>^+*`[#]+|[^()>^+*`[#.]+|\^+|./g,
        dom$emmet$$reAttr = /\s*([\w\-]+)(?:=((?:`([^`]*)`)|[^\s]*))?/g,
        dom$emmet$$reIndex = /(\$+)(?:@(-)?(\d+)?)?/g,
        dom$emmet$$reDot = /\./g,
        dom$emmet$$reDollar = /\$/g,
        dom$emmet$$tagCache = {"": ""},
        dom$emmet$$normalizeAttrs = function(_, name, value, rawValue)  {
            // try to detemnie which kind of quotes to use
            var quote = value && value.indexOf("\"") >= 0 ? "'" : "\"";

            if (typeof rawValue === "string") {
                // grab unquoted value for smart quotes
                value = rawValue;
            } else if (typeof value !== "string") {
                // handle boolean attributes by using name as value
                value = name;
            }
            // always wrap attribute values with quotes even they don't exist
            return " " + name + "=" + quote + value + quote;
        },
        dom$emmet$$injectTerm = function(term, end)  {return function(html)  {
            // find index of where to inject the term
            var index = end ? html.lastIndexOf("<") : html.indexOf(">");
            // inject the term into the HTML string
            return html.substr(0, index) + term + html.substr(index);
        }},
        dom$emmet$$makeTerm = function(tag)  {
            return dom$emmet$$tagCache[tag] || (dom$emmet$$tagCache[tag] = "<" + tag + "></" + tag + ">");
        },
        dom$emmet$$makeIndexedTerm = function(n, term)  {
            var result = Array(n), i;

            for (i = 0; i < n; ++i) {
                result[i] = term.replace(dom$emmet$$reIndex, function(expr, fmt, sign, base)  {
                    var index = (sign ? n - i - 1 : i) + (base ? +base : 1);
                    // handle zero-padded index values, like $$$ etc.
                    return (fmt + index).slice(-fmt.length).replace(dom$emmet$$reDollar, "0");
                });
            }

            return result;
        };

    // populate empty tag names with result
    "area base br col hr img input link meta param command keygen source".split(" ").forEach(function(tag)  {
        dom$emmet$$tagCache[tag] = "<" + tag + ">";
    });

    types$$DOM.emmet = function(template, varMap) {var $D$0;var $D$1;var $D$2;
        if (typeof template !== "string") throw new errors$$StaticMethodError("emmet", arguments);

        if (varMap) template = types$$DOM.format(template, varMap);

        if (template in dom$emmet$$tagCache) {return dom$emmet$$tagCache[template];}

        // transform template string into RPN

        var stack = [], output = [];

        $D$2 = (template.match(dom$emmet$$reParse));$D$0 = 0;$D$1 = $D$2.length;for (var str ;$D$0 < $D$1;){str = ($D$2[$D$0++]);
            var op = str[0];
            var priority = dom$emmet$$operators[op];

            if (priority) {
                if (str !== "(") {
                    // for ^ operator need to skip > str.length times
                    for (var i = 0, n = (op === "^" ? str.length : 1); i < n; ++i) {
                        while (stack[0] !== op && dom$emmet$$operators[stack[0]] >= priority) {
                            var head = stack.shift();

                            output.push(head);
                            // for ^ operator stop shifting when the first > is found
                            if (op === "^" && head === ">") break;
                        }
                    }
                }

                if (str === ")") {
                    stack.shift(); // remove "(" symbol from stack
                } else {
                    // handle values inside of `...` and [...] sections
                    if (op === "[" || op === "`") {
                        output.push(str.slice(1, -1));
                    }
                    // handle multiple classes, e.g. a.one.two
                    if (op === ".") {
                        output.push(str.substr(1).replace(dom$emmet$$reDot, " "));
                    }

                    stack.unshift(op);
                }
            } else {
                output.push(str);
            }
        };$D$0 = $D$1 = $D$2 = void 0;

        output = output.concat(stack);

        // transform RPN into html nodes

        stack = [];

        $D$0 = 0;$D$1 = output.length;for (var str$0 ;$D$0 < $D$1;){str$0 = (output[$D$0++]);
            if (str$0 in dom$emmet$$operators) {
                var value = stack.shift();
                var node = stack.shift();

                if (typeof node === "string") {
                    node = [ dom$emmet$$makeTerm(node) ];
                }

                switch(str$0) {
                case ".":
                    value = dom$emmet$$injectTerm(" class=\"" + value + "\"");
                    break;

                case "#":
                    value = dom$emmet$$injectTerm(" id=\"" + value + "\"");
                    break;

                case "[":
                    value = dom$emmet$$injectTerm(value.replace(dom$emmet$$reAttr, dom$emmet$$normalizeAttrs));
                    break;

                case "*":
                    node = dom$emmet$$makeIndexedTerm(+value, node.join(""));
                    break;

                case "`":
                    stack.unshift(node);
                    node = [ value ];
                    break;

                default: /* ">", "+", "^" */
                    value = typeof value === "string" ? dom$emmet$$makeTerm(value) : value.join("");

                    if (str$0 === ">") {
                        value = dom$emmet$$injectTerm(value, true);
                    } else {
                        node.push(value);
                    }
                }

                str$0 = typeof value === "function" ? node.map(value) : node;
            }

            stack.unshift(str$0);
        };$D$0 = $D$1 = void 0;

        if (output.length === 1) {
            // handle single tag case
            output = dom$emmet$$makeTerm(stack[0]);
        } else {
            output = stack[0].join("");
        }

        return output;
    };

    var dom$emmet$$default = dom$emmet$$tagCache;

    var dom$create$$sandbox = const$$DOCUMENT.createElement("body"),
        dom$create$$makeMethod = function(all)  {return function(value, varMap) {
            var nodes, el;

            if (value && value in dom$emmet$$default) {
                nodes = const$$DOCUMENT.createElement(value);

                if (all) nodes = [ new types$$$Element(nodes) ];
            } else {
                value = value.trim();

                if (value[0] === "<" && value[value.length - 1] === ">") {
                    value = varMap ? types$$DOM.format(value, varMap) : value;
                } else {
                    value = types$$DOM.emmet(value, varMap);
                }

                dom$create$$sandbox.innerHTML = value; // parse input HTML string

                for (nodes = all ? [] : null; el = dom$create$$sandbox.firstChild; ) {
                    dom$create$$sandbox.removeChild(el); // detach element from the sandbox

                    if (el.nodeType === 1) {
                        if (all) {
                            nodes.push(new types$$$Element(el));
                        } else {
                            nodes = el;

                            break; // stop early, because need only the first element
                        }
                    }
                }
            }

            return all ? nodes : types$$$Element(nodes);
        }};

    types$$DOM.create = dom$create$$makeMethod("");

    types$$DOM.createAll = dom$create$$makeMethod("All");

    /*
     * Helper for css selectors
     */

    /*es6-transpiler has-iterators:false, has-generators: false*/
    var util$selectormatcher$$rquickIs = /^(\w*)(?:#([\w\-]+))?(?:\[([\w\-\=]+)\])?(?:\.([\w\-]+))?$/,
        util$selectormatcher$$propName = "m oM msM mozM webkitM".split(" ").reduce(function(result, prefix)  {
                var propertyName = prefix + "atchesSelector";

                return result || const$$HTML[propertyName] && propertyName;
            }, null);

    var util$selectormatcher$$default = function(selector, context) {
        if (typeof selector !== "string") return null;

        var quick = util$selectormatcher$$rquickIs.exec(selector);

        if (quick) {
            //   0  1    2   3          4
            // [ _, tag, id, attribute, class ]
            if (quick[1]) quick[1] = quick[1].toLowerCase();
            if (quick[3]) quick[3] = quick[3].split("=");
            if (quick[4]) quick[4] = " " + quick[4] + " ";
        }

        return function(node) {var $D$3;var $D$4;
            var result, found;
            if (!quick && !util$selectormatcher$$propName) {
                found = (context || document).querySelectorAll(selector);
            }

            for (; node && node.nodeType === 1; node = node.parentNode) {
                if (quick) {
                    result = (
                        (!quick[1] || node.nodeName.toLowerCase() === quick[1]) &&
                        (!quick[2] || node.id === quick[2]) &&
                        (!quick[3] || (quick[3][1] ? node.getAttribute(quick[3][0]) === quick[3][1] : node.hasAttribute(quick[3][0]))) &&
                        (!quick[4] || (" " + node.className + " ").indexOf(quick[4]) >= 0)
                    );
                } else {
                    if (util$selectormatcher$$propName) {
                        result = node[util$selectormatcher$$propName](selector);
                    } else {
                        $D$3 = 0;$D$4 = found.length;for (var n ;$D$3 < $D$4;){n = (found[$D$3++]);
                            if (n === node) return n;
                        };$D$3 = $D$4 = void 0;
                    }
                }

                if (result || !context || node === context) break;
            }

            return result && node;
        };
    };

    var util$extensionhandler$$rePrivateFunction = /^(?:on|do)[A-Z]/;

    var util$extensionhandler$$default = function(selector, condition, mixins, index)  {
        var ctr = mixins.hasOwnProperty("constructor") && mixins.constructor,
            matcher = util$selectormatcher$$default(selector);

        return function(node, mock)  {
            var el = types$$$Element(node);
            // skip previously invoked or mismatched elements
            if (~el._._extensions.indexOf(index) || !matcher(node)) return;
            // mark extension as invoked
            el._._extensions.push(index);

            if (mock === true || condition(el) !== false) {
                // apply all private/public members to the element's interface
                var privateFunctions = Object.keys(mixins).filter(function(prop)  {
                    var method = mixins[prop];

                    if (util$extensionhandler$$rePrivateFunction.exec(prop)) {
                        // preserve context for private functions
                        el[prop] = function()  {return method.apply(el, arguments)};
                        // store original method internally to reduce
                        // function calls in some cases
                        el[prop][0] = method;

                        return !mock;
                    }

                    if (prop !== "constructor") {
                        el[prop] = method;
                    }
                });

                // invoke constructor if it exists
                // make a safe call so live extensions can't break each other
                if (ctr) util$index$$default.safeInvoke(el, ctr);
                // remove event handlers from element's interface
                privateFunctions.forEach(function(prop)  { delete el[prop] });
            }
        };
    };

    // Inspired by trick discovered by Daniel Buchner:
    // https://github.com/csuwldcat/SelectorListener

    var dom$extend$$extensions = [],
        dom$extend$$returnTrue = function()  {return true},
        dom$extend$$returnFalse = function()  {return false},
        dom$extend$$cssText;

    types$$DOM.extend = function(selector, condition, mixins) {
        if (arguments.length === 2) {
            mixins = condition;
            condition = true;
        }

        if (typeof condition === "boolean") condition = condition ? dom$extend$$returnTrue : dom$extend$$returnFalse;
        if (typeof mixins === "function") mixins = {constructor: mixins};

        if (!mixins || typeof mixins !== "object" || typeof condition !== "function") throw new errors$$StaticMethodError("extend", arguments);

        if (selector === "*") {
            util$index$$default.keys(mixins).forEach(function(methodName)  {
                types$$$Element.prototype[methodName] = mixins[methodName];
            });
        } else {
            var ext = util$extensionhandler$$default(selector, condition, mixins, dom$extend$$extensions.length);

            dom$extend$$extensions.push(ext);

            // live extensions are always async
            const$$WINDOW.setTimeout(function()  {
                // initialize extension manually to make sure that all elements
                // have appropriate methods before they are used in other DOM.extend.
                // Also fixes legacy IEs when the HTC behavior is already attached
                util$index$$default.each.call(const$$DOCUMENT.querySelectorAll(selector), ext);
                // MUST be after querySelectorAll because of legacy IEs quirks
                types$$DOM.importStyles(selector, dom$extend$$cssText);
            }, 1);
        }
    };

    if (const$$JSCRIPT_VERSION < 10) {
        var dom$extend$$legacyScripts = util$index$$default.filter.call(const$$DOCUMENT.scripts, function(script)  {return script.src.indexOf("better-dom-legacy.js") >= 0});

        if (dom$extend$$legacyScripts.length < 1) {
            throw new Error("In order to use live extensions in IE < 10 you have to include extra files. See https://github.com/chemerisuk/better-dom#notes-about-old-ies for details.");
        }

        dom$extend$$cssText = "-ms-behavior:url(" + dom$extend$$legacyScripts[0].src.replace(".js", ".htc") + ") !important";

        const$$DOCUMENT.attachEvent("on" + const$$CUSTOM_EVENT_TYPE, function()  {
            var e = const$$WINDOW.event;

            if (e.srcUrn === const$$CUSTOM_EVENT_TYPE) {
                dom$extend$$extensions.forEach(function(ext)  { ext(e.srcElement) });
            }
        });
    } else {
        var dom$extend$$ANIMATION_NAME = "DOM2000001";
        var dom$extend$$_extend = types$$DOM.extend;

        dom$extend$$cssText = const$$WEBKIT_PREFIX + "animation-name:" + dom$extend$$ANIMATION_NAME + " !important;";
        dom$extend$$cssText += const$$WEBKIT_PREFIX + "animation-duration:1ms !important";

        types$$DOM.extend = function()  {
            // declare the fake animation on the first DOM.extend method call
            types$$DOM.importStyles("@" + const$$WEBKIT_PREFIX + "keyframes " + dom$extend$$ANIMATION_NAME, "from {opacity:.99} to {opacity:1}");
            // restore original method and invoke it
            (types$$DOM.extend = dom$extend$$_extend).apply(types$$DOM, arguments);
        };

        // use capturing to suppress internal animationstart events
        const$$DOCUMENT.addEventListener(const$$WEBKIT_PREFIX ? "webkitAnimationStart" : "animationstart", function(e)  {
            if (e.animationName === dom$extend$$ANIMATION_NAME) {
                dom$extend$$extensions.forEach(function(ext)  { ext(e.target) });
                // this is an internal event - stop it immediately
                e.stopImmediatePropagation();
            }
        }, true);
    }

    var dom$extend$$default = dom$extend$$extensions;

    var dom$format$$reVar = /\{([\w\-]+)\}/g;

    types$$DOM.format = function(tmpl, varMap) {
        if (typeof tmpl !== "string") throw new errors$$StaticMethodError("format", arguments);

        if (!varMap || typeof varMap !== "object") varMap = {};

        return tmpl.replace(dom$format$$reVar, function(x, name)  {return name in varMap ? String(varMap[name]) : x});
    };

    types$$DOM.importScripts = function() {var SLICE$0 = Array.prototype.slice;var urls = SLICE$0.call(arguments, 0);
        var callback = function() {
            var arg = urls.shift(),
                argType = typeof arg,
                script;

            if (argType === "string") {
                script = const$$DOCUMENT.createElement("script");
                script.src = arg;
                script.onload = callback;
                script.async = true;

                util$index$$default.injectElement(script);
            } else if (argType === "function") {
                arg();
            } else if (arg) {
                throw new errors$$StaticMethodError("importScripts", arguments);
            }
        };

        callback();
    };

    /*
     * Helper for accessing css properties
     */
    var util$stylehooks$$hooks = {get: {}, set: {}},
        util$stylehooks$$reDash = /\-./g,
        util$stylehooks$$reCamel = /[A-Z]/g,
        util$stylehooks$$directions = ["Top", "Right", "Bottom", "Left"],
        util$stylehooks$$computed = util$index$$default.computeStyle(const$$HTML),
        // In Opera CSSStyleDeclaration objects returned by _.computeStyle have length 0
        util$stylehooks$$props = util$stylehooks$$computed.length ? util$index$$default.slice.call(util$stylehooks$$computed, 0) : util$index$$default.keys(util$stylehooks$$computed).map(function(key)  {
            return key.replace(util$stylehooks$$reCamel, function(str)  {return "-" + str.toLowerCase()});
        }),
        util$stylehooks$$shortCuts = {
            font: ["fontStyle", "fontSize", "/", "lineHeight", "fontFamily"],
            padding: util$stylehooks$$directions.map(function(dir)  {return "padding" + dir}),
            margin: util$stylehooks$$directions.map(function(dir)  {return "margin" + dir}),
            "border-width": util$stylehooks$$directions.map(function(dir)  {return "border" + dir + "Width"}),
            "border-style": util$stylehooks$$directions.map(function(dir)  {return "border" + dir + "Style"})
        };

    util$stylehooks$$props.forEach(function(propName)  {
        var prefix = propName[0] === "-" ? propName.substr(1, propName.indexOf("-", 1) - 1) : null,
            unprefixedName = prefix ? propName.substr(prefix.length + 2) : propName,
            stylePropName = propName.replace(util$stylehooks$$reDash, function(str)  {return str[1].toUpperCase()});
        if (!(stylePropName in util$stylehooks$$computed)) {
            // most of browsers starts vendor specific props in lowercase
            stylePropName = stylePropName[0].toLowerCase() + stylePropName.substr(1);
        }

        util$stylehooks$$hooks.get[unprefixedName] = function(style)  {return style[stylePropName]};
        util$stylehooks$$hooks.set[unprefixedName] = function(style, value)  {
            value = typeof value === "number" ? value + "px" : value.toString();
            // use cssText property to determine DOM.importStyles call
            style["cssText" in style ? stylePropName : propName] = value;
        };
    });

    // Exclude the following css properties from adding px
    " float fill-opacity font-weight line-height opacity orphans widows z-index zoom ".split(" ").forEach(function(propName)  {
        var stylePropName = propName.replace(util$stylehooks$$reDash, function(str)  {return str[1].toUpperCase()});

        if (propName === "float") {
            stylePropName = "cssFloat" in util$stylehooks$$computed ? "cssFloat" : "styleFloat";
            // normalize float css property
            util$stylehooks$$hooks.get[propName] = function(style)  {return style[stylePropName]};
        }

        util$stylehooks$$hooks.set[propName] = function(style, value)  {
            style["cssText" in style ? stylePropName : propName] = value.toString();
        };
    });

    // normalize property shortcuts
    util$index$$default.keys(util$stylehooks$$shortCuts).forEach(function(key)  {
        var props = util$stylehooks$$shortCuts[key];

        util$stylehooks$$hooks.get[key] = function(style)  {
            var result = [],
                hasEmptyStyleValue = function(prop, index)  {
                    result.push(prop === "/" ? prop : style[prop]);

                    return !result[index];
                };

            return props.some(hasEmptyStyleValue) ? "" : result.join(" ");
        };

        util$stylehooks$$hooks.set[key] = function(style, value)  {
            if (value && "cssText" in style) {
                // normalize setting complex property across browsers
                style.cssText += ";" + key + ":" + value;
            } else {
                props.forEach(function(name)  {return style[name] = typeof value === "number" ? value + "px" : value.toString()});
            }
        };
    });

    var util$stylehooks$$default = util$stylehooks$$hooks;

    var dom$importstyles$$styleNode = util$index$$default.injectElement(const$$DOCUMENT.createElement("style")),
        dom$importstyles$$styleSheet = dom$importstyles$$styleNode.sheet || dom$importstyles$$styleNode.styleSheet,
        dom$importstyles$$styleRules = dom$importstyles$$styleSheet.cssRules || dom$importstyles$$styleSheet.rules,
        dom$importstyles$$toString = function(cssText)  {
            // use styleObj to collect all style props for a new CSS rule
            var styleObj = util$index$$default.keys(cssText).reduce(function(styleObj, prop)  {
                var hook = util$stylehooks$$default.set[prop];

                if (hook) {
                    hook(styleObj, cssText[prop]);
                } else {
                    styleObj[prop] = cssText[prop];
                }

                return styleObj;
            }, {});

            return util$index$$default.keys(styleObj).map(function(key)  {return key + ":" + styleObj[key]}).join(";");
        },
        dom$importstyles$$appendCSS = function(cssText)  {return function(selector)  {
            try {
                if (dom$importstyles$$styleSheet.cssRules) {
                    dom$importstyles$$styleSheet.insertRule(selector + "{" + cssText + "}", dom$importstyles$$styleRules.length);
                } else {
                    dom$importstyles$$styleSheet.addRule(selector, cssText);
                }
            } catch(err) {
                // silently ignore invalid rules
            }
        }};

    types$$DOM.importStyles = function(selector, cssText) {
        if (cssText && typeof cssText === "object") {
            cssText = dom$importstyles$$toString(cssText);
        }

        if (typeof selector === "string" && typeof cssText === "string") {
            // insert rules one by one because of several reasons:
            // 1. IE8 does not support comma in a selector string
            // 2. if one selector fails it doesn't break others
            selector.split(",").forEach(dom$importstyles$$appendCSS(cssText));
        } else {
            throw new errors$$StaticMethodError("importStyles", arguments);
        }
    };

    function dom$mock$$applyExtensions(node) {
        dom$extend$$default.forEach(function(ext)  { ext(node, true) });

        util$index$$default.each.call(node.children, dom$mock$$applyExtensions);
    }

    types$$DOM.mock = function(content, varMap) {
        if (!content) return new types$$$NullElement();

        var result = types$$DOM.create(content, varMap);

        dom$mock$$applyExtensions(result[0]);

        return result;
    };

    var element$children$$makeMethod = function(all)  {return function(selector) {
        if (all) {
            if (selector && typeof selector !== "string") throw new errors$$MethodError("children", arguments);
        } else {
            if (selector && typeof selector !== "number") throw new errors$$MethodError("child", arguments);
        }

        var node = this[0],
            matcher = util$selectormatcher$$default(selector),
            children = node.children;
        if (const$$JSCRIPT_VERSION < 9) {
            // fix IE8 bug with children collection
            children = util$index$$default.filter.call(children, function(node)  {return node.nodeType === 1});
        }

        if (all) {
            if (matcher) children = util$index$$default.filter.call(children, matcher);

            return util$index$$default.map.call(children, types$$$Element);
        } else {
            if (selector < 0) selector = children.length + selector;

            return types$$$Element(children[selector]);
        }
    }};

    util$index$$default.register({
        child: element$children$$makeMethod(false),

        children: element$children$$makeMethod(true)
    }, function(methodName)  {
        return methodName === "child" ? function()  {return new types$$$NullElement()} : function()  {return []};
    });

    /* es6-transpiler has-iterators:false, has-generators: false */

    var element$classes$$reSpace = /[\n\t\r]/g,
        element$classes$$makeMethod = function(nativeMethodName, strategy)  {
            var methodName = nativeMethodName === "contains" ? "hasClass" : nativeMethodName + "Class";
            if (const$$HTML.classList) {
                // use native classList property if possible
                strategy = function(el, token) {
                    return el[0].classList[nativeMethodName](token);
                };
            }

            if (methodName === "hasClass" || methodName === "toggleClass") {
                return function(token, force) {
                    if (typeof force === "boolean" && methodName === "toggleClass") {
                        this[force ? "addClass" : "removeClass"](token);

                        return force;
                    }

                    if (typeof token !== "string") throw new errors$$MethodError(methodName, arguments);

                    return strategy(this, token);
                };
            } else {
                return function() {var $D$5;var $D$6;
                    var tokens = arguments;

                    $D$5 = 0;$D$6 = tokens.length;for (var token ;$D$5 < $D$6;){token = (tokens[$D$5++]);
                        if (typeof token !== "string") throw new errors$$MethodError(methodName, arguments);

                        strategy(this, token);
                    };$D$5 = $D$6 = void 0;

                    return this;
                };
            }
        };

    util$index$$default.register({
        hasClass: element$classes$$makeMethod("contains", function(el, token)  {
            return (" " + el[0].className + " ")
                .replace(element$classes$$reSpace, " ").indexOf(" " + token + " ") >= 0;
        }),

        addClass: element$classes$$makeMethod("add", function(el, token)  {
            if (!el.hasClass(token)) el[0].className += " " + token;
        }),

        removeClass: element$classes$$makeMethod("remove", function(el, token)  {
            el[0].className = (" " + el[0].className + " ")
                .replace(element$classes$$reSpace, " ").replace(" " + token + " ", " ").trim();
        }),

        toggleClass: element$classes$$makeMethod("toggle", function(el, token)  {
            var hasClass = el.hasClass(token);

            if (hasClass) {
                el.removeClass(token);
            } else {
                el[0].className += " " + token;
            }

            return !hasClass;
        })
    }, function(methodName)  {
        if (methodName === "hasClass" || methodName === "toggleClass") {
            return function()  {return false};
        }
    });

    util$index$$default.register({
        clone: function() {var deep = arguments[0];if(deep === void 0)deep = true;
            if (typeof deep !== "boolean") throw new errors$$MethodError("clone", arguments);

            var node = this[0], result;
            if (const$$JSCRIPT_VERSION < 9) {
                result = types$$DOM.create(node.outerHTML);

                if (!deep) result.set("innerHTML", "");
            } else {
                result = new types$$$Element(node.cloneNode(deep));
            }

            return result;
        }
    }, function()  {
        return function()  {return new types$$$NullElement()};
    });

    util$index$$default.register({
        contains: function(element) {
            var node = this[0];

            if (element instanceof types$$$Element) {
                var otherNode = element[0];

                if (otherNode === node) return true;
                if (node.contains) {
                    return node.contains(otherNode);
                } else {
                    return node.compareDocumentPosition(otherNode) & 16;
                }
            }

            throw new errors$$MethodError("contains", arguments);
        }
    }, function()  {
        return function()  {return false};
    });

    util$index$$default.register({
        css: function(name, value) {var this$0 = this;
            var len = arguments.length,
                node = this[0],
                style = node.style,
                nameType = typeof name,
                hook, computed, appendCssText;

            if (len === 1 && (nameType === "string" || util$index$$default.isArray(name))) {
                value = (nameType === "string" ? [name] : name).reduce(function(memo, name)  {
                    hook = util$stylehooks$$default.get[name];
                    value = hook ? hook(style) : style[name];

                    if (!computed && !value) {
                        style = util$index$$default.computeStyle(node);
                        value = hook ? hook(style) : style[name];

                        computed = true;
                    }

                    memo[name] = value;

                    return memo;
                }, {});

                return nameType === "string" ? value[name] : value;
            }

            appendCssText = function(key, value)  {
                var hook = util$stylehooks$$default.set[key];

                if (typeof value === "function") {
                    value = value.call(this$0, this$0.css(key));
                }

                if (value == null) value = "";

                if (hook) {
                    hook(style, value);
                } else {
                    style[key] = typeof value === "number" ? value + "px" : value.toString();
                }
            };

            if (len === 1 && name && nameType === "object") {
                util$index$$default.keys(name).forEach(function(key)  { appendCssText(key, name[key]) });
            } else if (len === 2 && nameType === "string") {
                appendCssText(name, value);
            } else {
                throw new errors$$MethodError("css", arguments);
            }

            return this;
        }
    }, function()  {
        return function(name) {
            if (arguments.length !== 1 || typeof name !== "string" && !util$index$$default.isArray(name)) {
                return this;
            }
        };
    });

    util$index$$default.register({
        defineProperty: function(name, accessors) {var this$0 = this;
            var getter = accessors.get;
            var setter = accessors.set;

            if (typeof name !== "string" || typeof getter !== "function" || typeof setter !== "function") {
                throw new errors$$MethodError("defineProperty", arguments);
            }

            Object.defineProperty(this[0], name, {
                get: function()  {return getter.call(this$0)},
                set: function(value)  { setter.call(this$0, value) }
            });

            return this;
        },
        defineAttribute: function(name, accessors) {var this$0 = this;
            var node = this[0];
            var getter = accessors.get;
            var setter = accessors.set;

            if (typeof name !== "string" || typeof getter !== "function" || typeof setter !== "function") {
                throw new errors$$MethodError("defineAttribute", arguments);
            }

            // initial value reading must be before defineProperty
            // because IE8 will try to read wrong attribute value
            var initialValue = node.getAttribute(name);
            // trick to fix infinite recursion in IE8
            var attrName = const$$JSCRIPT_VERSION < 9 ? name.toUpperCase() : name;
            var _setAttribute = node.setAttribute;
            var _removeAttribute = node.removeAttribute;

            Object.defineProperty(node, name, {
                get: function()  {
                    var attrValue = node.getAttribute(attrName, 1);

                    return getter.call(this$0, attrValue);
                },
                set: function(propValue)  {
                    var attrValue = setter.call(this$0, propValue);

                    if (attrValue == null) {
                        _removeAttribute.call(node, attrName, 1);
                    } else {
                        _setAttribute.call(node, attrName, attrValue, 1);
                    }
                }
            });

            // override methods to catch changes from attributes too
            node.setAttribute = function(attrName, attrValue, flags)  {
                if (name === attrName) {
                    node[name] = getter.call(this$0, attrValue);
                } else {
                    _setAttribute.call(node, attrName, attrValue, flags);
                }
            };

            node.removeAttribute = function(attrName, flags)  {
                if (name === attrName) {
                    node[name] = getter.call(this$0, null);
                } else {
                    _removeAttribute.call(node, attrName, flags);
                }
            };

            // apply initial attribute value
            node[name] = getter.call(this, initialValue);

            return this;
        }
    });

    // big part of code inspired by Sizzle:
    // https://github.com/jquery/sizzle/blob/master/sizzle.js

    var element$find$$rquick = const$$DOCUMENT.getElementsByClassName ? /^(?:(\w+)|\.([\w\-]+))$/ : /^(?:(\w+))$/,
        element$find$$rescape = /'|\\/g,
        element$find$$makeMethod = function(all)  {return function(selector) {
            if (typeof selector !== "string") throw new errors$$MethodError("find" + all, arguments);

            var node = this[0],
                quickMatch = element$find$$rquick.exec(selector),
                result, old, nid, context;

            if (quickMatch) {
                if (quickMatch[1]) {
                    // speed-up: "TAG"
                    result = node.getElementsByTagName(selector);
                } else {
                    // speed-up: ".CLASS"
                    result = node.getElementsByClassName(quickMatch[2]);
                }

                if (result && !all) result = result[0];
            } else {
                old = true;
                nid = "DOM2000001";
                context = node;

                if (this !== types$$DOM) {
                    // qSA works strangely on Element-rooted queries
                    // We can work around this by specifying an extra ID on the root
                    // and working up from there (Thanks to Andrew Dupont for the technique)
                    if ( (old = node.getAttribute("id")) ) {
                        nid = old.replace(element$find$$rescape, "\\$&");
                    } else {
                        node.setAttribute("id", nid);
                    }

                    nid = "[id='" + nid + "'] ";
                    selector = nid + selector.split(",").join("," + nid);
                }

                result = util$index$$default.safeInvoke(context, "querySelector" + all, selector);

                if (!old) node.removeAttribute("id");
            }

            return all ? util$index$$default.map.call(result, types$$$Element) : types$$$Element(result);
        }};

    util$index$$default.register({
        find: element$find$$makeMethod(""),

        findAll: element$find$$makeMethod("All")
    }, function(methodName)  {
        return methodName === "find" ? function()  {return new types$$$NullElement()} : function()  {return []};
    });

    var util$eventhooks$$hooks = {};
    if ("onfocusin" in const$$HTML) {
        util$eventhooks$$hooks.focus = function(handler)  { handler._type = "focusin" };
        util$eventhooks$$hooks.blur = function(handler)  { handler._type = "focusout" };
    } else {
        // firefox doesn't support focusin/focusout events
        util$eventhooks$$hooks.focus = util$eventhooks$$hooks.blur = function(handler)  { handler.capturing = true };
    }
    if (const$$DOCUMENT.createElement("input").validity) {
        util$eventhooks$$hooks.invalid = function(handler)  { handler.capturing = true };
    }
    if (const$$JSCRIPT_VERSION < 9) {
        // fix non-bubbling form events for IE8
        ["submit", "change", "reset"].forEach(function(name)  {
            util$eventhooks$$hooks[name] = function(handler)  { handler._type = const$$CUSTOM_EVENT_TYPE };
        });
    }

    var util$eventhooks$$default = util$eventhooks$$hooks;

    function util$eventhandler$$getEventProperty(name, e, type, node, target, currentTarget) {
        if (typeof name === "number") {
            return e.detail ? e.detail[name] : void 0;
        }

        if (typeof name !== "string") return name;
        if (const$$JSCRIPT_VERSION < 9) {
            switch (name) {
            case "which":
                return e.keyCode;
            case "button":
                var button = e.button;
                // click: 1 === left; 2 === middle; 3 === right
                return button & 1 ? 1 : ( button & 2 ? 3 : ( button & 4 ? 2 : 0 ) );
            case "pageX":
                return e.clientX + const$$HTML.scrollLeft - const$$HTML.clientLeft;
            case "pageY":
                return e.clientY + const$$HTML.scrollTop - const$$HTML.clientTop;
            case "preventDefault":
                return function()  {return e.returnValue = false};
            case "stopPropagation":
                return function()  {return e.cancelBubble = true};
            }
        }

        switch (name) {
        case "type":
            return type;
        case "defaultPrevented":
            // IE8 and Android 2.3 use returnValue instead of defaultPrevented
            return "defaultPrevented" in e ? e.defaultPrevented : e.returnValue === false;
        case "target":
            return types$$$Element(target);
        case "currentTarget":
            return types$$$Element(currentTarget);
        case "relatedTarget":
            return types$$$Element(e.relatedTarget || e[(e.toElement === node ? "from" : "to") + "Element"]);
        }

        var value = e[name];

        if (typeof value === "function") {
            return function()  {return value.apply(e, arguments)};
        }

        return value;
    }

    function util$eventhandler$$EventHandler(type, selector, callback, props, el, once) {
        var node = el[0],
            hook = util$eventhooks$$default[type],
            matcher = util$selectormatcher$$default(selector, node),
            handler = function(e)  {
                e = e || const$$WINDOW.event;
                // early stop in case of default action
                if (util$eventhandler$$EventHandler.skip === type) return;
                if (handler._type === const$$CUSTOM_EVENT_TYPE && e.srcUrn !== type) {
                    return; // handle custom events in legacy IE
                }
                // srcElement can be null in legacy IE when target is document
                var target = e.target || e.srcElement || const$$DOCUMENT,
                    currentTarget = matcher ? matcher(target) : node,
                    args;

                // early stop for late binding or when target doesn't match selector
                if (!currentTarget) return;

                // off callback even if it throws an exception later
                if (once) el.off(type, callback);

                if (props && props.length) {
                    args = props.map(function(name)  {return util$eventhandler$$getEventProperty(name, e, type, node, target, currentTarget)});
                } else {
                    // if props is not specified then prepend extra arguments
                    args = e.detail ? util$index$$default.slice.call(e.detail, 1) : [];
                }

                // prevent default if handler returns false
                if (callback.apply(el, args) === false) {
                    if (const$$JSCRIPT_VERSION < 9) {
                        e.returnValue = false;
                    } else {
                        e.preventDefault();
                    }
                }
            };

        if (hook) handler = hook(handler, type) || handler;
        if (const$$JSCRIPT_VERSION < 9 && !("on" + (handler._type || type) in node)) {
            // handle custom events for IE8
            handler._type = const$$CUSTOM_EVENT_TYPE;
        }

        handler.type = selector ? type + " " + selector : type;
        handler.callback = callback;

        return handler;
    }

    var util$eventhandler$$default = util$eventhandler$$EventHandler;

    util$index$$default.register({
        fire: function(type) {
            var node = this[0],
                e, eventType, canContinue;

            if (typeof type === "string") {
                var hook = util$eventhooks$$default[type],
                    handler = {};

                if (hook) handler = hook(handler) || handler;

                eventType = handler._type || type;
            } else {
                throw new errors$$MethodError("fire", arguments);
            }
            if (const$$JSCRIPT_VERSION < 9) {
                e = const$$DOCUMENT.createEventObject();
                e.detail = arguments;
                // handle custom events for legacy IE
                if (!("on" + eventType in node)) eventType = const$$CUSTOM_EVENT_TYPE;
                // store original event type
                if (eventType === const$$CUSTOM_EVENT_TYPE) e.srcUrn = type;

                node.fireEvent("on" + eventType, e);

                canContinue = e.returnValue !== false;
            } else {
                e = const$$DOCUMENT.createEvent("HTMLEvents");
                e.detail = arguments;
                e.initEvent(eventType, true, true);
                canContinue = node.dispatchEvent(e);
            }

            // call native function to trigger default behavior
            if (canContinue && node[type]) {
                // prevent re-triggering of the current event
                util$eventhandler$$default.skip = type;

                util$index$$default.safeInvoke(node, type);

                util$eventhandler$$default.skip = null;
            }

            return canContinue;
        }
    }, function()  {
        return function()  {return true};
    });

    var util$accessorhooks$$hooks = {get: {}, set: {}};
    var util$accessorhooks$$body = document.createElement("body");

    // fix camel cased attributes
    "tabIndex readOnly maxLength cellSpacing cellPadding rowSpan colSpan useMap frameBorder contentEditable".split(" ").forEach(function(key)  {
        util$accessorhooks$$hooks.get[ key.toLowerCase() ] = function(node)  {return node[key]};
    });

    // style hook
    util$accessorhooks$$hooks.get.style = function(node)  {return node.style.cssText};
    util$accessorhooks$$hooks.set.style = function(node, value)  { node.style.cssText = value };

    // title hook for DOM
    util$accessorhooks$$hooks.get.title = function(node)  {return node === const$$HTML ? const$$DOCUMENT.title : node.title};
    util$accessorhooks$$hooks.set.title = function(node, value)  { (node === const$$HTML ? const$$DOCUMENT : node).title = value; };

    util$accessorhooks$$hooks.get.undefined = function(node)  {
        var name;

        switch (node.tagName) {
        case "SELECT":
            return ~node.selectedIndex ? node.options[ node.selectedIndex ].value : "";

        case "OPTION":
            name = node.hasAttribute("value") ? "value" : "text";
            break;

        default:
            name = node.type && "value" in node ? "value" : "innerHTML";
        }

        return node[name];
    };

    util$accessorhooks$$hooks.set.value = function(node, value) {
        if (node.tagName === "SELECT") {
            // selectbox has special case
            if (util$index$$default.every.call(node.options, function(o)  {return !(o.selected = o.value === value)})) {
                node.selectedIndex = -1;
            }
        } else {
            // for IE use innerText for textareabecause it doesn't trigger onpropertychange
            node[const$$JSCRIPT_VERSION < 9 && node.type === "textarea" ? "innerText" : "value"] = value;
        }
    };

    // some browsers don't recognize input[type=email] etc.
    util$accessorhooks$$hooks.get.type = function(node)  {return node.getAttribute("type") || node.type};
    if (const$$JSCRIPT_VERSION < 9) {
        // IE8 has innerText but not textContent
        util$accessorhooks$$hooks.get.textContent = function(node)  {return node.innerText};
        util$accessorhooks$$hooks.set.textContent = function(node, value)  { node.innerText = value };

        // IE8 sometimes breaks on innerHTML
        util$accessorhooks$$hooks.set.innerHTML = function(node, value) {
            try {
                node.innerHTML = value;
            } catch (err) {
                node.innerText = "";
                util$accessorhooks$$body.innerHTML = value;

                for (var it; it = util$accessorhooks$$body.firstChild; ) {
                    node.appendChild(it);
                }
            }
        };
    }

    var util$accessorhooks$$default = util$accessorhooks$$hooks;

    var element$get$$reUpper = /[A-Z]/g,
        element$get$$readPrivateProperty = function(node, key)  {
            // convert from camel case to dash-separated value
            key = key.replace(element$get$$reUpper, function(l)  {return "-" + l.toLowerCase()});

            var value = node.getAttribute("data-" + key);

            if (value != null) {
                // try to recognize and parse  object notation syntax
                if (value[0] === "{" && value[value.length - 1] === "}") {
                    try {
                        value = JSON.parse(value);
                    } catch (err) {
                        // just return the value itself
                    }
                }
            }

            return value;
        };

    util$index$$default.register({
        get: function(name) {var this$0 = this;
            var node = this[0],
                hook = util$accessorhooks$$default.get[name];

            if (hook) return hook(node, name);

            if (typeof name === "string") {
                if (name in node) {
                    return node[name];
                } else if (name[0] !== "_") {
                    return node.getAttribute(name);
                } else {
                    var key = name.substr(1),
                        data = this._;

                    if (!(key in data)) {
                        data[key] = element$get$$readPrivateProperty(node, key);
                    }

                    return data[key];
                }
            } else if (util$index$$default.isArray(name)) {
                return name.reduce(function(memo, key)  {
                    return (memo[key] = this$0.get(key), memo);
                }, {});
            } else {
                throw new errors$$MethodError("get", arguments);
            }
        }
    }, function()  {
        return function()  {return void 0};
    });

    var element$manipulation$$makeMethod = function(methodName, fasterMethodName, standalone, strategy)  {return function() {var content = arguments[0];if(content === void 0)content = "";
            var node = this[0];

            if (!standalone && (!node.parentNode || content === types$$DOM)) return this;

            if (typeof content === "function") content = content.call(this);

            if (typeof content === "string") {
                if (content) {
                    // parse HTML string for the replace method
                    if (fasterMethodName) {
                        content = content.trim();
                    } else {
                        content = types$$DOM.create(content)[0];
                    }
                }
            } else if (content instanceof types$$$Element) {
                content = content[0];
            } else if (util$index$$default.isArray(content)) {
                content = content.reduce(function(fragment, el)  {
                    fragment.appendChild(el[0]);

                    return fragment;
                }, const$$DOCUMENT.createDocumentFragment());
            } else {
                throw new errors$$MethodError(methodName, arguments);
            }

            if (content && typeof content === "string") {
                node.insertAdjacentHTML(fasterMethodName, content);
            } else {
                if (content || !fasterMethodName) strategy(node, content);
            }

            return this;
        }};

    util$index$$default.register({
        after: element$manipulation$$makeMethod("after", "afterend", false, function(node, relatedNode)  {
            node.parentNode.insertBefore(relatedNode, node.nextSibling);
        }),

        before: element$manipulation$$makeMethod("before", "beforebegin", false, function(node, relatedNode)  {
            node.parentNode.insertBefore(relatedNode, node);
        }),

        prepend: element$manipulation$$makeMethod("prepend", "afterbegin", true, function(node, relatedNode)  {
            node.insertBefore(relatedNode, node.firstChild);
        }),

        append: element$manipulation$$makeMethod("append", "beforeend", true, function(node, relatedNode)  {
            node.appendChild(relatedNode);
        }),

        replace: element$manipulation$$makeMethod("replace", "", false, function(node, relatedNode)  {
            node.parentNode.replaceChild(relatedNode, node);
        }),

        remove: element$manipulation$$makeMethod("remove", "", false, function(node)  {
            node.parentNode.removeChild(node);
        })
    });

    var util$selectorhooks$$hooks = {};

    util$selectorhooks$$hooks[":focus"] = function(node)  {return node === const$$DOCUMENT.activeElement};

    util$selectorhooks$$hooks[":hidden"] = function(node)  {
        if (node.getAttribute("aria-hidden") === "true") return true;

        var computed = util$index$$default.computeStyle(node);

        return computed.visibility === "hidden" || computed.display === "none";
    };

    util$selectorhooks$$hooks[":visible"] = function(node)  {return !util$selectorhooks$$hooks[":hidden"](node)};

    var util$selectorhooks$$default = util$selectorhooks$$hooks;

    util$index$$default.register({
        matches: function(selector) {
            if (!selector || typeof selector !== "string") throw new errors$$MethodError("matches", arguments);

            var checker = util$selectorhooks$$default[selector] || util$selectormatcher$$default(selector);

            return !!checker(this[0], this);
        }
    }, function()  {
        return function()  {return false};
    });

    util$index$$default.register({
        off: function(type, callback) {
            if (typeof type !== "string") throw new errors$$MethodError("off", arguments);

            var node = this[0];

            this._._handlers = this._._handlers.filter(function(handler)  {
                if (type !== handler.type || callback && callback !== handler.callback) return true;

                type = handler._type || handler.type;
                if (const$$JSCRIPT_VERSION < 9) {
                    node.detachEvent("on" + type, handler);
                } else {
                    node.removeEventListener(type, handler, !!handler.capturing);
                }
            });

            return this;
        }
    });

    util$index$$default.register({
        offset: function() {
            var node = this[0],
                clientTop = const$$HTML.clientTop,
                clientLeft = const$$HTML.clientLeft,
                scrollTop = const$$WINDOW.pageYOffset || const$$HTML.scrollTop,
                scrollLeft = const$$WINDOW.pageXOffset || const$$HTML.scrollLeft,
                boundingRect = node.getBoundingClientRect();

            return {
                top: boundingRect.top + scrollTop - clientTop,
                left: boundingRect.left + scrollLeft - clientLeft,
                right: boundingRect.right + scrollLeft - clientLeft,
                bottom: boundingRect.bottom + scrollTop - clientTop,
                width: boundingRect.right - boundingRect.left,
                height: boundingRect.bottom - boundingRect.top
            };
        }
    }, function()  {
        return function()  {
            return { top : 0, left : 0, right : 0, bottom : 0, width : 0, height : 0 };
        };
    });

    var element$on$$makeMethod = function(method)  {return function(type, selector, args, callback) {var this$0 = this;
            if (typeof type === "string") {
                if (typeof args === "function") {
                    callback = args;

                    if (typeof selector === "string") {
                        args = null;
                    } else {
                        args = selector;
                        selector = null;
                    }
                }

                if (typeof selector === "function") {
                    callback = selector;
                    selector = null;
                    args = null;
                }

                if (typeof callback !== "function") {
                    throw new errors$$MethodError(method, arguments);
                }

                var node = this[0],
                    handler = util$eventhandler$$default(type, selector, callback, args, this, method === "once");

                if (handler) {
                    if (const$$JSCRIPT_VERSION < 9) {
                        node.attachEvent("on" + (handler._type || type), handler);
                    } else {
                        node.addEventListener(handler._type || type, handler, !!handler.capturing);
                    }
                    // store event entry
                    this._._handlers.push(handler);
                }
            } else if (typeof type === "object") {
                if (util$index$$default.isArray(type)) {
                    type.forEach(function(name)  { this$0[method](name, selector, args, callback) });
                } else {
                    util$index$$default.keys(type).forEach(function(name)  { this$0[method](name, type[name]) });
                }
            } else {
                throw new errors$$MethodError(method, arguments);
            }

            return this;
        }};

    util$index$$default.register({
        on: element$on$$makeMethod("on"),

        once: element$on$$makeMethod("once")
    });

    util$index$$default.register({
        set: function(name, value) {var this$0 = this;
            var node = this[0];

            // handle the value shortcut
            if (arguments.length === 1) {
                if (typeof name === "function") {
                    value = name;
                } else {
                    value = name == null ? "" : String(name);
                }

                if (value !== "[object Object]") {
                    var tag = node.tagName;

                    if (tag === "INPUT" || tag === "TEXTAREA" ||  tag === "SELECT" || tag === "OPTION") {
                        name = "value";
                    } else {
                        name = "innerHTML";
                    }
                }
            }

            var hook = util$accessorhooks$$default.set[name],
                watchers = this._._watchers[name],
                oldValue;

            if (watchers || typeof value === "function") {
                oldValue = this.get(name);
            }

            if (typeof name === "string") {
                if (name[0] === "_") {
                    this._[name.substr(1)] = value;
                } else {
                    if (typeof value === "function") {
                        value = value.call(this, oldValue);
                    }

                    if (hook) {
                        hook(node, value);
                    } else if (value == null) {
                        node.removeAttribute(name);
                    } else if (name in node) {
                        node[name] = value;
                    } else {
                        node.setAttribute(name, value);
                    }
                    if (const$$JSCRIPT_VERSION < 9 || const$$LEGACY_ANDROID) {
                        // always trigger reflow manually for IE8 and legacy Android
                        node.className = node.className;
                    }
                }
            } else if (util$index$$default.isArray(name)) {
                name.forEach(function(key)  { this$0.set(key, value) });
            } else if (typeof name === "object") {
                util$index$$default.keys(name).forEach(function(key)  { this$0.set(key, name[key]) });
            } else {
                throw new errors$$MethodError("set", arguments);
            }

            if (watchers && oldValue !== value) {
                watchers.forEach(function(w)  {
                    util$index$$default.safeInvoke(this$0, w, value, oldValue);
                });
            }

            return this;
        }
    });

    var element$traversing$$makeMethod = function(methodName, propertyName, all)  {return function(selector) {
            if (selector && typeof selector !== "string") throw new errors$$MethodError(methodName, arguments);

            var matcher = util$selectormatcher$$default(selector),
                nodes = all ? [] : null,
                it = this[0];

            if (methodName !== "closest" || !matcher) {
                // method closest starts traversing from the element itself
                // except no selector was specified
                it = it[propertyName];
            }

            for (; it; it = it[propertyName]) {
                if (it.nodeType === 1 && (!matcher || matcher(it))) {
                    if (!all) break;

                    nodes.push(it);
                }
            }

            return all ? util$index$$default.map.call(nodes, types$$$Element) : types$$$Element(it);
        }};

    util$index$$default.register({
        next: element$traversing$$makeMethod("next", "nextSibling"),

        prev: element$traversing$$makeMethod("prev", "previousSibling"),

        nextAll: element$traversing$$makeMethod("nextAll", "nextSibling", true),

        prevAll: element$traversing$$makeMethod("prevAll", "previousSibling", true),

        closest: element$traversing$$makeMethod("closest", "parentNode")
    }, function(methodName)  {
        if (methodName.slice(-3) === "All") {
            return function()  {return []};
        } else {
            return function()  {return new types$$$NullElement()};
        }
    });

    // Legacy Android is too slow and has a lot of bugs in the CSS animations
    // implementation, so skip any animations for it
    var element$visibility$$ANIMATIONS_ENABLED = !(const$$LEGACY_ANDROID || const$$JSCRIPT_VERSION < 10),
        element$visibility$$TRANSITION_PROPS = ["timing-function", "property", "duration", "delay"].map(function(p)  {return "transition-" + p}),
        element$visibility$$TRANSITION_EVENT_TYPE = const$$WEBKIT_PREFIX ? "webkitTransitionEnd" : "transitionend",
        element$visibility$$ANIMATION_EVENT_TYPE = const$$WEBKIT_PREFIX ? "webkitAnimationEnd" : "animationend",
        element$visibility$$parseTimeValue = function(value)  {
            var result = parseFloat(value) || 0;
            // if duration is in seconds, then multiple result value by 1000
            return !result || value.slice(-2) === "ms" ? result : result * 1000;
        },
        element$visibility$$calcTransitionDuration = function(style)  {
            var delay = util$stylehooks$$default.get["transition-delay"](style).split(","),
                duration = util$stylehooks$$default.get["transition-duration"](style).split(",");

            return Math.max.apply(Math, duration.map(function(value, index)  {
                return element$visibility$$parseTimeValue(value) + (element$visibility$$parseTimeValue(delay[index]) || 0);
            }));
        },
        element$visibility$$scheduleTransition = function(node, style, computed, hiding, done)  {
            var duration = element$visibility$$calcTransitionDuration(computed);

            if (!duration) return false; // skip transitions with zero duration

            var visibilityTransitionIndex, transitionValues;

            transitionValues = element$visibility$$TRANSITION_PROPS.map(function(prop, index)  {
                // have to use regexp to split transition-timing-function value
                return util$stylehooks$$default.get[prop](computed).split(index ? ", " : /, (?!\d)/);
            });

            // try to find existing or use 0s length or make a new visibility transition
            visibilityTransitionIndex = transitionValues[1].indexOf("visibility");
            if (visibilityTransitionIndex < 0) visibilityTransitionIndex = transitionValues[2].indexOf("0s");
            if (visibilityTransitionIndex < 0) visibilityTransitionIndex = transitionValues[0].length;

            transitionValues[0][visibilityTransitionIndex] = "linear";
            transitionValues[1][visibilityTransitionIndex] = "visibility";
            transitionValues[hiding ? 2 : 3][visibilityTransitionIndex] = "0s";
            transitionValues[hiding ? 3 : 2][visibilityTransitionIndex] = duration + "ms";

            // now set target duration and delay
            transitionValues.forEach(function(value, index)  {
                util$stylehooks$$default.set[element$visibility$$TRANSITION_PROPS[index]](style, value.join(", "));
            });

            node.addEventListener(element$visibility$$TRANSITION_EVENT_TYPE, function completeTransition(e) {
                if (e.propertyName === "visibility") {
                    e.stopPropagation(); // this is an internal transition

                    node.removeEventListener(element$visibility$$TRANSITION_EVENT_TYPE, completeTransition, true);

                    style.willChange = ""; // remove temporary properties

                    done();
                }
            }, true);

            // make sure that the visibility property will be changed
            // so reset it to appropriate value with zero
            style.visibility = hiding ? "inherit" : "hidden";
            // use willChange to improve performance in modern browsers:
            // http://dev.opera.com/articles/css-will-change-property/
            style.willChange = transitionValues[1].join(", ");

            return true;
        },
        element$visibility$$scheduleAnimation = function(node, style, computed, animationName, hiding, done)  {
            var duration = element$visibility$$parseTimeValue(util$stylehooks$$default.get["animation-duration"](computed));

            if (!duration) return false; // skip animations with zero duration

            node.addEventListener(element$visibility$$ANIMATION_EVENT_TYPE, function completeAnimation(e) {
                if (e.animationName === animationName) {
                    e.stopPropagation(); // this is an internal animation

                    node.removeEventListener(element$visibility$$ANIMATION_EVENT_TYPE, completeAnimation, true);

                    util$stylehooks$$default.set["animation-name"](style, ""); // remove temporary animation

                    done();
                }
            }, true);

            // trigger animation start
            util$stylehooks$$default.set["animation-direction"](style, hiding ? "normal" : "reverse");
            util$stylehooks$$default.set["animation-name"](style, animationName);

            return true;
        },
        element$visibility$$makeMethod = function(name, condition)  {return function(animationName, callback) {var this$0 = this;
            if (typeof animationName !== "string") {
                callback = animationName;
                animationName = null;
            }

            if (callback && typeof callback !== "function") {
                throw new errors$$MethodError(name, arguments);
            }

            var node = this[0],
                style = node.style,
                computed = util$index$$default.computeStyle(node),
                hiding = condition,
                done = function()  {
                    // Check equality of the flag and aria-hidden to recognize
                    // cases when an animation was toggled in the intermediate
                    // state. Don't need to proceed in such situation
                    if (String(hiding) === node.getAttribute("aria-hidden")) {
                        if (animatable) {
                            if (hiding && animationName) {
                                style.visibility = "hidden";
                            }
                        } else {
                            // no animation was applied
                            if (hiding) {
                                var displayValue = computed.display;

                                if (displayValue !== "none") {
                                    // internally store original display value
                                    this$0._._display = displayValue;
                                }

                                style.display = "none";
                            } else {
                                // restore previously store display value
                                style.display = this$0._._display || "inherit";
                            }
                        }

                        if (callback) callback.call(this$0);
                    }
                },
                // Determine of we need animation by checking if an
                // element has non-zero offsetWidth. It also fixes
                // animation of an element inserted into the DOM in Webkit
                // browsers pluse Opera 12 issue with CSS3 animations
                animatable = element$visibility$$ANIMATIONS_ENABLED && node.offsetWidth;

            if (typeof hiding !== "boolean") {
                hiding = !util$selectorhooks$$default[":hidden"](node);
            }

            if (animatable) {
                if (animationName) {
                    animatable = element$visibility$$scheduleAnimation(node, style, computed, animationName, hiding, done);
                } else {
                    animatable = element$visibility$$scheduleTransition(node, style, computed, hiding, done);
                }
            }

            // always update element visibility property
            // for CSS3 animation element should always be visible
            // use value "inherit" to respect parent container visibility
            style.visibility = hiding && !animationName ? "hidden" : "inherit";
            // trigger CSS3 transition if it exists
            this.set("aria-hidden", String(hiding));
            // must be AFTER changing the aria-hidden attribute
            if (!animatable) done();

            return this;
        }};

    util$index$$default.register({
        show: element$visibility$$makeMethod("show", false),

        hide: element$visibility$$makeMethod("hide", true),

        toggle: element$visibility$$makeMethod("toggle")
    });

    util$index$$default.register({
        watch: function(name, callback) {
            var watchers = this._._watchers;

            if (!watchers[name]) watchers[name] = [];

            watchers[name].push(callback);

            return this;
        },

        unwatch: function(name, callback) {
            var watchers = this._._watchers;

            if (watchers[name]) {
                watchers[name] = watchers[name].filter(function(w)  {return w !== callback});
            }

            return this;
        }
    });
})();
