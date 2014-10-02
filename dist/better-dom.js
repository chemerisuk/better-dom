/**
 * @file better-dom.js
 * @overview better-dom: Live extension playground
 * @version 2.0.0-rc.7 Thu, 02 Oct 2014 17:33:57 GMT
 * @copyright 2013-2014 Maksim Chemerisuk
 * @license MIT
 * @see https://github.com/chemerisuk/better-dom
 */
(function() {
    "use strict";var SLICE$0 = Array.prototype.slice;
    var const$$WINDOW = window;
    var const$$DOCUMENT = const$$WINDOW.document;
    var const$$HTML = const$$DOCUMENT.documentElement;

    var const$$userAgent = const$$WINDOW.navigator.userAgent;

    var const$$LEGACY_IE = const$$DOCUMENT.attachEvent && !const$$WINDOW.CSSKeyframesRule;
    var const$$LEGACY_ANDROID = ~const$$userAgent.indexOf("Android") && const$$userAgent.indexOf("Chrome") < 0;
    var const$$DOM2_EVENTS = !!const$$DOCUMENT.addEventListener;
    var const$$WEBKIT_PREFIX = const$$WINDOW.WebKitAnimationEvent ? "-webkit-" : "";
    var const$$CUSTOM_EVENT_TYPE = "dataavailable";

    function errors$$MethodError(methodName) {var type = arguments[1];if(type === void 0)type = "$Element";
        var url = "http://chemerisuk.github.io/better-dom/" + type + ".html#" + methodName;

        this.message = type + "#" + methodName + " was called with illegal arguments. Check " + url + " to verify the method call";
    }

    errors$$MethodError.prototype = new TypeError();

    function errors$$StaticMethodError(methodName) {
        errors$$MethodError.call(this, methodName, "DOM");
    }

    errors$$StaticMethodError.prototype = new TypeError();

    function types$$$NullElement() {}

    function types$$$Element(node) {
        if (this instanceof types$$$Element) {
            if (node) {
                this[0] = node;
                this._ = { _handlers: [], _watchers: {} };
                // use a generated on compile time property to store
                // a reference to the wrapper for circular binding
                node["__2000000-rc007__"] = this;
            }
        } else if (node) {
            var cached = node["__2000000-rc007__"];
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

            return node ? node.tagName.toLowerCase() : "";
        },
        valueOf: function() {
            return "2000000-rc007";
        }
    };

    types$$$NullElement.prototype = new types$$$Element();

    var types$$DOM = new types$$$Element(const$$HTML);

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
        if (typeof template !== "string") throw new errors$$StaticMethodError("emmet");

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

    var util$index$$arrayProto = Array.prototype,
        util$index$$currentScript = const$$DOCUMENT.scripts[0];

    var util$index$$default = {
        computeStyle: function(node)  {
            return const$$WINDOW.getComputedStyle ? const$$WINDOW.getComputedStyle(node) : node.currentStyle;
        },
        injectElement: function(el)  {
            return util$index$$currentScript.parentNode.insertBefore(el, util$index$$currentScript);
        },
        // utilites
        every: util$index$$arrayProto.every,
        each: util$index$$arrayProto.forEach,
        filter: util$index$$arrayProto.filter,
        map: util$index$$arrayProto.map,
        isArray: Array.isArray,
        keys: Object.keys,
        assign: function(target, source)  {
            Object.keys(source).forEach(function(key)  {
                target[key] = source[key];
            });

            return target;
        },
        safeInvoke: function(fn, context, arg1, arg2)  {
            try {
                fn.call(context, arg1, arg2);
            } catch (err) {
                const$$WINDOW.setTimeout(function()  { throw err }, 1);
            }
        }
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
        util$stylehooks$$props = util$stylehooks$$computed.length ? Array.prototype.slice.call(util$stylehooks$$computed, 0) : util$index$$default.keys(util$stylehooks$$computed).map(function(key)  {
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
        // most of browsers starts vendor specific props in lowercase
        if (!(stylePropName in util$stylehooks$$computed)) {
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
        dom$importstyles$$styleRules = dom$importstyles$$styleSheet.cssRules || dom$importstyles$$styleSheet.rules;

    types$$DOM.importStyles = function(selector, cssText) {
        if (cssText && typeof cssText === "object") {
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

            cssText = util$index$$default.keys(styleObj).map(function(key)  {return key + ":" + styleObj[key]}).join(";");
        }

        if (typeof selector !== "string" || typeof cssText !== "string") {
            throw new errors$$StaticMethodError("importStyles");
        }

        if (dom$importstyles$$styleSheet.cssRules) {
            dom$importstyles$$styleSheet.insertRule(selector + "{" + cssText + "}", dom$importstyles$$styleRules.length);
        } else {
            // ie doesn't support multiple selectors in addRule
            selector.split(",").forEach(function(selector)  { dom$importstyles$$styleSheet.addRule(selector, cssText) });
        }
    };

    var dom$importstyles$$default = types$$DOM.importStyles;

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

    var util$extensionhandler$$reRemovableMethod = /^(on|do)[A-Z]/,
        util$extensionhandler$$ANIMATION_ID = "DOM" + Date.now(),
        util$extensionhandler$$stopExt = function(node, index)  {return function(e)  {
            var isEventValid;

            e = e || const$$WINDOW.event;

            if (const$$LEGACY_IE) {
                isEventValid = e.srcUrn === const$$CUSTOM_EVENT_TYPE && e.srcElement === node;
            } else {
                isEventValid = e.animationName === util$extensionhandler$$ANIMATION_ID && e.target === node;
            }
            // mark extension as processed via e._skip bitmask
            if (isEventValid) (e._skip = e._skip || {})[index] = true;
        }},
        util$extensionhandler$$ExtensionHandler = function(selector, condition, mixins, index)  {
            var eventHandlers = util$index$$default.keys(mixins).filter(function(prop)  {return !!util$extensionhandler$$reRemovableMethod.exec(prop)}),
                ctr = mixins.hasOwnProperty("constructor") && mixins.constructor,
                ext = function(node, mock)  {
                    var el = types$$$Element(node);

                    if (const$$LEGACY_IE) {
                        node.attachEvent("on" + util$extensionhandler$$ExtensionHandler.EVENT_TYPE, util$extensionhandler$$stopExt(node, index));
                    } else {
                        node.addEventListener(util$extensionhandler$$ExtensionHandler.EVENT_TYPE, util$extensionhandler$$stopExt(node, index), false);
                    }

                    if (mock === true || condition(el) !== false) {
                        util$index$$default.assign(el, mixins);
                        // invoke constructor if it exists
                        // make a safe call so live extensions can't break each other
                        if (ctr) util$index$$default.safeInvoke(ctr, el);
                        // remove event handlers from element's interface
                        if (mock !== true) eventHandlers.forEach(function(prop)  { delete el[prop] });
                    }
                };

            ext.accept = util$selectormatcher$$default(selector);

            return ext;
        };

    if (const$$LEGACY_IE) {
        util$extensionhandler$$ExtensionHandler.EVENT_TYPE = const$$CUSTOM_EVENT_TYPE;
    } else {
        util$extensionhandler$$ExtensionHandler.ANIMATION_ID = util$extensionhandler$$ANIMATION_ID;
        util$extensionhandler$$ExtensionHandler.EVENT_TYPE = const$$WEBKIT_PREFIX ? "webkitAnimationEnd" : "animationend";
    }

    util$extensionhandler$$ExtensionHandler.traverse = function(node, skip)  {return function(ext, index)  {
        // skip previously excluded or mismatched elements
        if (!skip[index] && ext.accept(node)) ext(node);
    }};

    var util$extensionhandler$$default = util$extensionhandler$$ExtensionHandler;

    // Inspired by trick discovered by Daniel Buchner:
    // https://github.com/csuwldcat/SelectorListener

    var dom$extend$$extensions = [],
        dom$extend$$returnTrue = function()  {return true},
        dom$extend$$returnFalse = function()  {return false},
        dom$extend$$readyCallback, dom$extend$$styles;

    if (const$$LEGACY_IE) {
        var dom$extend$$link = const$$DOCUMENT.querySelector("link[rel=htc]");

        if (dom$extend$$link) {
            dom$extend$$link = dom$extend$$link.href;
        } else {
            if ("console" in const$$WINDOW) {
                const$$WINDOW.console.log("WARNING: In order to use live extensions in IE < 10 you have to include extra files. See https://github.com/chemerisuk/better-dom#notes-about-old-ies for details.");
            }

            var dom$extend$$scripts = const$$DOCUMENT.scripts;
            // trying to guess HTC file location
            dom$extend$$link = dom$extend$$scripts[dom$extend$$scripts.length - 1].src.split("/");
            dom$extend$$link = "/" + dom$extend$$link.slice(3, dom$extend$$link.length - 1).concat("better-dom.htc").join("/");
        }

        dom$extend$$styles = {behavior: "url(" + dom$extend$$link + ") !important"};

        // append behavior for HTML element to apply several legacy IE-specific fixes
        dom$importstyles$$default("html", dom$extend$$styles);

        const$$DOCUMENT.attachEvent("on" + util$extensionhandler$$default.EVENT_TYPE, function()  {
            var e = const$$WINDOW.event;

            if (e.srcUrn === const$$CUSTOM_EVENT_TYPE) {
                dom$extend$$extensions.forEach(util$extensionhandler$$default.traverse(e.srcElement, e._skip || {}));
            }
        });
    } else {
        var dom$extend$$readyState = const$$DOCUMENT.readyState;
        // IE10 and lower don't handle "interactive" properly... use a weak inference to detect it
        // discovered by ChrisS here: http://bugs.jquery.com/ticket/12282#comment:15
        if (const$$DOCUMENT.attachEvent ? dom$extend$$readyState !== "complete" : dom$extend$$readyState === "loading") {
            dom$extend$$readyCallback = function()  {
                // MUST check for the readyCallback to avoid double
                // initialization on window.onload event
                if (dom$extend$$readyCallback) {
                    dom$extend$$extensions.forEach(function(ext)  { ext.start() });

                    dom$extend$$readyCallback = null;
                }
            };

            // use DOMContentLoaded to initialize any live extension
            // AFTER the document is completely parsed to avoid quirks
            const$$DOCUMENT.addEventListener("DOMContentLoaded", dom$extend$$readyCallback, false);
            // just in case the DOMContentLoaded event fails use onload
            const$$WINDOW.addEventListener("load", dom$extend$$readyCallback, false);
        }

        dom$importstyles$$default("@" + const$$WEBKIT_PREFIX + "keyframes " + util$extensionhandler$$default.ANIMATION_ID, "from {opacity:.99} to {opacity:1}");

        dom$extend$$styles = {
            "animation-duration": "1ms !important",
            "animation-name": util$extensionhandler$$default.ANIMATION_ID + " !important"
        };

        const$$DOCUMENT.addEventListener(util$extensionhandler$$default.EVENT_TYPE, function(e)  {
            if (e.animationName === util$extensionhandler$$default.ANIMATION_ID) {
                dom$extend$$extensions.forEach(util$extensionhandler$$default.traverse(e.target, e._skip || {}));
            }
        }, false);
    }

    types$$DOM.extend = function(selector, condition, mixins) {
        if (arguments.length === 2) {
            mixins = condition;
            condition = true;
        }

        if (typeof condition === "boolean") condition = condition ? dom$extend$$returnTrue : dom$extend$$returnFalse;
        if (typeof mixins === "function") mixins = {constructor: mixins};

        if (!mixins || typeof mixins !== "object" || typeof condition !== "function") throw new errors$$StaticMethodError("extend");

        if (selector === "*") {
            // extending element prototype
            util$index$$default.assign(types$$$Element.prototype, mixins);
        } else {
            var ext = util$extensionhandler$$default(selector, condition, mixins, dom$extend$$extensions.length);

            ext.start = function()  {
                // initialize extension manually to make sure that all elements
                // have appropriate methods before they are used in other DOM.extend.
                // Also fixes legacy IEs when the HTC behavior is already attached
                util$index$$default.each.call(const$$DOCUMENT.querySelectorAll(selector), ext);
                // MUST be after querySelectorAll because of legacy IEs quirks
                types$$DOM.importStyles(selector, dom$extend$$styles);
            };

            dom$extend$$extensions.push(ext);

            if (!dom$extend$$readyCallback) ext.start();
        }
    };

    var dom$extend$$default = dom$extend$$extensions;

    var dom$format$$reVar = /\{([\w\-]+)\}/g;

    types$$DOM.format = function(tmpl, varMap) {
        if (typeof tmpl !== "string") throw new errors$$StaticMethodError("format");

        if (!varMap || typeof varMap !== "object") varMap = {};

        return tmpl.replace(dom$format$$reVar, function(x, name)  {return name in varMap ? String(varMap[name]) : x});
    };

    types$$DOM.importScripts = function() {var urls = SLICE$0.call(arguments, 0);
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
                throw new errors$$StaticMethodError("importScripts");
            }
        };

        callback();
    };

    var dom$mock$$applyExtensions = function(node)  {
            dom$extend$$default.forEach(function(ext)  { if (ext.accept(node)) ext(node, true) });

            util$index$$default.each.call(node.children, dom$mock$$applyExtensions);
        },
        dom$mock$$makeMethod = function(all)  {return function(content, varMap) {
            if (!content) return new types$$$NullElement();

            var result = types$$DOM["create" + all](content, varMap);

            if (all) {
                result.forEach(function(el)  { dom$mock$$applyExtensions(el[0]) });
            } else {
                dom$mock$$applyExtensions(result[0]);
            }

            return result;
        }};

    types$$DOM.mock = dom$mock$$makeMethod("");

    types$$DOM.mockAll = dom$mock$$makeMethod("All");

    var element$children$$makeMethod = function(all)  {return function(selector) {
        if (all) {
            if (selector && typeof selector !== "string") throw new errors$$MethodError("children");
        } else {
            if (selector && typeof selector !== "number") throw new errors$$MethodError("child");
        }

        var node = this[0],
            matcher = util$selectormatcher$$default(selector),
            children = node.children;

        if (!const$$DOM2_EVENTS) {
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

    util$index$$default.assign(types$$$Element.prototype, {
        child: element$children$$makeMethod(false),

        children: element$children$$makeMethod(true)
    });

    util$index$$default.assign(types$$$NullElement.prototype, {
        child: function() {
            return new types$$$NullElement();
        },
        children: function() {
            return [];
        }
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

                    if (typeof token !== "string") throw new errors$$MethodError(methodName);

                    return strategy(this, token);
                };
            } else {
                return function() {var $D$5;var $D$6;
                    var tokens = arguments;

                    $D$5 = 0;$D$6 = tokens.length;for (var token ;$D$5 < $D$6;){token = (tokens[$D$5++]);
                        if (typeof token !== "string") throw new errors$$MethodError(methodName);

                        strategy(this, token);
                    };$D$5 = $D$6 = void 0;

                    return this;
                };
            }
        },
        element$classes$$methods = {
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
        };

    util$index$$default.assign(types$$$Element.prototype, element$classes$$methods);

    util$index$$default.keys(element$classes$$methods).forEach(function(methodName)  {
        types$$$NullElement.prototype[methodName] = function() {
            if (methodName === "hasClass" || methodName === "toggleClass") {
                return false;
            } else {
                return this;
            }
        };
    });

    types$$$Element.prototype.clone = function() {var deep = arguments[0];if(deep === void 0)deep = true;
        if (typeof deep !== "boolean") throw new errors$$MethodError("clone");

        var node = this[0], result;

        if (const$$DOM2_EVENTS) {
            result = new types$$$Element(node.cloneNode(deep));
        } else {
            result = types$$DOM.create(node.outerHTML);

            if (!deep) result.set("innerHTML", "");
        }

        return result;
    };

    types$$$NullElement.prototype.clone = function() {
        return new types$$$NullElement();
    };

    types$$$Element.prototype.contains = function(element) {
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

        throw new errors$$MethodError("contains");
    };

    types$$$NullElement.prototype.contains = function() {
        return false;
    };

    types$$$Element.prototype.css = function(name, value) {var this$0 = this;
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
            throw new errors$$MethodError("css");
        }

        return this;
    };

    types$$$NullElement.prototype.css = function(name) {
        if (arguments.length !== 1 || typeof name !== "string" && !util$index$$default.isArray(name)) {
            return this;
        }
    };

    // big part of code inspired by Sizzle:
    // https://github.com/jquery/sizzle/blob/master/sizzle.js

    var element$find$$rquick = const$$DOCUMENT.getElementsByClassName ? /^(?:(\w+)|\.([\w\-]+))$/ : /^(?:(\w+))$/,
        element$find$$rescape = /'|\\/g,
        element$find$$tmpId = "DOM" + Date.now(),
        element$find$$makeMethod = function(all)  {return function(selector) {
            if (typeof selector !== "string") throw new errors$$MethodError("find" + all);

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
                nid = element$find$$tmpId;
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

                try {
                    result = context["querySelector" + all](selector);
                } finally {
                    if (!old) node.removeAttribute("id");
                }
            }

            return all ? util$index$$default.map.call(result, types$$$Element) : types$$$Element(result);
        }};

    util$index$$default.assign(types$$$Element.prototype, {
        find: element$find$$makeMethod(""),

        findAll: element$find$$makeMethod("All")
    });

    util$index$$default.assign(types$$$NullElement.prototype, {
        find: function() {
            return new types$$$NullElement();
        },
        findAll: function() {
            return [];
        }
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

    if (!const$$DOM2_EVENTS) {
        // fix non-bubbling form events for IE8
        ["submit", "change", "reset"].forEach(function(name)  {
            util$eventhooks$$hooks[name] = function(handler)  { handler._type = const$$CUSTOM_EVENT_TYPE };
        });
    }

    var util$eventhooks$$default = util$eventhooks$$hooks;

    /*
     * Helper type to create an event handler
     */

    var util$eventhandler$$EventHandler = function(type, selector, callback, props, el, once)  {
            var node = el[0],
                hook = util$eventhooks$$default[type],
                matcher = util$selectormatcher$$default(selector, node),
                handler = function(e)  {
                    e = e || const$$WINDOW.event;
                    // early stop in case of default action
                    if (util$eventhandler$$EventHandler.skip === type) return;
                    // handle custom events in legacy IE
                    if (handler._type === const$$CUSTOM_EVENT_TYPE && e.srcUrn !== type) return;
                    // srcElement can be null in legacy IE when target is document
                    var target = e.target || e.srcElement || const$$DOCUMENT,
                        currentTarget = matcher ? matcher(target) : node,
                        eventArgs = e._args || [],
                        args = props;

                    // early stop for late binding or when target doesn't match selector
                    if (!currentTarget) return;

                    // off callback even if it throws an exception later
                    if (once) el.off(type, callback);

                    args = !args ? eventArgs : args.map(function(name)  {
                        if (typeof name === "number") return eventArgs[name - 1];

                        if (!const$$DOM2_EVENTS) {
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

                        return e[name];
                    });

                    // if props is not specified then prepend extra arguments
                    if (callback.apply(el, args) === false) {
                        // prevent default if handler returns false
                        if (const$$DOM2_EVENTS) {
                            e.preventDefault();
                        } else {
                            e.returnValue = false;
                        }
                    }
                };

            if (hook) handler = hook(handler, type) || handler;
            // handle custom events for IE8
            if (!const$$DOM2_EVENTS && !("on" + (handler._type || type) in node)) {
                handler._type = const$$CUSTOM_EVENT_TYPE;
            }

            handler.type = selector ? type + " " + selector : type;
            handler.callback = callback;

            return handler;
        };

    var util$eventhandler$$default = util$eventhandler$$EventHandler;

    types$$$Element.prototype.fire = function(type) {var args = SLICE$0.call(arguments, 1);
        var node = this[0],
            eventType = typeof type,
            handler = {},
            hook, e, canContinue;

        if (eventType === "string") {
            if (hook = util$eventhooks$$default[type]) {
                handler = hook(handler) || handler;
            }

            eventType = handler._type || type;
        } else {
            throw new errors$$MethodError("fire");
        }

        if (const$$DOM2_EVENTS) {
            e = const$$DOCUMENT.createEvent("HTMLEvents");
            e.initEvent(eventType, true, true);
            e._args = args;

            canContinue = node.dispatchEvent(e);
        } else {
            e = const$$DOCUMENT.createEventObject();
            e._args = args;
            // handle custom events for legacy IE
            if (!("on" + eventType in node)) eventType = const$$CUSTOM_EVENT_TYPE;
            // store original event type
            if (eventType === const$$CUSTOM_EVENT_TYPE) e.srcUrn = type;

            node.fireEvent("on" + eventType, e);

            canContinue = e.returnValue !== false;
        }

        // Call native method. IE<9 dies on focus/blur to hidden element
        if (canContinue && node[type] && (type !== "focus" && type !== "blur" || node.offsetWidth)) {
            // Prevent re-triggering of the same event
            util$eventhandler$$default.skip = type;

            node[type]();

            util$eventhandler$$default.skip = null;
        }

        return canContinue;
    };

    types$$$NullElement.prototype.fire = function() {
        return false;
    };

    var util$accessorhooks$$hooks = {get: {}, set: {}};

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
            node[const$$DOM2_EVENTS || node.type !== "textarea" ? "value" : "innerText"] = value;
        }
    };

    // some browsers don't recognize input[type=email] etc.
    util$accessorhooks$$hooks.get.type = function(node)  {return node.getAttribute("type") || node.type};

    // IE8 has innerText but not textContent
    if (!const$$DOM2_EVENTS) {
        util$accessorhooks$$hooks.get.textContent = function(node)  {return node.innerText};
        util$accessorhooks$$hooks.set.textContent = function(node, value)  { node.innerText = value };
    }

    var util$accessorhooks$$default = util$accessorhooks$$hooks;

    var element$get$$reDash = /[A-Z]/g,
        element$get$$getPrivateProperty = function(node, key)  {
            // convert from camel case to dash-separated value
            var value = node.getAttribute("data-" + key.replace(element$get$$reDash, function(l)  {return "-" + l.toLowerCase()}));

            if (value != null) {
                // try to recognize and parse  object notation syntax
                if (value[0] === "{" && value[value.length - 1] === "}") {
                    try {
                        value = JSON.parse(value);
                    } catch (err) { }
                }
            }

            return value;
        };

    types$$$Element.prototype.get = function(name) {var this$0 = this;
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
                    data = this._,
                    value;

                if (key in data) {
                    value = data[key];
                } else {
                    value = data[key] = element$get$$getPrivateProperty(node, key);
                }

                return value;
            }
        } else if (util$index$$default.isArray(name)) {
            return name.reduce(function(r, key)  { return (r[key] = this$0.get(key), r) }, {});
        } else {
            throw new errors$$MethodError("get");
        }
    };

    types$$$NullElement.prototype.get = function() {};

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
                throw new errors$$MethodError(methodName);
            }

            if (content && typeof content === "string") {
                node.insertAdjacentHTML(fasterMethodName, content);
            } else {
                if (content || !fasterMethodName) strategy(node, content);
            }

            return this;
        }},
        element$manipulation$$methods = {
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
        };

    util$index$$default.assign(types$$$Element.prototype, element$manipulation$$methods);

    util$index$$default.keys(element$manipulation$$methods).forEach(function(methodName)  {
        types$$$NullElement.prototype[methodName] = function() {
            return this;
        };
    });

    var util$selectorhooks$$hooks = {};

    util$selectorhooks$$hooks[":focus"] = function(node)  {return node === const$$DOCUMENT.activeElement};

    util$selectorhooks$$hooks[":hidden"] = function(node)  {
        if (node.getAttribute("aria-hidden") === "true") return true;

        var computed = util$index$$default.computeStyle(node);

        return computed.visibility === "hidden" ||
            computed.display === "none" || !const$$HTML.contains(node);
    };

    util$selectorhooks$$hooks[":visible"] = function(node)  {return !util$selectorhooks$$hooks[":hidden"](node)};

    var util$selectorhooks$$default = util$selectorhooks$$hooks;

    types$$$Element.prototype.matches = function(selector) {
        if (!selector || typeof selector !== "string") throw new errors$$MethodError("matches");

        var checker = util$selectorhooks$$default[selector] || util$selectormatcher$$default(selector);

        return !!checker(this[0], this);
    };

    types$$$NullElement.prototype.matches = function() {
        return false;
    };

    types$$$Element.prototype.off = function(type, callback) {
        if (typeof type !== "string") throw new errors$$MethodError("off");

        var node = this[0];

        this._._handlers = this._._handlers.filter(function(handler)  {
            if (type !== handler.type || callback && callback !== handler.callback) return true;

            type = handler._type || handler.type;

            if (const$$DOM2_EVENTS) {
                node.removeEventListener(type, handler, !!handler.capturing);
            } else {
                node.detachEvent("on" + type, handler);
            }
        });

        return this;
    };

    types$$$NullElement.prototype.off = function() {
        return this;
    };

    types$$$Element.prototype.offset = function() {
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
    };

    types$$$NullElement.prototype.offset = function() {
        return { top : 0, left : 0, right : 0, bottom : 0, width : 0, height : 0 };
    };

    var element$on$$makeMethod = function(method)  {return function(type, selector, props, callback) {var this$0 = this;
            if (typeof type === "string") {
                if (typeof props === "function") {
                    callback = props;

                    if (typeof selector === "string") {
                        props = null;
                    } else {
                        props = selector;
                        selector = null;
                    }
                }

                if (typeof selector === "function") {
                    callback = selector;
                    selector = null;
                    props = null;
                }

                if (typeof callback !== "function") {
                    throw new errors$$MethodError(method);
                }

                var node = this[0],
                    handler = util$eventhandler$$default(type, selector, callback, props, this, method === "once");

                if (handler) {
                    if (const$$DOM2_EVENTS) {
                        node.addEventListener(handler._type || type, handler, !!handler.capturing);
                    } else {
                        node.attachEvent("on" + (handler._type || type), handler);
                    }
                    // store event entry
                    this._._handlers.push(handler);
                }
            } else if (typeof type === "object") {
                if (util$index$$default.isArray(type)) {
                    type.forEach(function(name)  { this$0[method](name, selector, props, callback) });
                } else {
                    util$index$$default.keys(type).forEach(function(name)  { this$0[method](name, type[name]) });
                }
            } else {
                throw new errors$$MethodError(method);
            }

            return this;
        }},
        element$on$$methods = {
            on: element$on$$makeMethod("on"),

            once: element$on$$makeMethod("once")
        };

    util$index$$default.assign(types$$$Element.prototype, element$on$$methods);

    util$index$$default.keys(element$on$$methods).forEach(function(methodName)  {
        types$$$NullElement.prototype[methodName] = function() {
            return this;
        };
    });

    types$$$Element.prototype.set = function(name, value) {var this$0 = this;
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

                // always trigger reflow manually for IE8 and legacy Android
                if (!const$$DOM2_EVENTS || const$$LEGACY_ANDROID) node.className = node.className;
            }
        } else if (util$index$$default.isArray(name)) {
            name.forEach(function(key)  { this$0.set(key, value) });
        } else if (typeof name === "object") {
            util$index$$default.keys(name).forEach(function(key)  { this$0.set(key, name[key]) });
        } else {
            throw new errors$$MethodError("set");
        }

        if (watchers && oldValue !== value) {
            watchers.forEach(function(w)  {
                util$index$$default.safeInvoke(w, this$0, value, oldValue);
            });
        }

        return this;
    };

    types$$$NullElement.prototype.set = function() {
        return this;
    };

    var element$traversing$$makeMethod = function(methodName, propertyName, all)  {return function(selector) {
            if (selector && typeof selector !== "string") throw new errors$$MethodError(methodName);

            var matcher = util$selectormatcher$$default(selector),
                nodes = all ? [] : null,
                it = this[0];

            if (it && methodName !== "closest") it = it[propertyName];

            for (; it; it = it[propertyName]) {
                if (it.nodeType === 1 && (!matcher || matcher(it))) {
                    if (!all) break;

                    nodes.push(it);
                }
            }

            return all ? util$index$$default.map.call(nodes, types$$$Element) : types$$$Element(it);
        }},
        element$traversing$$methods = {
            next: element$traversing$$makeMethod("next", "nextSibling"),

            prev: element$traversing$$makeMethod("prev", "previousSibling"),

            nextAll: element$traversing$$makeMethod("nextAll", "nextSibling", true),

            prevAll: element$traversing$$makeMethod("prevAll", "previousSibling", true),

            closest: element$traversing$$makeMethod("closest", "parentNode")
        };

    util$index$$default.assign(types$$$Element.prototype, element$traversing$$methods);

    util$index$$default.keys(element$traversing$$methods).forEach(function(methodName)  {
        types$$$NullElement.prototype[methodName] = function() {
            if (methodName.slice(-3) === "All") {
                return [];
            } else {
                return new types$$$NullElement();
            }
        };
    });

    // Legacy Android is too slow and has a lot of bugs in the CSS animations
    // implementation, so skip any animations for it
    var element$visibility$$ANIMATIONS_ENABLED = !const$$LEGACY_ANDROID && !const$$LEGACY_IE,
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
                throw new errors$$MethodError(name);
            }

            var node = this[0],
                style = node.style,
                computed = util$index$$default.computeStyle(node),
                visibility = computed.visibility,
                displayValue = computed.display,
                hiding = condition,
                done = function()  {
                    // Check equality of the flag and aria-hidden to recognize
                    // cases when an animation was toggled in the intermediate
                    // state. Don't need to proceed in such situation
                    if (String(hiding) === node.getAttribute("aria-hidden")) {
                        // remove element from the flow when animation is done
                        if (hiding && animationName) {
                            if (animatable) {
                                style.visibility = "hidden";
                            } else {
                                style.display = "none";
                            }
                        }

                        if (callback) callback.call(this$0);
                    }
                },
                animatable;

            if (typeof hiding !== "boolean") {
                hiding = displayValue !== "none" && visibility !== "hidden" &&
                    node.getAttribute("aria-hidden") !== "true";
            }

            if (element$visibility$$ANIMATIONS_ENABLED) {
                // Use offsetWidth to trigger reflow of the element.
                // Fixes animation of an element inserted into the DOM
                //
                // Opera 12 has an issue with animations as well,
                // so need to trigger reflow manually for it
                //
                // Thanks for the idea from Jonathan Snook's plugin:
                // https://github.com/snookca/prepareTransition

                if (!hiding) visibility = node.offsetWidth;

                if (animationName) {
                    animatable = element$visibility$$scheduleAnimation(node, style, computed, animationName, hiding, done);
                } else {
                    animatable = element$visibility$$scheduleTransition(node, style, computed, hiding, done);
                }
            }

            // handle old browsers or cases when there no animation
            if (hiding) {
                if (displayValue !== "none" && !animatable) {
                    this._._display = displayValue;
                    // we'll hide element later in the done call
                }
            } else {
                if (displayValue === "none" && !animatable) {
                    // restore display property value
                    style.display = this._._display || "inherit";
                }
            }

            // update element visibility value
            // for CSS3 animation element should always be visible
            // use value "inherit" to respect parent container visibility
            style.visibility = hiding && !animationName ? "hidden" : "inherit";
            // trigger CSS3 transition if it exists
            this.set("aria-hidden", String(hiding));
            // must be AFTER changing the aria-hidden attribute
            if (!animatable) done();

            return this;
        }},
        element$visibility$$methods = {
            show: element$visibility$$makeMethod("show", false),

            hide: element$visibility$$makeMethod("hide", true),

            toggle: element$visibility$$makeMethod("toggle")
        };

    util$index$$default.assign(types$$$Element.prototype, element$visibility$$methods);

    util$index$$default.keys(element$visibility$$methods).forEach(function(methodName)  {
        types$$$NullElement.prototype[methodName] = function() {
            return this;
        };
    });

    var element$watch$$methods = {
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
        };

    util$index$$default.assign(types$$$Element.prototype, element$watch$$methods);

    util$index$$default.keys(element$watch$$methods).forEach(function(methodName)  {
        types$$$NullElement.prototype[methodName] = function() {
            return this;
        };
    });
})();