/**
 * @file better-dom.js
 * @version 1.6.4 2013-12-25T18:37:40
 * @overview Live extension playground
 * @copyright Maksim Chemerisuk 2013
 * @license MIT
 * @see https://github.com/chemerisuk/better-dom
 */
;(function e(t,n,r){"use strict";function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var _ = require("./utils"),
    $Element = require("./element"),
    DOM = require("./dom"),
    reSingleTag = /^\w+$/,
    sandbox = document.createElement("div");

/**
 * Create a $Element instance
 * @memberOf DOM
 * @param  {Mixed}  value   HTMLString, EmmetString or native element
 * @param  {Object} [vars]  key/value map of variables in emmet template
 * @return {$Element} element
 */
DOM.create = function(value, vars) {
    if (value.nodeType === 1) return $Element(value);

    if (typeof value !== "string") throw _.makeError("create", this);

    var node, multiple;

    if (reSingleTag.test(value)) {
        value = document.createElement(value);
    } else {
        sandbox.innerHTML = DOM.template(value, vars);

        for (value = []; node = sandbox.firstChild; sandbox.removeChild(node)) {
            if (node.nodeType === 1) value.push(node);
        }

        multiple = value.length !== 1;

        if (!multiple) value = value[0];
    }

    return new $Element(value, multiple);
};

},{"./dom":6,"./element":15,"./utils":41}],2:[function(require,module,exports){
// Inspired by trick discovered by Daniel Buchner:
// https://github.com/csuwldcat/SelectorListener

var _ = require("./utils"),
    $Element = require("./element"),
    DOM = require("./dom"),
    SelectorMatcher = require("./selectormatcher"),
    features = require("./features"),
    reEventHandler = /^on[A-Z]/,
    extensions = [],
    makeExtHandler = function(e, node) {
        var type = e.type,
            el = $Element(node),
            accepted = e._done || {},
            delay = 0;

        return function(ext, index) {
            // skip previously excluded or mismatched elements
            if (!accepted[index] && ext.accept(node)) {
                if (features.CSS3_ANIMATIONS) {
                    node.addEventListener(type, ext.stop, false);
                } else {
                    node.attachEvent("on" + type, ext.stop);
                }
                // IMPORTANT: delay helps to use right extension order
                setTimeout(function() { ext(el) }, delay++);
            }
        };
    },
    animId, link, styles;

if (features.CSS3_ANIMATIONS) {
    animId = "DOM" + new Date().getTime();

    DOM.importStyles("@" + features.WEBKIT_PREFIX + "keyframes " + animId, "1% {opacity: .99}");

    styles = {
        "animation-duration": "1ms !important",
        "animation-name": animId + " !important"
    };

    document.addEventListener(features.WEBKIT_PREFIX ? "webkitAnimationStart" : "animationstart", function(e) {
        if (e.animationName === animId) {
            _.forEach(extensions, makeExtHandler(e, e.target));
        }
    }, false);
} else {
    link = document.querySelector("link[rel=htc]");

    if (!link) throw "You forgot to include <link rel='htc'> for IE < 10";

    styles = {behavior: "url(" + link.href + ") !important"};

    document.attachEvent("ondataavailable", function() {
        var e = window.event;

        if (e.srcUrn === "dataavailable") {
            _.forEach(extensions, makeExtHandler(e, e.srcElement));
        }
    });
}

/**
 * Define a live extension
 * @memberOf DOM
 * @param  {String}          selector extension css selector
 * @param  {Object|Function} mixins   extension mixins or just a constructor function
 * @see https://github.com/chemerisuk/better-dom/wiki/Live-extensions
 */
DOM.extend = function(selector, mixins) {
    if (typeof mixins === "function") mixins = {constructor: mixins};

    if (!mixins || typeof mixins !== "object") throw _.makeError("extend", this);

    if (selector === "*") {
        // extending element prototype
        _.extend($Element.prototype, mixins);
    } else {
        var eventHandlers = _.filter(Object.keys(mixins), function(prop) { return !!reEventHandler.exec(prop) }),
            ext = function(el, mock) {
                _.extend(el, mixins);

                if (ctr) ctr.call(el);
                // cleanup event handlers
                if (!mock) _.forEach(eventHandlers, function(prop) { delete el[prop] });
            },
            index = extensions.push(ext) - 1,
            ctr = mixins.hasOwnProperty("constructor") && mixins.constructor;

        if (ctr) delete mixins.constructor;

        ext.accept = SelectorMatcher(selector);
        ext.stop = function(e) {
            e = e || window.event;

            if (e.animationName === animId || e.srcUrn === "dataavailable")  {
                // mark extension as processed via _done bitmask
                (e._done = e._done || {})[index] = true;
            }
        };

        DOM.ready(function() {
            // initialize extension manually to make sure that all elements
            // have appropriate methods before they are used in other DOM.ready.
            // Also fixes legacy IE in case when the behaviour is already attached
            DOM.findAll(selector).legacy(function(node) {
                var e;

                if (features.CSS3_ANIMATIONS) {
                    e = document.createEvent("HTMLEvents");
                    e.initEvent(features.WEBKIT_PREFIX ? "webkitAnimationStart" : "animationstart", true, true);
                    e.animationName = animId;

                    node.dispatchEvent(e);
                } else {
                    e = document.createEventObject();
                    e.srcUrn = "dataavailable";
                    node.fireEvent("ondataavailable", e);
                }
            });
            // make sure that any extension is initialized after DOM.ready
            // MUST be after DOM.findAll because of legacy IE behavior
            DOM.importStyles(selector, styles, true);
        });
    }
};

module.exports = extensions;

},{"./dom":6,"./element":15,"./features":28,"./selectormatcher":40,"./utils":41}],3:[function(require,module,exports){
var _ = require("./utils"),
    DOM = require("./dom");

/**
 * Import external scripts on the page and call optional callback when it will be done
 * @memberOf DOM
 * @param {...String} urls       script file urls
 * @param {Function}  [callback] callback that is triggered when all scripts are loaded
 */
DOM.importScripts = function() {
    var args = _.slice(arguments),
        context = document.scripts[0],
        callback = function() {
            var arg = args.shift(),
                argType = typeof arg,
                script;

            if (argType === "string") {
                script = document.createElement("script");
                script.src = arg;
                script.onload = callback;
                script.async = true;
                context.parentNode.insertBefore(script, context);
            } else if (argType === "function") {
                arg();
            } else if (arg) {
                throw _.makeError("importScripts", DOM);
            }
        };

    callback();
};

},{"./dom":6,"./utils":41}],4:[function(require,module,exports){
var _ = require("./utils"),
    DOM = require("./dom"),
    rparam = /\$\{([a-z\-]+)\}/g,
    toContentAttr = function(term, attr) { return "\"attr(data-" + attr + ")\"" };

/**
 * Import global i18n string(s)
 * @memberOf DOM
 * @param {String}         lang    target language
 * @param {String|Object}  key     english string to localize or key/value object
 * @param {String}         value   localized string
 * @see https://github.com/chemerisuk/better-dom/wiki/Localization
 */
DOM.importStrings = function(lang, key, value) {
    var keyType = typeof key,
        selector, content;

    if (keyType === "string") {
        selector = "[data-i18n=\"" + key + "\"]";
        content = "content:\"" + value.replace(rparam, toContentAttr) + "\"";
        // empty lang is for internal use only
        if (lang) selector += ":lang(" + lang + ")";

        DOM.importStyles(selector + ":before", content, !lang);
    } else if (keyType === "object") {
        _.forOwn(key, function(value, key) { DOM.importStrings(lang, key, value) });
    } else {
        throw _.makeError("importStrings", this);
    }
};

// by default just show data-i18n string
DOM.importStyles("[data-i18n]:before", "content:attr(data-i18n)");

},{"./dom":6,"./utils":41}],5:[function(require,module,exports){
var _ = require("./utils"),
    $Element = require("./element"),
    DOM = require("./dom"),
    features = require("./features"),
    styleNode = document.documentElement.firstChild.appendChild(document.createElement("style")),
    styleSheet = styleNode.sheet || styleNode.styleSheet,
    styleRules = styleSheet.cssRules || styleSheet.rules,
    // normalize pseudoelement selectors or quotes
    norm = features.DOM2_EVENTS ? ["::", ":"] : ["\"", "'"],
    args = DOM.importStyles.args;

/**
 * Append global css styles
 * @memberOf DOM
 * @param {String}         selector  css selector
 * @param {String|Object}  cssText   css rules
 */
DOM.importStyles = function(selector, cssText, /*INTENAL*/unique) {
    if (cssText && typeof cssText === "object") {
        var styleObj = {};
        // make a temporary element and populate style properties
        new $Element({style: styleObj}).style(cssText);

        cssText = [];

        _.forOwn(styleObj, function(styles, selector) {
            cssText.push(selector + ":" + styles);
        });

        cssText = cssText.join(";");
    }

    if (typeof selector !== "string" || typeof cssText !== "string") {
        throw _.makeError("importStyles", this);
    }

    // check if the rule already exists
    if (!unique || !_.some(styleRules, function(rule) {
        return selector === (rule.selectorText || "").split(norm[0]).join(norm[1]);
    })) {
        if (styleSheet.cssRules) {
            styleSheet.insertRule(selector + " {" + cssText + "}", styleRules.length);
        } else {
            // ie doesn't support multiple selectors in addRule
            _.forEach(selector.split(","), function(selector) {
                styleSheet.addRule(selector, cssText);
            });
        }
    }
};

// populate existing calls
_.forEach(args, function(args) { DOM.importStyles.apply(DOM, args) });

},{"./dom":6,"./element":15,"./features":28,"./utils":41}],6:[function(require,module,exports){
var $Node = require("./node"),
    DOM = new $Node(document);

DOM.version = "1.6.4";

DOM.importStyles = function() { DOM.importStyles.args.push(arguments) };
DOM.importStyles.args = [];

/**
 * Global object to access DOM
 * @namespace DOM
 * @extends $Node
 */
module.exports = window.DOM = DOM;

},{"./node":35}],7:[function(require,module,exports){
var _ = require("./utils"),
    $Element = require("./element"),
    DOM = require("./dom"),
    extensions = require("./dom.extend");

/**
 * Return {@link $Element} initialized with all existing live extensions.
 * Also exposes private event handler functions that aren't usually presented
 * @memberOf DOM
 * @param  {Mixed} [content] HTMLString, EmmetString
 * @return {$Element} mocked instance
 */
DOM.mock = function(content) {
    var el = content ? DOM.create(content) : new $Element(),
        applyWatchers = function(el) {
            _.forEach(extensions, function(ext) { if (ext.accept(el._node)) ext(el, true) });

            el.children().each(applyWatchers);
        };

    if (content) applyWatchers(el);

    return el;
};

},{"./dom":6,"./dom.extend":2,"./element":15,"./utils":41}],8:[function(require,module,exports){
var _ = require("./utils"),
    DOM = require("./dom"),
    features = require("./features"),
    readyCallbacks = [],
    readyState = document.readyState;

function pageLoaded() {
    // safely trigger callbacks
    _.forEach(readyCallbacks, setTimeout);
    // cleanup
    readyCallbacks = null;
}

// Catch cases where ready is called after the browser event has already occurred.
// IE10 and lower don't handle "interactive" properly... use a weak inference to detect it
// discovered by ChrisS here: http://bugs.jquery.com/ticket/12282#comment:15
if (document.attachEvent ? readyState === "complete" : readyState !== "loading") {
    pageLoaded();
} else {
    if (features.DOM2_EVENTS) {
        window.addEventListener("load", pageLoaded, false);
        document.addEventListener("DOMContentLoaded", pageLoaded, false);
    } else {
        window.attachEvent("onload", pageLoaded);
        document.attachEvent("ondataavailable", function() {
            if (window.event.srcUrn === "DOMContentLoaded") {
                pageLoaded();
            }
        });
    }
}

/**
 * Execute callback when DOM is ready
 * @memberOf DOM
 * @param {Function} callback event listener
 */
DOM.ready = function(callback) {
    if (typeof callback !== "function") throw _.makeError("ready", this);

    if (readyCallbacks) {
        readyCallbacks.push(callback);
    } else {
        setTimeout(callback, 0);
    }
};

},{"./dom":6,"./features":28,"./utils":41}],9:[function(require,module,exports){
var _ = require("./utils"),
    DOM = require("./dom"),
    // operator type / priority object
    operators = {"(": 1,")": 2,"^": 3,">": 4,"+": 4,"*": 5,"}": 5,"{": 6,"]": 5,"[": 6,".": 7,"#": 8},
    reTextTag = /<\?>|<\/\?>/g,
    reAttr = /([\w\-]+)(?:=((?:"((?:\\.|[^"])*)")|(?:'((?:\\.|[^'])*)')|([^\s\]]+)))?/g,
    reIndex = /(\$+)(?:@(-)?(\d+)?)?/g,
    reVar = /\$\{(\w+)\}/g,
    reHtml = /^[\s<]/,
    cache = {},
    normalizeAttrs = function(term, name, value, a, b, simple) {
        // always wrap attribute values with quotes if they don't exist
        return name + "=" + (simple || !value ? "\"" + (value || "") + "\"" : value);
    },
    injectTerm = function(term, first) {
        return function(el) {
            var index = first ? el.indexOf(">") : el.lastIndexOf("<");
            // inject term into the html string
            return el.substr(0, index) + term + el.substr(index);
        };
    },
    makeTerm = function(tag) {
        var result = cache[tag];

        if (!result) result = cache[tag] = "<" + tag + "></" + tag + ">";

        return [result];
    },
    makeIndexedTerm = function(term) {
        return function(_, i, arr) {
            return term.replace(reIndex, function(expr, fmt, sign, base) {
                var index = (sign ? arr.length - i - 1 : i) + (base ? +base : 1);
                // make zero-padding index string
                return (fmt + index).slice(-fmt.length).split("$").join("0");
            });
        };
    },
    toString = function(term) {
        return typeof term === "string" ? term : term.join("");
    };

// populate empty tags
_.forEach("area base br col hr img input link meta param command keygen source".split(" "), function(tag) {
    cache[tag] = "<" + tag + ">";
});

/**
 * Parse emmet-like template to a HTML string
 * @memberOf DOM
 * @param  {String} template emmet-like expression
 * @param  {Object} [vars] key/value map of variables
 * @return {String} HTML string
 * @see https://github.com/chemerisuk/better-dom/wiki/Microtemplating
 * @see http://docs.emmet.io/cheat-sheet/
 */
DOM.template = function(template, vars) {
    if (typeof template !== "string") throw _.makeError("template", this);
    // handle vars
    if (vars) template = template.replace(reVar, function(x, name) { return vars[name] || x });

    var stack = [],
        output = [],
        term = "",
        i, n, str, priority, skip, node;

    if (template in cache) return cache[template];

    if (!template || reHtml.exec(template)) return template;

    // parse expression into RPN

    for (i = 0, n = template.length; i < n; ++i) {
        str = template[i];
        // concat .c1.c2 into single space separated class string
        if (str === "." && stack[0] === ".") str = " ";

        priority = operators[str];

        if (priority && (!skip || skip === str)) {
            // append empty tag for text nodes or put missing '>' operator into the stack
            if (str === "{") {
                if (term) {
                    stack.unshift(">");
                } else {
                    term = "?";
                }
            }
            // remove redundat ^ operators from the stack when more than one exists
            if (str === "^" && stack[0] === "^") stack.shift();

            if (term) {
                output.push(term);
                term = "";
            }

            if (str !== "(") {
                while (operators[stack[0]] > priority) {
                    output.push(stack.shift());
                    // for ^ operator stop shifting when the first > is found
                    if (str === "^" && output[output.length - 1] === ">") break;
                }
            }

            if (str === ")") {
                stack.shift(); // remove "(" symbol from stack
            } else if (!skip) {
                stack.unshift(str);

                if (str === "[") skip = "]";
                if (str === "{") skip = "}";
            } else {
                skip = false;
            }
        } else {
            term += str;
        }
    }

    if (term) stack.unshift(term);

    output.push.apply(output, stack);

    // transform RPN into html nodes

    stack = [];

    for (i = 0, n = output.length; i < n; ++i) {
        str = output[i];

        if (str in operators) {
            term = stack.shift();
            node = stack.shift() || "?";

            if (typeof node === "string") node = makeTerm(node);

            switch(str) {
            case ".":
                term = injectTerm(" class=\"" + term + "\"", true);
                break;

            case "#":
                term = injectTerm(" id=\"" + term + "\"", true);
                break;

            case "[":
                term = injectTerm(" " + term.replace(reAttr, normalizeAttrs), true);
                break;

            case "{":
                term = injectTerm(term);
                break;

            case "*":
                node = _.map(Array(+term), makeIndexedTerm(toString(node)));
                break;

            default:
                if (typeof term === "string") term = makeTerm(term)[0];

                term = toString(term);

                if (str === ">") {
                    term = injectTerm(term);
                } else {
                    node.push(term);
                }
            }

            str = typeof term === "function" ? _.map(node, term) : node;
        }

        stack.unshift(str);
    }

    return cache[template] = toString(stack[0]).replace(reTextTag, "");
};

},{"./dom":6,"./utils":41}],10:[function(require,module,exports){
var _ = require("./utils"),
    $Element = require("./element"),
    rclass = /[\n\t\r]/g;

function makeClassesMethod(nativeStrategyName, strategy) {
    var methodName = nativeStrategyName === "contains" ? "hasClass" : nativeStrategyName + "Class",
        processClasses = function(el) { _.forEach(this, strategy, el) }; /* this = arguments */

    if (document.documentElement.classList) {
        strategy = function(className) {
            return this._node.classList[nativeStrategyName](className);
        };
    }

    if (methodName === "hasClass") {
        return function() { if (this._node) return _.every(arguments, strategy, this) };
    } else {
        return function() { return _.forEach(this, processClasses, arguments) };
    }
}

/**
 * Check if element contains class name(s)
 * @param  {...String} classNames class name(s)
 * @return {Boolean}   true if the element contains all classes
 * @function
 */
$Element.prototype.hasClass = makeClassesMethod("contains", function(className) {
    return (" " + this._node.className + " ").replace(rclass, " ").indexOf(" " + className + " ") >= 0;
});

/**
 * Add class(es) to element
 * @param  {...String} classNames class name(s)
 * @return {$Element}
 * @function
 */
$Element.prototype.addClass = makeClassesMethod("add", function(className) {
    if (!this.hasClass(className)) this._node.className += " " + className;
});

/**
 * Remove class(es) from element
 * @param  {...String} classNames class name(s)
 * @return {$Element}
 * @function
 */
$Element.prototype.removeClass = makeClassesMethod("remove", function(className) {
    className = (" " + this._node.className + " ").replace(rclass, " ").replace(" " + className + " ", " ");

    this._node.className = className.trim();
});

/**
 * Toggle class(es) on element
 * @param  {...String}  classNames class name(s)
 * @return {$Element}
 * @function
 */
$Element.prototype.toggleClass = makeClassesMethod("toggle", function(className) {
    var oldClassName = this._node.className;

    this.addClass(className);

    if (oldClassName === this._node.className) this.removeClass(className);
});

},{"./element":15,"./utils":41}],11:[function(require,module,exports){
var _ = require("./utils"),
    $Element = require("./element"),
    features = require("./features");

/**
 * Clone element
 * @param {Boolean} [deep=true] true if all children should also be cloned, or false otherwise
 * @return {$Element} clone of current element
 */
$Element.prototype.clone = function(deep) {
    if (!arguments.length) deep = true;

    if (typeof deep !== "boolean") throw _.makeError("clone", this);

    var node = this._node;

    if (node) {
        if (features.DOM2_EVENTS) {
            node = node.cloneNode(deep);
        } else {
            node = document.createElement("div");
            node.innerHTML = this._node.outerHTML;
            node = node.firstChild;

            if (!deep) node.innerHTML = "";
        }
    }

    return new $Element(node);
};

},{"./element":15,"./features":28,"./utils":41}],12:[function(require,module,exports){
var features = require("./features"),
    hooks = {};

hooks.type = function(node) {
    // some browsers don't recognize input[type=email] etc.
    return node.getAttribute("type") || node.type;
};

if (!features.DOM2_EVENTS) {
    hooks.textContent = function(node) { return node.innerText };
}

module.exports = hooks;

},{"./features":28}],13:[function(require,module,exports){
var _ = require("./utils"),
    $Element = require("./element"),
    hooks = require("./element.get.hooks");

/**
 * Get property or attribute value by name
 * @param  {String} [name] property/attribute name
 * @return {String} property/attribute value
 * @see https://github.com/chemerisuk/better-dom/wiki/Getter-and-setter
 */
$Element.prototype.get = function(name) {
    var node = this._node,
        hook = hooks[name];

    if (!node) return;

    if (name === undefined) {
        if (node.tagName === "OPTION") {
            name = node.hasAttribute("value") ? "value" : "text";
        } else if (node.tagName === "SELECT") {
            return ~node.selectedIndex ? node.options[node.selectedIndex].value : "";
        } else {
            name = node.type && "value" in node ? "value" : "innerHTML";
        }
    } else if (typeof name !== "string") {
        throw _.makeError("get", this);
    }

    return hook ? hook(node, name) : (name in node ? node[name] : node.getAttribute(name));
};

},{"./element":15,"./element.get.hooks":12,"./utils":41}],14:[function(require,module,exports){
var _ = require("./utils"),
    $Element = require("./element");

/**
 * Get/set localized value
 * @param  {String} [value]  resource string key
 * @param  {Object} [vars]   resource string variables
 * @return {String|$Element}
 */
$Element.prototype.i18n = function(value, vars) {
    var len = arguments.length;

    if (!len) return this.get("data-i18n");

    if (len > 2 || value && typeof value !== "string" || vars && typeof vars !== "object") throw _.makeError("i18n", this);

    // localized srings with variables require different css
    if (vars) DOM.importStrings("", value, value);
    // cleanup existing content
    this.set("");
    // process variables
    _.forOwn(_.extend({i18n: value}, vars), function(value, key) {
        this.set("data-" + key, value);
    }, this);

    // IMPORTANT: set empty value twice to fix IE8 quirks
    return this.set("");
};

},{"./element":15,"./utils":41}],15:[function(require,module,exports){
var _ = require("./utils"),
    $Node = require("./node");

/**
 * Used to represent a DOM element or collection
 * @name $Element
 * @extends $Node
 * @constructor
 * @private
 */
function $Element(element, collection) {
    if (element && element.__dom__) return element.__dom__;

    if (!(this instanceof $Element)) return new $Element(element, collection);

    if (element && collection === true) {
        Array.prototype.push.apply(this, _.map(element, $Element));
    } else {
        $Node.call(this, element);
    }
}

$Element.prototype = new $Node();

module.exports = $Element;

},{"./node":35,"./utils":41}],16:[function(require,module,exports){
var _ = require("./utils"),
    $Element = require("./element"),
    features = require("./features");

function makeManipulationMethod(methodName, fasterMethodName, standalone, strategy) {
    return function() {
        var args = arguments;

        return this.legacy(function(node, el, index, ref) {
            if (!(standalone || node.parentNode && node.parentNode.nodeType === 1)) return;

            var html = "", value;

            _.forEach(args, function(arg) {
                if (typeof arg === "function") arg = arg(el, index, ref);

                if (typeof arg === "string") {
                    html += DOM.template(arg).trim();
                } else if (arg instanceof $Element) {
                    if (html) {
                        html = _.parseFragment(html);

                        if (value) {
                            value.appendChild(html);
                        } else {
                            value = html;
                        }

                        html = "";
                    }

                    if (!value) value = document.createDocumentFragment();
                    // populate fragment
                    arg.legacy(function(node) { value.appendChild(node) });
                } else {
                    throw _.makeError(methodName, el);
                }
            });

            // always use _parseFragment because of HTML5 and NoScope bugs in legacy IE
            if (!(fasterMethodName && features.CSS3_ANIMATIONS) && html) value = _.parseFragment(html);

            if (!fasterMethodName || value) {
                strategy(node, value);
            } else if (html) {
                node.insertAdjacentHTML(fasterMethodName, html);
            }
        });
    };
}

/**
 * Insert html string or $Element after the current
 * @param {...Mixed} contents HTMLString, EmmetString, $Element or functor that returns content
 * @return {$Element}
 * @function
 */
$Element.prototype.after = makeManipulationMethod("after", "afterend", false, function(node, relatedNode) {
    node.parentNode.insertBefore(relatedNode, node.nextSibling);
});

/**
 * Insert html string or $Element before the current
 * @param {...Mixed} contents HTMLString, EmmetString, $Element or functor that returns content
 * @return {$Element}
 * @function
 */
$Element.prototype.before = makeManipulationMethod("before", "beforebegin", false, function(node, relatedNode) {
    node.parentNode.insertBefore(relatedNode, node);
});

/**
 * Prepend html string or $Element to the current
 * @param {...Mixed} contents HTMLString, EmmetString, $Element or functor that returns content
 * @return {$Element}
 * @function
 */
$Element.prototype.prepend = makeManipulationMethod("prepend", "afterbegin", true, function(node, relatedNode) {
    node.insertBefore(relatedNode, node.firstChild);
});

/**
 * Append html string or $Element to the current
 * @param {...Mixed} contents HTMLString, EmmetString, $Element or functor that returns content
 * @return {$Element}
 * @function
 */
$Element.prototype.append = makeManipulationMethod("append", "beforeend", true, function(node, relatedNode) {
    node.appendChild(relatedNode);
});

/**
 * Replace current element with html string or $Element
 * @param {Mixed} content HTMLString, EmmetString, $Element or functor that returns content
 * @return {$Element}
 * @function
 */
$Element.prototype.replace = makeManipulationMethod("replace", "", false, function(node, relatedNode) {
    node.parentNode.replaceChild(relatedNode, node);
});

/**
 * Remove current element from DOM
 * @return {$Element}
 * @function
 */
$Element.prototype.remove = makeManipulationMethod("remove", "", false, function(node) {
    node.parentNode.removeChild(node);
});

},{"./element":15,"./features":28,"./utils":41}],17:[function(require,module,exports){
var _ = require("./utils"),
    docEl = document.documentElement,
    hooks = {};

hooks[":focus"] = function(node) { return node === document.activeElement };

hooks[":hidden"] = function(node) {
    return node.getAttribute("aria-hidden") === "true" ||
        _.getComputedStyle(node).display === "none" || !docEl.contains(node);
};

hooks[":visible"] = function(node) { return !hooks[":hidden"](node) };

module.exports = hooks;

},{"./utils":41}],18:[function(require,module,exports){
var _ = require("./utils"),
    $Element = require("./element"),
    SelectorMatcher = require("./selectormatcher"),
    hooks = require("./element.matches.hooks");

/**
 * Check if the element matches selector
 * @param  {String} selector css selector
 * @return {$Element}
 */
$Element.prototype.matches = function(selector, deep) {
    if (!selector || typeof selector !== "string" || deep !== undefined && typeof deep !== "boolean") {
        throw _.makeError("matches", this);
    }

    var node = this._node,
        checker = hooks[selector] || SelectorMatcher(selector);

    while (node && node !== document) {
        if (checker(node)) return true;

        node = deep ? node.parentNode : null;
    }

    return false;
};

},{"./element":15,"./element.matches.hooks":17,"./selectormatcher":40,"./utils":41}],19:[function(require,module,exports){
var $Element = require("./element"),
    documentElement = document.documentElement;
/**
 * Calculates offset of the current element
 * @return object with left, top, bottom, right, width and height properties
 */
$Element.prototype.offset = function() {
    if (this._node) {
        var boundingRect = this._node.getBoundingClientRect(),
            clientTop = documentElement.clientTop,
            clientLeft = documentElement.clientLeft,
            scrollTop = window.pageYOffset || documentElement.scrollTop,
            scrollLeft = window.pageXOffset || documentElement.scrollLeft;

        return {
            top: boundingRect.top + scrollTop - clientTop,
            left: boundingRect.left + scrollLeft - clientLeft,
            right: boundingRect.right + scrollLeft - clientLeft,
            bottom: boundingRect.bottom + scrollTop - clientTop,
            width: boundingRect.right - boundingRect.left,
            height: boundingRect.bottom - boundingRect.top
        };
    }
};

},{"./element":15}],20:[function(require,module,exports){
var _ = require("./utils"),
    features = require("./features"),
    hooks = {};

if (!features.DOM2_EVENTS) {
    hooks.textContent = function(node, value) {
        node.innerText = value;
    };
}

if (!features.CSS3_ANIMATIONS) {
    // fix NoScope elements in IE < 10
    hooks.innerHTML = function(node, value) {
        node.innerHTML = "";
        node.appendChild(_.parseFragment(value));
    };
}

module.exports = hooks;

},{"./features":28,"./utils":41}],21:[function(require,module,exports){
var _ = require("./utils"),
    $Element = require("./element"),
    hooks = require("./element.set.hooks"),
    features = require("./features");

/**
 * Set property/attribute value by name
 * @param {String}           [name]  property/attribute name
 * @param {String|Function}  value   property/attribute value or function that returns it
 * @return {$Element}
 * @see https://github.com/chemerisuk/better-dom/wiki/Getter-and-setter
 */
$Element.prototype.set = function(name, value) {
    var len = arguments.length,
        originalName = name,
        originalValue = value,
        nameType = typeof name;

    return this.legacy(function(node, el, index, ref) {
        var hook;

        name = originalName;
        value = originalValue;

        if (len === 1) {
            if (name == null) {
                value = "";
            } else if (nameType === "object") {
                return _.forOwn(name, function(value, name) { el.set(name, value) });
            } else {
                // handle numbers, booleans etc.
                value = nameType === "function" ? name : String(name);
            }

            if (node.tagName === "SELECT") {
                // selectbox has special case
                if (_.every(node.options, function(o) { return !(o.selected = o.value === value) })) {
                    node.selectedIndex = -1;
                }

                return;
            } else if (node.type && "value" in node) {
                // for IE use innerText because it doesn't trigger onpropertychange
                name = features.DOM2_EVENTS ? "value" : "innerText";
            } else {
                name = "innerHTML";
            }
        } else if (len > 2 || len === 0 || nameType !== "string") {
            throw _.makeError("set", el);
        }

        if (typeof value === "function") value = value(el, index, ref);

        if (hook = hooks[name]) {
            hook(node, value);
        } else if (value == null) {
            node.removeAttribute(name);
        } else if (name in node) {
            node[name] = value;
        } else {
            node.setAttribute(name, value);
        }
    });
};

},{"./element":15,"./element.set.hooks":20,"./features":28,"./utils":41}],22:[function(require,module,exports){
var _ = require("./utils"),
    getStyleHooks = {},
    setStyleHooks = {},
    reDash = /\-./g,
    reCamel = /[A-Z]/g,
    directions = ["Top", "Right", "Bottom", "Left"],
    computed = _.getComputedStyle(document.documentElement),
    // In Opera CSSStyleDeclaration objects returned by _getComputedStyle have length 0
    props = computed.length ? _.slice(computed) : _.map(Object.keys(computed), function(key) {
        return key.replace(reCamel, function(str) { return "-" + str.toLowerCase() });
    });

_.forEach(props, function(propName) {
    var prefix = propName[0] === "-" ? propName.substr(1, propName.indexOf("-", 1) - 1) : null,
        unprefixedName = prefix ? propName.substr(prefix.length + 2) : propName,
        stylePropName = propName.replace(reDash, function(str) { return str[1].toUpperCase() });

    // most of browsers starts vendor specific props in lowercase
    if (!(stylePropName in computed)) {
        stylePropName = stylePropName[0].toLowerCase() + stylePropName.substr(1);
    }

    if (stylePropName !== propName) {
        getStyleHooks[unprefixedName] = function(style) {
            return style[stylePropName];
        };
        setStyleHooks[unprefixedName] = function(style, value) {
            value = typeof value === "number" ? value + "px" : value.toString();
            // use cssText property to determine DOM.importStyles call
            style["cssText" in style ? stylePropName : propName] = value;
        };
    }

    // Exclude the following css properties from adding px
    if (~" fill-opacity font-weight line-height opacity orphans widows z-index zoom ".indexOf(" " + propName + " ")) {
        setStyleHooks[propName] = function(style, value) {
            style["cssText" in style ? stylePropName : propName] = value.toString();
        };
    }
});

// normalize float css property
if ("cssFloat" in computed) {
    getStyleHooks.float = function(style) {
        return style.cssFloat;
    };
    setStyleHooks.float = function(style, value) {
        style.cssFloat = value;
    };
} else {
    getStyleHooks.float = function(style) {
        return style.styleFloat;
    };
    setStyleHooks.float = function(style, value) {
        style.styleFloat = value;
    };
}

// normalize property shortcuts
_.forOwn({
    font: ["fontStyle", "fontSize", "/", "lineHeight", "fontFamily"],
    padding: _.map(directions, function(dir) { return "padding" + dir }),
    margin: _.map(directions, function(dir) { return "margin" + dir }),
    "border-width": _.map(directions, function(dir) { return "border" + dir + "Width" }),
    "border-style": _.map(directions, function(dir) { return "border" + dir + "Style" })
}, function(props, key) {
    getStyleHooks[key] = function(style) {
        var result = [],
            hasEmptyStyleValue = function(prop, index) {
                result.push(prop === "/" ? prop : style[prop]);

                return !result[index];
            };

        return _.some(props, hasEmptyStyleValue) ? "" : result.join(" ");
    };
    setStyleHooks[key] = function(style, value) {
        if (value && "cssText" in style) {
            // normalize setting complex property across browsers
            style.cssText += ";" + key + ":" + value;
        } else {
            _.forEach(props, function(name) {
                style[name] = typeof value === "number" ? value + "px" : value.toString();
            });
        }
    };
});

module.exports = {
    get: getStyleHooks,
    set: setStyleHooks
};

},{"./utils":41}],23:[function(require,module,exports){
var _ = require("./utils"),
    $Element = require("./element"),
    hooks = require("./element.style.hooks");

/**
 * CSS getter/setter for an element
 * @param  {String|Object}   name    style property name or key/value object
 * @param  {String|Function} [value] style property value or function that returns it
 * @return {String|$Element} property value or reference to this
 */
$Element.prototype.style = function(name, value) {
    var len = arguments.length,
        node = this._node,
        nameType = typeof name,
        style, hook;

    if (len === 1 && nameType === "string") {
        if (node) {
            style = node.style;
            hook = hooks.get[name];

            value = hook ? hook(style) : style[name];

            if (!value) {
                style = _.getComputedStyle(node);
                value = hook ? hook(style) : style[name];
            }
        }

        return value;
    }

    return this.legacy(function(node, el, index, ref) {
        var appendCssText = function(value, key) {
            var hook = hooks.set[key];

            if (typeof value === "function") value = value(el, index, ref);

            if (value == null) value = "";

            if (hook) {
                hook(node.style, value);
            } else {
                node.style[key] = typeof value === "number" ? value + "px" : value.toString();
            }
        };

        if (len === 1 && name && nameType === "object") {
            _.forOwn(name, appendCssText);
        } else if (len === 2 && nameType === "string") {
            appendCssText(value, name);
        } else {
            throw _.makeError("style", el);
        }
    });
};

},{"./element":15,"./element.style.hooks":22,"./utils":41}],24:[function(require,module,exports){
var _ = require("./utils"),
    $Element = require("./element"),
    SelectorMatcher = require("./selectormatcher"),
    features = require("./features");

function makeTraversingMethod(propertyName, multiple) {
    return function(selector) {
        var matcher = SelectorMatcher(selector),
            nodes = multiple ? [] : null,
            it = this._node;

        if (it) {
            while (it = it[propertyName]) {
                if (it.nodeType === 1 && (!matcher || matcher(it))) {
                    if (!multiple) break;

                    nodes.push(it);
                }
            }
        }

        return multiple ? new $Element(nodes, multiple) : $Element(it);
    };
}

function makeChildTraversingMethod(multiple) {
    return function(index, selector) {
        if (multiple) {
            selector = index;
        } else if (typeof index !== "number") {
            throw _.makeError("child", this);
        }

        if (!this._node) return new $Element();

        var children = this._node.children,
            matcher = SelectorMatcher(selector),
            node;

        if (!features.DOM2_EVENTS) {
            // fix IE8 bug with children collection
            children = _.filter(children, function(node) { return node.nodeType === 1 });
        }

        if (multiple) {
            return new $Element(!matcher ? children : _.filter(children, matcher), true);
        }

        if (index < 0) index = children.length + index;

        node = children[index];

        return $Element(!matcher || matcher(node) ? node : null);
    };
}

/**
 * Find next sibling element filtered by optional selector
 * @param {String} [selector] css selector
 * @return {$Element} matched element
 * @function
 * @see https://github.com/chemerisuk/better-dom/wiki/Traversing
 */
$Element.prototype.next = makeTraversingMethod("nextSibling");

/**
 * Find previous sibling element filtered by optional selector
 * @param {String} [selector] css selector
 * @return {$Element} matched element
 * @function
 * @see https://github.com/chemerisuk/better-dom/wiki/Traversing
 */
$Element.prototype.prev = makeTraversingMethod("previousSibling");

/**
 * Find all next sibling elements filtered by optional selector
 * @param {String} [selector] css selector
 * @return {$Element} collection of matched elements
 * @function
 * @see https://github.com/chemerisuk/better-dom/wiki/Traversing
 */
$Element.prototype.nextAll = makeTraversingMethod("nextSibling", true);

/**
 * Find all previous sibling elements filtered by optional selector
 * @param {String} [selector] css selector
 * @return {$Element} collection of matched elements
 * @function
 * @see https://github.com/chemerisuk/better-dom/wiki/Traversing
 */
$Element.prototype.prevAll = makeTraversingMethod("previousSibling", true);

/**
 * Find parent element filtered by optional selector
 * @param {String} [selector] css selector
 * @return {$Element} matched element
 * @function
 * @see https://github.com/chemerisuk/better-dom/wiki/Traversing
 */
$Element.prototype.parent = makeTraversingMethod("parentNode");

/**
 * Return child element by index filtered by optional selector
 * @param  {Number} index child index
 * @param  {String} [selector] css selector
 * @return {$Element} matched child
 * @function
 * @see https://github.com/chemerisuk/better-dom/wiki/Traversing
 */
$Element.prototype.child = makeChildTraversingMethod(false);

/**
 * Fetch children elements filtered by optional selector
 * @param  {String} [selector] css selector
 * @return {$Element} collection of matched elements
 * @function
 * @see https://github.com/chemerisuk/better-dom/wiki/Traversing
 */
$Element.prototype.children = makeChildTraversingMethod(true);

},{"./element":15,"./features":28,"./selectormatcher":40,"./utils":41}],25:[function(require,module,exports){
var _ = require("./utils"),
    $Element = require("./element"),
    DOM = require("./dom"),
    features = require("./features"),
    animationEvents = features.WEBKIT_PREFIX ? ["webkitAnimationEnd", "webkitTransitionEnd"] : ["animationend", "transitionend"],
    createCallback = function(el, callback, fn) {
        return function() {
            el.set("aria-hidden", fn);

            if (callback) {
                el.each(function(el, index, ref) {
                    var transitionDelay = parseFloat(el.style("transition-duration")),
                        animationDelay = parseFloat(el.style("animation-duration"));

                    if (el.get("offsetWidth") && (transitionDelay || animationDelay)) {
                        // choose max delay
                        el.once(animationEvents[animationDelay > transitionDelay ? 0 : 1], function() {
                            callback(el, index, ref);
                        });
                    } else {
                        // use setTimeout to make a safe call
                        setTimeout(function() { callback(el, index, ref) }, 0);
                    }
                });
            }
        };
    },
    makeVisibilityMethod = function(name, fn) {
        return function(delay, callback) {
            var delayType = typeof delay;

            if (arguments.length === 1 && delayType === "function") {
                callback = delay;
                delay = 0;
            }

            if (delay && (delayType !== "number" || delay < 0) ||
                callback && typeof callback !== "function") {
                throw _.makeError(name, this);
            }

            callback = createCallback(this, callback, fn);

            if (delay) {
                setTimeout(callback, delay);
            } else {
                callback();
            }

            return this;
        };
    };

/**
 * Show element with optional callback and delay
 * @param {Number}   [delay=0]  time in miliseconds to wait
 * @param {Function} [callback] function that executes when animation is done
 * @return {$Element}
 * @function
 */
$Element.prototype.show = makeVisibilityMethod("show", false);

/**
 * Hide element with optional callback and delay
 * @param {Number}   [delay=0]  time in miliseconds to wait
 * @param {Function} [callback] function that executes when animation is done
 * @return {$Element}
 * @function
 */
$Element.prototype.hide = makeVisibilityMethod("hide", true);

/**
 * Toggle element visibility with optional callback and delay
 * @param {Number}   [delay=0]  time in miliseconds to wait
 * @param {Function} [callback] function that executes when animation is done
 * @return {$Element}
 * @function
 */
$Element.prototype.toggle = makeVisibilityMethod("toggle", function(el) {
    return el.get("aria-hidden") !== "true";
});

// [aria-hidden=true] could be overriden only if browser supports animations
// pointer-events:none helps to solve accidental clicks on a hidden element
DOM.importStyles("[aria-hidden=true]", "pointer-events:none; display:none" + (features.CSS3_ANIMATIONS ? "" : " !important"));

},{"./dom":6,"./element":15,"./features":28,"./utils":41}],26:[function(require,module,exports){
var hooks = {},
    $Element = require("./element"),
    features = require("./features"),
    docEl = document.documentElement;

if (features.DOM2_EVENTS) {
    hooks.relatedTarget = function(e) { return $Element(e.relatedTarget) };
} else {
    hooks.relatedTarget = function(e, currentTarget) {
        return $Element(e[(e.toElement === currentTarget ? "from" : "to") + "Element"]);
    };

    hooks.defaultPrevented = function(e) { return e.returnValue === false };

    hooks.which = function(e) { return e.keyCode };

    hooks.button = function(e) {
        var button = e.button;
        // click: 1 === left; 2 === middle; 3 === right
        return button & 1 ? 1 : ( button & 2 ? 3 : ( button & 4 ? 2 : 0 ) );
    };

    hooks.pageX = function(e) {
        return e.clientX + docEl.scrollLeft - docEl.clientLeft;
    };

    hooks.pageY = function(e) {
        return e.clientY + docEl.scrollTop - docEl.clientTop;
    };
}

module.exports = hooks;

},{"./element":15,"./features":28}],27:[function(require,module,exports){
/*
 * Helper type to create an event handler
 */
var _ = require("./utils"),
    $Element = require("./element"),
    SelectorMatcher = require("./selectormatcher"),
    features = require("./features"),
    hooks = require("./eventhandler.hooks"),
    debouncedEvents = "scroll mousemove",
    createCustomEventWrapper = function(originalHandler, type) {
        var handler = function() { if (window.event.srcUrn === type) originalHandler() };

        handler._type = "dataavailable";

        return handler;
    },
    createDebouncedEventWrapper = function(originalHandler, debouncing) {
        return function(e) {
            if (!debouncing) {
                debouncing = true;

                _.requestAnimationFrame(function() {
                    originalHandler(e);

                    debouncing = false;
                });
            }
        };
    },
    testEl = document.createElement("div");

module.exports = function(type, selector, callback, props, el, once) {
    var matcher = SelectorMatcher(selector),
        handler = function(e) {
            if (module.exports.skip === type) return; // early stop in case of default action

            e = e || window.event;

            // srcElement could be null in legacy IE when target is document
            var node = el._node,
                target = e.target || e.srcElement || document,
                currentTarget = selector ? target : node,
                fn = typeof callback === "string" ? el[callback] : callback,
                args = props || [selector ? "currentTarget" : "target", "defaultPrevented"];

            if (typeof fn !== "function") return; // early stop for late binding

            for (; matcher && !matcher(currentTarget); currentTarget = currentTarget.parentNode) {
                if (!currentTarget || currentTarget === node) return; // no matched element was found
            }

            // off callback even if it throws an exception later
            if (once) el.off(type, callback);

            args = _.map(args, function(name) {
                switch (name) {
                case "type":
                    return type;
                case "target":
                    return $Element(target);
                case "currentTarget":
                    return $Element(currentTarget);
                }

                var hook = hooks[name];

                return hook ? hook(e, node) : e[name];
            });

            // prepend extra arguments if they exist
            if (e._args && e._args.length) args = e._args.concat(args);

            if (fn.apply(el, args) === false) {
                // prevent default if handler returns false
                if (features.DOM2_EVENTS) {
                    e.preventDefault();
                } else {
                    e.returnValue = false;
                }
            }
        };

    if (~debouncedEvents.indexOf(type)) {
        handler = createDebouncedEventWrapper(handler);
    } else if (!features.DOM2_EVENTS && (type === "submit" || !("on" + type in testEl))) {
        // handle custom events for IE8
        handler = createCustomEventWrapper(handler, type);
    }

    return handler;
};

},{"./element":15,"./eventhandler.hooks":26,"./features":28,"./selectormatcher":40,"./utils":41}],28:[function(require,module,exports){
var doc = document,
    win = window;

module.exports = {
    CSS3_ANIMATIONS: win.CSSKeyframesRule || !doc.attachEvent,
    DOM2_EVENTS: !!doc.addEventListener,
    WEBKIT_PREFIX: window.WebKitAnimationEvent ? "-webkit-" : ""
};

},{}],29:[function(require,module,exports){
var _ = require("./utils"),
    $Node = require("./node"),
    $Element = require("./element");

/**
 * Check if element is inside of context
 * @param  {$Element} element element to check
 * @return {Boolean} true if success
 */
$Node.prototype.contains = function(element) {
    var node = this._node;

    if (!(element instanceof $Element)) throw _.makeError("contains", this);

    if (node) return element.every(function(el) { return node.contains(el._node) });
};

},{"./element":15,"./node":35,"./utils":41}],30:[function(require,module,exports){
var _ = require("./utils"),
    $Node = require("./node");

/**
 * Getter/setter of a data entry value. Tries to read the appropriate
 * HTML5 data-* attribute if it exists
 * @param  {String|Object}  key     data key or key/value object
 * @param  {Object}         [value] data value to store
 * @return {Object} data entry value or this in case of setter
 * @see https://github.com/chemerisuk/better-dom/wiki/Data-property
 */
$Node.prototype.data = function(key, value) {
    var len = arguments.length,
        keyType = typeof key,
        node = this._node,
        data = this._data;

    if (len === 1) {
        if (keyType === "string") {
            if (node) {
                value = data[key];

                if (value === undefined) {
                    try {
                        value = node.getAttribute("data-" + key);
                        // parse object notation syntax
                        if (value[0] === "{" && value[value.length - 1] === "}") {
                            value = JSON.parse(value);
                        }
                    } catch (err) {}

                    data[key] = value;
                }
            }

            return value;
        } else if (key && keyType === "object") {
            return _.forEach(this, function(el) { _.extend(el._data, key) });
        }
    } else if (len === 2 && keyType === "string") {
        return _.forEach(this, function(el) { el._data[key] = value });
    }

    throw _.makeError("data", this);
};

},{"./node":35,"./utils":41}],31:[function(require,module,exports){
var _ = require("./utils"),
    $Node = require("./node"),
    $Element = require("./element");

// big part of code inspired by Sizzle:
// https://github.com/jquery/sizzle/blob/master/sizzle.js

var rquickExpr = document.getElementsByClassName ? /^(?:(\w+)|\.([\w\-]+))$/ : /^(?:(\w+))$/,
    rsibling = /[\x20\t\r\n\f]*[+~>]/,
    rescape = /'|\\/g,
    tmpId = "DOM" + new Date().getTime();

/**
 * Find the first matched element by css selector
 * @param  {String} selector css selector
 * @return {$Element} the first matched element
 */
$Node.prototype.find = function(selector, /*INTERNAL*/multiple) {
    if (typeof selector !== "string") throw _.makeError("find", this);

    var node = this._node,
        quickMatch = rquickExpr.exec(selector),
        elements, old, nid, context;

    if (!node) return new $Element();

    if (quickMatch) {
        if (quickMatch[1]) {
            // speed-up: "TAG"
            elements = node.getElementsByTagName(selector);
        } else {
            // speed-up: ".CLASS"
            elements = node.getElementsByClassName(quickMatch[2]);
        }

        if (elements && !multiple) elements = elements[0];
    } else {
        old = true;
        nid = tmpId;
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

            context = rsibling.test(selector) ? node.parentNode : node;
            selector = nid + selector.split(",").join("," + nid);
        }

        try {
            elements = context[multiple ? "querySelectorAll" : "querySelector"](selector);
        } finally {
            if (!old) node.removeAttribute("id");
        }
    }

    return $Element(elements, multiple);
};

/**
 * Find all matched elements by css selector
 * @param  {String} selector css selector
 * @return {$Element} matched elements
 */
$Node.prototype.findAll = function(selector) {
    return this.find(selector, true);
};
},{"./element":15,"./node":35,"./utils":41}],32:[function(require,module,exports){
var _ = require("./utils"),
    $Node = require("./node"),
    EventHandler = require("./eventhandler"),
    hooks = require("./node.on.hooks"),
    features = require("./features");

/**
 * Triggers an event of specific type with optional extra arguments
 * @param  {String}    type   type of event
 * @param  {...Object} [args] extra arguments to pass into each event handler
 * @return {Boolean} true if default action wasn't prevented
 * @see https://github.com/chemerisuk/better-dom/wiki/Event-handling
 */
$Node.prototype.fire = function(type) {
    if (typeof type !== "string") throw _.makeError("fire", this);

    var args = _.slice(arguments, 1);

    return _.every(this, function(el) {
        var node = el._node,
            hook = hooks[type],
            handler = {},
            isCustomEvent, canContinue, e;

        if (hook) hook(handler);

        if (features.DOM2_EVENTS) {
            e = document.createEvent("HTMLEvents");

            e.initEvent(handler._type || type, true, true);
            e._args = args;

            canContinue = node.dispatchEvent(e);
        } else {
            isCustomEvent = type === "submit" || !("on" + type in node);
            e = document.createEventObject();
            // store original event type
            e.srcUrn = isCustomEvent ? type : undefined;
            e._args = args;

            node.fireEvent("on" + (isCustomEvent ? "dataavailable" : handler._type || type), e);

            canContinue = e.returnValue !== false;
        }

        // Call native method. IE<9 dies on focus/blur to hidden element
        if (canContinue && node[type] && (type !== "focus" && type !== "blur" || node.offsetWidth)) {
            // Prevent re-triggering of the same event
            EventHandler.skip = type;

            node[type]();

            EventHandler.skip = null;
        }

        return canContinue;
    });
};

},{"./eventhandler":27,"./features":28,"./node":35,"./node.on.hooks":37,"./utils":41}],33:[function(require,module,exports){
var _ = require("./utils"),
    $Node = require("./node");

function makeCollectionMethod(fn) {
    var code = fn.toString();
    // extract function body
    code = code.substring(code.indexOf("{") + 1, code.lastIndexOf("}"));
    // use this variable unstead of a
    code = code.replace(/a([^\w])/g, function(a, symbol) { return "this" + symbol; });
    // compile the function
    return Function("cb", "that", code);
}

_.extend($Node.prototype, {
    /**
     * Execute callback on each element in the collection
     * @memberOf $Node.prototype
     * @param  {Function} callback  function that accepts (element, index, this)
     * @param  {Object}   [context] callback context
     * @return {$Element}
     * @function
     */
    each: makeCollectionMethod(_.forEach),

    /**
     * Check if the callback returns true for any element in the collection
     * @memberOf $Node.prototype
     * @param  {Function} callback   function that accepts (element, index, this)
     * @param  {Object}   [context]  callback context
     * @return {Boolean} true, if any element in the collection return true
     * @function
     */
    some: makeCollectionMethod(_.some),

    /**
     * Check if the callback returns true for all elements in the collection
     * @memberOf $Node.prototype
     * @param  {Function} callback   function that accepts (element, index, this)
     * @param  {Object}   [context]  callback context
     * @return {Boolean} true, if all elements in the collection returns true
     * @function
     */
    every: makeCollectionMethod(_.every),

    /**
     * Create an array of values by running each element in the collection through the callback
     * @memberOf $Node.prototype
     * @param  {Function} callback   function that accepts (element, index, this)
     * @param  {Object}   [context]  callback context
     * @return {Array} new array of the results of each callback execution
     * @function
     */
    map: makeCollectionMethod(_.map),

    /**
     * Examine each element in a collection, returning an array of all elements the callback returns truthy for
     * @memberOf $Node.prototype
     * @param  {Function} callback   function that accepts (element, index, this)
     * @param  {Object}   [context]  callback context
     * @return {Array} new array with elements where callback returned true
     * @function
     */
    filter: makeCollectionMethod(_.filter),

    /**
     * Boil down a list of values into a single value (from start to end)
     * @memberOf $Node.prototype
     * @param  {Function} callback function that accepts (memo, element, index, this)
     * @param  {Object}   [memo]   initial value of the accumulator
     * @return {Object} the accumulated value
     * @function
     */
    reduce: makeCollectionMethod(_.foldl),

    /**
     * Boil down a list of values into a single value (from end to start)
     * @memberOf $Node.prototype
     * @param  {Function} callback function that accepts (memo, element, index, this)
     * @param  {Object}   [memo]   initial value of the accumulator
     * @return {Object} the accumulated value
     * @function
     */
    reduceRight: makeCollectionMethod(_.foldr),

    /**
     * Execute code in a 'unsafe' block where the first callback argument is native object.
     * @memberOf $Node.prototype
     * @param  {Function} callback function that accepts (node, element, index, this)
     * @return {$Element}
     * @function
     */
    legacy: makeCollectionMethod(_.legacy)
});

},{"./node":35,"./utils":41}],34:[function(require,module,exports){
var $Node = require("./node");

/**
 * Get property value by name
 * @param  {String} name property name
 * @return {String} property value
 */
$Node.prototype.get = function(name) {
    return this._node[name];
};

},{"./node":35}],35:[function(require,module,exports){
/**
 * Used to represent a DOM node
 * @name $Node
 * @constructor
 * @private
 */
function $Node(node) {
    if (node) {
        this._node = node;
        this._data = {};
        this._listeners = [];

        this[0] = node.__dom__ = this;
    }

    this.length = node ? 1 : 0;
}

module.exports = $Node;

},{}],36:[function(require,module,exports){
var _ = require("./utils"),
    $Node = require("./node"),
    features = require("./features");

/**
 * Unbind an event from the element
 * @param  {String}          type type of event
 * @param  {Function|String} [callback] event handler
 * @return {$Node}
 * @see https://github.com/chemerisuk/better-dom/wiki/Event-handling
 */
$Node.prototype.off = function(type, callback) {
    if (typeof type !== "string") throw _.makeError("off", this);

    return this.legacy(function(node, el) {
        _.forEach(el._listeners, function(handler, index, events) {
            if (handler && type === handler.type && (!callback || callback === handler.callback)) {
                type = handler._type || handler.type;

                if (features.DOM2_EVENTS) {
                    node.removeEventListener(type, handler, !!handler.capturing);
                } else {
                    // IE8 doesn't support onscroll on document level
                    if (el === DOM && type === "scroll") node = window;

                    node.detachEvent("on" + type, handler);
                }

                delete events[index];
            }
        });
    });
};

},{"./features":28,"./node":35,"./utils":41}],37:[function(require,module,exports){
var _ = require("./utils"),
    hooks = {};

// firefox doesn't support focusin/focusout events
if ("onfocusin" in document.createElement("a")) {
    _.forOwn({focus: "focusin", blur: "focusout"}, function(value, prop) {
        hooks[prop] = function(handler) { handler._type = value };
    });
} else {
    hooks.focus = hooks.blur = function(handler) { handler.capturing = true };
}

if (document.createElement("input").validity) {
    hooks.invalid = function(handler) { handler.capturing = true };
}

module.exports = hooks;

},{"./utils":41}],38:[function(require,module,exports){
var _ = require("./utils"),
    $Node = require("./node"),
    EventHandler = require("./eventhandler"),
    hooks = require("./node.on.hooks"),
    features = require("./features");

/**
 * Bind a DOM event
 * @param  {String|Array}    type event type(s) with optional selector
 * @param  {Function|String} callback event callback or property name (for late binding)
 * @param  {Array}           [props] array of event properties to pass into the callback
 * @return {$Node}
 * @see https://github.com/chemerisuk/better-dom/wiki/Event-handling
 */
$Node.prototype.on = function(type, callback, props, /*INTERNAL*/once) {
    var eventType = typeof type,
        selector, index, args;

    if (eventType === "string") {
        index = type.indexOf(" ");

        if (~index) {
            selector = type.substr(index + 1);
            type = type.substr(0, index);
        }

        if (!Array.isArray(props)) {
            once = props;
            props = undefined;
        }
    } else if (eventType === "object") {
        if (Array.isArray(type)) {
            args = _.slice(arguments, 1);

            _.forEach(type, function(name) { this.on.apply(this, [name].concat(args)) }, this);
        } else {
            _.forOwn(type, function(value, name) { this.on(name, value) }, this);
        }

        return this;
    } else {
        throw _.makeError("on", this);
    }

    return this.legacy(function(node, el) {
        var handler = EventHandler(type, selector, callback, props, el, once),
            hook = hooks[type];

        handler.type = selector ? type + " " + selector : type;
        handler.callback = callback;

        if (hook) hook(handler);

        if (features.DOM2_EVENTS) {
            node.addEventListener(handler._type || type, handler, !!handler.capturing);
        } else {
            // IE8 doesn't support onscroll on document level
            if (el === DOM && type === "scroll") node = window;

            node.attachEvent("on" + (handler._type || type), handler);
        }
        // store event entry
        el._listeners.push(handler);
    });
};

/**
 * Bind a DOM event but fire once before being removed
 * @param  {String|Array}    type event type(s) with optional selector
 * @param  {Function|String} callback event callback or property name (for late binding)
 * @param  {Array}           [props] array of event properties to pass into the callback
 * @return {$Node}
 * @see https://github.com/chemerisuk/better-dom/wiki/Event-handling
 */
$Node.prototype.once = function() {
    var args = _.slice(arguments);

    args.push(true);

    return this.on.apply(this, args);
};

},{"./eventhandler":27,"./features":28,"./node":35,"./node.on.hooks":37,"./utils":41}],39:[function(require,module,exports){
var $Node = require("./node");

/**
 * Set property value by name
 * @param  {String} name  property name
 * @param  {String} value property value
 */
$Node.prototype.set = function(name, value) {
    this._node[name] = value;

    return this;
};

},{"./node":35}],40:[function(require,module,exports){
/*
 * Helper for css selectors
 */
var _ = require("./utils"),
    // Quick matching inspired by
    // https://github.com/jquery/jquery
    rquickIs = /^(\w*)(?:#([\w\-]+))?(?:\[([\w\-\=]+)\])?(?:\.([\w\-]+))?$/,
    matchesProp = _.foldl("m oM msM mozM webkitM".split(" "), function(result, prefix) {
        var propertyName = prefix + "atchesSelector";

        if (!result) return document.documentElement[propertyName] && propertyName;
    }, null);

module.exports = function(selector) {
    if (typeof selector !== "string") return null;

    var quick = rquickIs.exec(selector);

    if (quick) {
        //   0  1    2   3          4
        // [ _, tag, id, attribute, class ]
        if (quick[1]) quick[1] = quick[1].toLowerCase();
        if (quick[3]) quick[3] = quick[3].split("=");
        if (quick[4]) quick[4] = " " + quick[4] + " ";
    }

    return function(node) {
        if (!node || node.nodeType !== 1) return false;

        if (!quick) {
            if (matchesProp) return node[matchesProp](selector);

            return _.some(document.querySelectorAll(selector), function(x) { return x === node });
        }

        return (
            (!quick[1] || node.nodeName.toLowerCase() === quick[1]) &&
            (!quick[2] || node.id === quick[2]) &&
            (!quick[3] || (quick[3][1] ? node.getAttribute(quick[3][0]) === quick[3][1] : node.hasAttribute(quick[3][0]))) &&
            (!quick[4] || (" " + node.className + " ").indexOf(quick[4]) >= 0)
        );
    };
};

},{"./utils":41}],41:[function(require,module,exports){
var DOM = require("./dom"),
    makeLoopMethod = (function(){
        var rcallback = /cb\.call\(([^)]+)\)/g,
            defaults = {
                BEFORE: "",
                COUNT:  "a ? a.length : 0",
                BODY:   "",
                AFTER:  ""
            };

        return function(options) {
            var code = "%BEFORE%\nfor(var i=0,n=%COUNT%;i<n;++i){%BODY%}%AFTER%", key;

            for (key in defaults) {
                code = code.replace("%" + key + "%", options[key] || defaults[key]);
            }

            // improve callback invokation by using call on demand
            code = code.replace(rcallback, function(expr, args) {
                return "(that?" + expr + ":cb(" + args.split(",").slice(1).join() + "))";
            });

            return Function("a", "cb", "that", "undefined", code);
        };
    })();

module.exports = {
    makeError: function(method, el) {
        var type = el === DOM ? "DOM" : "$Element";

        return "Error: " + type + "." + method + " was called with illegal arguments. Check http://chemerisuk.github.io/better-dom/" + type + ".html#" + method + " to verify the function call";
    },

    // OBJECT UTILS

    forOwn: makeLoopMethod({
        BEFORE: "var keys = Object.keys(a), k",
        COUNT:  "keys.length",
        BODY:   "k = keys[i]; cb.call(that, a[k], k, a)"
    }),
    extend: function(obj, mixins) {
        this.forOwn(mixins || {}, function(value, key) { obj[key] = value });

        return obj;
    },

    // COLLECTION UTILS

    forEach: makeLoopMethod({
        BODY:   "cb.call(that, a[i], i, a)",
        AFTER:  "return a"
    }),
    map: makeLoopMethod({
        BEFORE: "var out = Array(a && a.length || 0)",
        BODY:   "out[i] = cb.call(that, a[i], i, a)",
        AFTER:  "return out"
    }),
    some: makeLoopMethod({
        BODY:   "if (cb.call(that, a[i], i, a) === true) return true",
        AFTER:  "return false"
    }),
    filter: makeLoopMethod({
        BEFORE: "var out = []",
        BODY:   "if (cb.call(that, a[i], i, a)) out.push(a[i])",
        AFTER:  "return out"
    }),
    foldl: makeLoopMethod({
        BEFORE: "if (a && arguments.length < 2) that = a[0]",
        BODY:   "that = cb(that, a[arguments.length < 2 ? i + 1 : i], i, a)",
        AFTER:  "return that"
    }),
    foldr: makeLoopMethod({
        BEFORE: "var j; if (a && arguments.length < 2) that = a[a.length - 1]",
        BODY:   "j = n - i - 1; that = cb(that, a[arguments.length < 2 ? j - 1 : j], j, a)",
        AFTER:  "return that"
    }),
    every: makeLoopMethod({
        BEFORE: "var out = true",
        BODY:   "out = cb.call(that, a[i], i, a) && out",
        AFTER:  "return out"
    }),
    legacy: makeLoopMethod({
        BEFORE: "that = a",
        BODY:   "cb.call(that, a[i]._node, a[i], i)",
        AFTER:  "return a"
    }),
    slice: function(list, index) {
        return Array.prototype.slice.call(list, index | 0);
    },

    // DOM UTILS

    getComputedStyle: function(el) {
        return window.getComputedStyle ? window.getComputedStyle(el) : el.currentStyle;
    },
    parseFragment: (function() {
        var parser = document.createElement("body");

        return function(html) {
            var fragment = document.createDocumentFragment();

            // fix NoScope bug
            parser.innerHTML = "<br>" + html;
            parser.removeChild(parser.firstChild);

            while (parser.firstChild) fragment.appendChild(parser.firstChild);

            return fragment;
        };
    })(),
    requestAnimationFrame: window.requestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.webkitRequestAnimationFrame
};

},{"./dom":6}]},{},[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41])
;