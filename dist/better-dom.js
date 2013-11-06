/**
 * @file better-dom
 * @version 1.6.0-rc.1 2013-11-06T10:55:53
 * @overview Sandbox for living DOM extensions
 * @copyright Maksim Chemerisuk 2013
 * @license MIT
 * @see https://github.com/chemerisuk/better-dom
 */
;(function e(t,n,r){"use strict";function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var _ = require("./utils"),
    $Element = require("./element"),
    DOM = require("./dom"),
    rquick = /^[a-z]+$/;

/**
 * Create a $Element instance
 * @memberOf DOM
 * @param  {Mixed}   value        native element or HTMLString or EmmetString
 * @param  {Object}  [attributes] key/value pairs of the element attributes
 * @param  {Object}  [styles]     key/value pairs of the element styles
 * @return {$Element} element
 */
DOM.create = function(value, attributes, styles) {
    if (typeof value === "string") {
        if (rquick.test(value)) {
            value = new $Element(document.createElement(value));
        } else {
            value = _.trim(DOM.template(value));

            var sandbox = document.createElement("div");

            sandbox.innerHTML = value;

            if (sandbox.childNodes.length === 1 && sandbox.firstChild.nodeType === 1) {
                // remove temporary element
                sandbox = sandbox.removeChild(sandbox.firstChild);
            }

            value = new $Element(sandbox);
        }

        if (attributes) value.set(attributes);
        if (styles) value.style(styles);

        return value;
    }

    if (value.nodeType === 1) return $Element(value);

    throw _.makeError("create", this);
};

},{"./dom":6,"./element":15,"./utils":40}],2:[function(require,module,exports){
var _ = require("./utils"),
    $Element = require("./element"),
    DOM = require("./dom"),
    watchers = {};

/**
 * Define a DOM extension
 * @memberOf DOM
 * @param  {String}          selector extension css selector
 * @param  {Object|Function} mixins   extension mixins/constructor function
 * @see https://github.com/chemerisuk/better-dom/wiki/Living-extensions
 */
DOM.extend = function(selector, mixins) {
    if (typeof mixins === "function") mixins = {constructor: mixins};

    if (!mixins || typeof mixins !== "object") {
        throw _.makeError("extend", this);
    }

    if (selector === "*") {
        // extending element prototype
        _.extend($Element.prototype, mixins);
    } else {
        var ctr = mixins.hasOwnProperty("constructor") ? mixins.constructor : null,
            watcher = function(el) {
                _.extend(el, mixins);

                if (ctr) {
                    ctr.call(el);

                    el.constructor = $Element;
                }
            };

        (watchers[selector] = watchers[selector] || []).push(watcher);

        DOM.watch(selector, watcher, true);
    }

    return this;
};

/**
 * Synchronously return dummy {@link $Element} instance specified for optional selector
 * @memberOf DOM
 * @param  {Mixed} [content] mock element content
 * @return {$Element} mock instance
 */
DOM.mock = function(content) {
    var el = content ? DOM.create(content) : new $Element(),
        applyWatchers = function(el) {
            _.forOwn(watchers, function(watchers, selector) {
                if (el.matches(selector)) {
                    _.forEach(watchers, function(watcher) { watcher(el); });
                }
            });

            el.children().each(applyWatchers);
        };

    if (content) applyWatchers(el);

    return el;
};

},{"./dom":6,"./element":15,"./utils":40}],3:[function(require,module,exports){
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
            } else if (!arg.length && argType === "function") {
                arg();
            } else {
                throw _.makeError("importScripts", DOM);
            }
        };

    callback();

    return this;
};

},{"./dom":6,"./utils":40}],4:[function(require,module,exports){
var _ = require("./utils"),
    DOM = require("./dom"),
    rparam = /\{([a-z\-]+)\}/g,
    toContentAttr = function(term, attr) { return "\"attr(data-" + attr + ")\"" };

/**
 * Import global i18n string(s)
 * @memberOf DOM
 * @param {String|Object}  key     string key
 * @param {String}         pattern string pattern
 * @param {String}         [lang]  string language
 * @see https://github.com/chemerisuk/better-dom/wiki/Localization
 */
DOM.importStrings = function(key, pattern, lang) {
    var keyType = typeof key,
        selector, content;

    if (keyType === "string") {
        selector = "[data-i18n=\"" + key + "\"]";

        if (lang) selector += ":lang(" + lang + ")";

        content = "content:\"" + pattern.replace(rparam, toContentAttr) + "\"";

        DOM.importStyles(selector + ":before", content);
    } else if (keyType === "object") {
        lang = pattern;

        _.forOwn(key, function(pattern, key) {
            DOM.importStrings(key, pattern, lang);
        });
    } else {
        throw _.makeError("importStrings", this);
    }

    return this;
};

},{"./dom":6,"./utils":40}],5:[function(require,module,exports){
var _ = require("./utils"),
    $Element = require("./element"),
    DOM = require("./dom"),
    styleNode = document.documentElement.firstChild.appendChild(document.createElement("style")),
    styleSheet = styleNode.sheet || styleNode.styleSheet;

/**
 * Append global css styles
 * @memberOf DOM
 * @param {String|Object} selector css selector or object with selector/rules pairs
 * @param {String} styles css rules
 */
DOM.importStyles = function(selector, styles) {
    if (typeof styles === "object") {
        var obj = new $Element({style: {"__dom__": true}});

        $Element.prototype.style.call(obj, styles);

        styles = "";

        _.forOwn(obj._node.style, function(value, key) {
            styles += ";" + key + ":" + value;
        });

        styles = styles.substr(1);
    }

    if (typeof selector !== "string" || typeof styles !== "string") {
        throw _.makeError("importStyles", this);
    }

    if (styleSheet.cssRules) {
        styleSheet.insertRule(selector + " {" + styles + "}", styleSheet.cssRules.length);
    } else {
        // ie doesn't support multiple selectors in addRule
        _.forEach(selector.split(","), function(selector) {
            styleSheet.addRule(selector, styles);
        });
    }

    return this;
};

DOM.importStyles("[aria-hidden=true]", "display:none");
DOM.importStyles("[data-i18n]:before", "content:'???'attr(data-i18n)'???'");

},{"./dom":6,"./element":15,"./utils":40}],6:[function(require,module,exports){
var $Node = require("./node"),
    DOM = new $Node(document);

DOM.version = "1.6.0-rc.1";

/**
 * Global object to access DOM
 * @namespace DOM
 * @extends $Node
 */
module.exports = window.DOM = DOM;

},{"./node":34}],7:[function(require,module,exports){
var _ = require("./utils"),
    DOM = require("./dom"),
    readyCallbacks = [],
    readyState = document.readyState,
    isTop, testDiv, scrollIntervalId;

function pageLoaded() {
    if (readyCallbacks) {
        // safely trigger callbacks
        _.forEach(readyCallbacks, _.defer);
        // cleanup
        readyCallbacks = null;

        if (scrollIntervalId) {
            clearInterval(scrollIntervalId);
        }
    }
}

if (document.addEventListener) {
    document.addEventListener("DOMContentLoaded", pageLoaded, false);
    window.addEventListener("load", pageLoaded, false);
} else {
    window.attachEvent("onload", pageLoaded);

    testDiv = document.createElement("div");
    try {
        isTop = window.frameElement === null;
    } catch (e) {}

    //DOMContentLoaded approximation that uses a doScroll, as found by
    //Diego Perini: http://javascript.nwbox.com/IEContentLoaded/,
    //but modified by other contributors, including jdalton
    if (testDiv.doScroll && isTop && window.external) {
        scrollIntervalId = setInterval(function () {
            try {
                testDiv.doScroll();
                pageLoaded();
            } catch (e) {}
        }, 30);
    }
}

// Catch cases where ready is called after the browser event has already occurred.
// IE10 and lower don't handle "interactive" properly... use a weak inference to detect it
// discovered by ChrisS here: http://bugs.jquery.com/ticket/12282#comment:15
if (document.attachEvent ? readyState === "complete" : readyState !== "loading") {
    pageLoaded();
}

/**
 * Execute callback when DOM will be ready
 * @memberOf DOM
 * @param {Function} callback event listener
 */
DOM.ready = function(callback) {
    if (typeof callback !== "function") {
        throw _.makeError("ready", this);
    }

    if (readyCallbacks) {
        readyCallbacks.push(callback);
    } else {
        _.defer(callback);
    }
};

},{"./dom":6,"./utils":40}],8:[function(require,module,exports){
var _ = require("./utils"),
    DOM = require("./dom"),
    // operator type / priority object
    operators = {"(": 1,")": 2,"^": 3,">": 4,"+": 4,"*": 5,"}": 5,"{": 6,"]": 5,"[": 6,".": 7,"#": 8},
    reTextTag = /<\?>|<\/\?>/g,
    reAttr = /([\w\-]+)(?:=((?:"((?:\\.|[^"])*)")|(?:'((?:\\.|[^'])*)')|([^\s\]]+)))?/g,
    reIndex = /(\$+)(?:@(-)?(\d+)?)?/g,
    reVar = /\$\w+/g,
    reHtml = /^[\s<]/,
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
    makeTerm = (function() {
        var results = {};

        // populate empty tags
        _.forEach("area base br col hr img input link meta param command keygen source".split(" "), function(tag) {
            results[tag] = "<" + tag + ">";
        });

        return function(tag) {
            var result = results[tag];

            if (!result) {
                results[tag] = result = "<" + tag + "></" + tag + ">";
            }

            return [result];
        };
    }()),
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
    },
    cache = {};

/**
 * Parse emmet-like template to HTML string
 * @memberOf DOM
 * @param  {String} template emmet-like expression
 * @param {Object} [aliases] key/value map of aliases
 * @return {String} HTML string
 * @see https://github.com/chemerisuk/better-dom/wiki/Microtemplating
 * @see http://docs.emmet.io/cheat-sheet/
 */
DOM.template = function(template, aliases) {
    var stack = [],
        output = [],
        term = "",
        i, n, str, priority, skip, node;

    if (typeof template !== "string") throw _.makeError("template", this);

    if (!aliases && template in cache) return cache[template];

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

    if (output.length === 1) output.push(">");

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

    output = toString(stack[0]).replace(reTextTag, "");

    if (aliases) {
        output = output.replace(reVar, function(x) { return aliases[x.substr(1)] || x });
    } else {
        cache[template] = output;
    }

    return output;
};

},{"./dom":6,"./utils":40}],9:[function(require,module,exports){
var _ = require("./utils"),
    $Element = require("./element"),
    DOM = require("./dom"),
    SelectorMatcher = require("./selectormatcher"),
    // Inspired by trick discovered by Daniel Buchner:
    // https://github.com/csuwldcat/SelectorListener
    watchers = [],
    supportsAnimations = window.CSSKeyframesRule || !document.attachEvent,
    handleWatcherEntry = function(e, node) {
        return function(entry) {
            // do not execute callback if it was previously excluded
            if (_.some(e.detail, function(x) { return x === entry.callback })) return;

            if (entry.matcher(node)) {
                if (entry.once) {
                    if (supportsAnimations) {
                        node.addEventListener(e.type, entry.once, false);
                    } else {
                        node.attachEvent("on" + e.type, entry.once);
                    }
                }

                _.defer(function() { entry.callback($Element(node)) });
            }
        };
    },
    animId, cssPrefix, link, styles;

if (supportsAnimations) {
    animId = "DOM" + new Date().getTime();
    cssPrefix = window.WebKitAnimationEvent ? "-webkit-" : "";

    DOM.importStyles("@" + cssPrefix + "keyframes " + animId, "1% {opacity: .99}");

    styles = {
        "animation-duration": "1ms",
        "animation-name": animId + " !important"
    };

    document.addEventListener(cssPrefix ? "webkitAnimationStart" : "animationstart", function(e) {
        if (e.animationName === animId) {
            _.forEach(watchers, handleWatcherEntry(e, e.target));
        }
    }, false);
} else {
    link = document.querySelector("link[rel=htc]");

    if (!link) throw "You forgot to include <link> with rel='htc' on your page!";

    styles = {behavior: "url(" + link.href + ") !important"};

    document.attachEvent("ondataavailable", function() {
        var e = window.event;

        if (e.srcUrn === "dataavailable") {
            _.forEach(watchers, handleWatcherEntry(e, e.srcElement));
        }
    });
}

/**
 * Execute callback when element with specified selector is found in document tree
 * @memberOf DOM
 * @param {String} selector css selector
 * @param {Fuction} callback event handler
 * @param {Boolean} [once] execute callback only at the first time
 */
DOM.watch = function(selector, callback, once) {
    if (!supportsAnimations) {
        // do safe call of the callback for each matched element
        // if the behaviour is already attached
        DOM.findAll(selector).legacy(function(node, el) {
            if (node.behaviorUrns.length > 0) {
                _.defer(function() { callback(el) });
            }
        });
    }

    watchers.push({
        callback: callback,
        matcher: SelectorMatcher(selector),
        selector: selector,
        once: once && function(e) {
            if (supportsAnimations) {
                if (e.animationName !== animId) return;
            } else {
                e = window.event;

                if (e.srcUrn !== "dataavailable") return;
            }

            (e.detail = e.detail || []).push(callback);
        }
    });

    if (_.some(watchers, function(x) { return x.selector === selector })) {
        DOM.importStyles(selector, styles);
    }
};

},{"./dom":6,"./element":15,"./selectormatcher":39,"./utils":40}],10:[function(require,module,exports){
var _ = require("./utils"),
    $Element = require("./element"),
    rclass = /[\n\t\r]/g;

function makeClassesMethod(nativeStrategyName, strategy) {
    var methodName = nativeStrategyName === "contains" ? "hasClass" : nativeStrategyName + "Class";

    if (document.documentElement.classList) {
        strategy = function(className) {
            return this._node.classList[nativeStrategyName](className);
        };
    }

    strategy = (function(strategy){
        return function(className) {
            if (typeof className !== "string") throw _.makeError(methodName, this);

            return strategy.call(this, className);
        };
    })(strategy);

    if (methodName === "hasClass") {
        return function() {
            if (!this._node) return;

            return _.every(arguments, strategy, this);
        };
    } else {
        return function() {
            var args = arguments;

            return _.forEach(this, function(el) {
                _.forEach(args, strategy, el);
            });
        };
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

    this._node.className = _.trim(className);
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

},{"./element":15,"./utils":40}],11:[function(require,module,exports){
var _ = require("./utils"),
    $Element = require("./element");

/**
 * Clone element
 * @param {Boolean} [deep=true] true if the children should also be cloned, or false to do shallow copy
 * @return {$Element} clone of current element
 */
$Element.prototype.clone = function(deep) {
    if (!arguments.length) deep = true;

    if (typeof deep !== "boolean") throw _.makeError("clone", this);

    var node = this._node;

    if (node) {
        if (document.addEventListener) {
            node = node.cloneNode(deep);
        } else {
            node = document.createElement("div");
            node.innerHTML = this._node.outerHTML;
            node = node.firstChild;

            if (!deep) node.innerHTML = "";
        }

        return new $Element(node);
    }
};

},{"./element":15,"./utils":40}],12:[function(require,module,exports){
var hooks = {};

hooks.type = function(node) {
    // some browsers don't recognize input[type=email] etc.
    return node.getAttribute("type") || node.type;
};

if (!("textContent" in document.documentElement)) {
    hooks.textContent = function(node) { return node.innerText };
}

module.exports = hooks;

},{}],13:[function(require,module,exports){
var _ = require("./utils"),
    $Element = require("./element"),
    hooks = require("./element.get.hooks");

/**
 * Get property or attribute by name
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

},{"./element":15,"./element.get.hooks":12,"./utils":40}],14:[function(require,module,exports){
var _ = require("./utils"),
    $Element = require("./element");

/**
 * Get/set localized value
 * @param  {String} [value]  resource string key
 * @param  {Object} [args]   resource string arguments
 * @return {String|$Element}
 */
$Element.prototype.i18n = function(value, args) {
    var len = arguments.length;

    if (!len) return this.get("data-i18n");

    if (len > 2 || typeof value !== "string" || args && typeof args !== "object") throw _.makeError("i18n", this);

    args = _.foldl(_.keys(args || {}), function(memo, key) {
        memo["data-" + key] = args[key];

        return memo;
    }, {"data-i18n": value});

    return this.set(args).set("");
};

},{"./element":15,"./utils":40}],15:[function(require,module,exports){
var _ = require("./utils"),
    $Node = require("./node");

/**
 * Used to represent a DOM element
 * @name $Element
 * @param element {Object} native element
 * @extends $Node
 * @constructor
 * @private
 */
function $Element(element, /*INTERNAL*/collection) {
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

},{"./node":34,"./utils":40}],16:[function(require,module,exports){
var _ = require("./utils"),
    $Element = require("./element");

function makeManipulationMethod(methodName, fasterMethodName, strategy) {
    var singleArg = !fasterMethodName,
        manipulateContent = function(value) {
            return _.legacy(this, function(node, el) {
                var valueType = typeof value,
                    relatedNode = node.parentNode;

                if (valueType === "function") {
                    value = value.call(el);
                    valueType = typeof value;
                }

                if (valueType === "string") {
                    value = _.trim(DOM.template(value));

                    relatedNode = fasterMethodName ? null : _.parseFragment(value);
                } else if (value instanceof $Element) {
                    return value.legacy(function(relatedNode) { strategy(node, relatedNode); });
                } else if (value !== undefined) {
                    throw _.makeError(methodName, el);
                }

                if (singleArg || relatedNode) {
                    strategy(node, relatedNode);
                } else {
                    node.insertAdjacentHTML(fasterMethodName, value);
                }
            });
        };

    // always use _parseFragment because of HTML5 and NoScope bugs in IE
    if (document.attachEvent && !window.CSSKeyframesRule) fasterMethodName = false;

    return singleArg ? manipulateContent : function() {
        _.forEach(arguments, manipulateContent, this);

        return this;
    };
}

/**
 * Insert html string or $Element after the current
 * @param {...Mixed} contents HTMLString or $Element or functor that returns content
 * @return {$Element}
 * @function
 */
$Element.prototype.after = makeManipulationMethod("after", "afterend", function(node, relatedNode) {
    if (node.parentNode) node.parentNode.insertBefore(relatedNode, node.nextSibling);
});

/**
 * Insert html string or $Element before the current
 * @param {...Mixed} contents HTMLString or $Element or functor that returns content
 * @return {$Element}
 * @function
 */
$Element.prototype.before = makeManipulationMethod("before", "beforebegin", function(node, relatedNode) {
    if (node.parentNode) node.parentNode.insertBefore(relatedNode, node);
});

/**
 * Prepend html string or $Element to the current
 * @param {...Mixed} contents HTMLString or $Element or functor that returns content
 * @return {$Element}
 * @function
 */
$Element.prototype.prepend = makeManipulationMethod("prepend", "afterbegin", function(node, relatedNode) {
    node.insertBefore(relatedNode, node.firstChild);
});

/**
 * Append html string or $Element to the current
 * @param {...Mixed} contents HTMLString or $Element or functor that returns content
 * @return {$Element}
 * @function
 */
$Element.prototype.append = makeManipulationMethod("append", "beforeend", function(node, relatedNode) {
    node.appendChild(relatedNode);
});

/**
 * Replace current element with html string or $Element
 * @param {Mixed} content HTMLString or $Element or functor that returns content
 * @return {$Element}
 * @function
 */
$Element.prototype.replace = makeManipulationMethod("replace", "", function(node, relatedNode) {
    if (node.parentNode) node.parentNode.replaceChild(relatedNode, node);
});

/**
 * Remove current element from DOM
 * @return {$Element}
 * @function
 */
$Element.prototype.remove = makeManipulationMethod("remove", "", function(node) {
    if (node.parentNode) node.parentNode.removeChild(node);
});

},{"./element":15,"./utils":40}],17:[function(require,module,exports){
var _ = require("./utils"),
    documentElement = document.documentElement,
    hooks = {};

hooks[":focus"] = function(node) {
    return node === document.activeElement;
};

hooks[":hidden"] = function(node) {
    return node.getAttribute("aria-hidden") === "true" ||
        _.getComputedStyle(node).display === "none" ||
            !documentElement.contains(node);
};

module.exports = hooks;

},{"./utils":40}],18:[function(require,module,exports){
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

},{"./element":15,"./element.matches.hooks":17,"./selectormatcher":39,"./utils":40}],19:[function(require,module,exports){
var $Element = require("./element"),
    documentElement = document.documentElement;
/**
 * Calculates offset of current context
 * @return {{top: Number, left: Number, right: Number, bottom: Number}} offset object
 */
$Element.prototype.offset = function() {
    if (!this._node) return;

    var boundingRect = this._node.getBoundingClientRect(),
        clientTop = documentElement.clientTop,
        clientLeft = documentElement.clientLeft,
        scrollTop = window.pageYOffset || documentElement.scrollTop,
        scrollLeft = window.pageXOffset || documentElement.scrollLeft;

    return {
        top: boundingRect.top + scrollTop - clientTop,
        left: boundingRect.left + scrollLeft - clientLeft,
        right: boundingRect.right + scrollLeft - clientLeft,
        bottom: boundingRect.bottom + scrollTop - clientTop
    };
};

/**
 * Calculate element's width in pixels
 * @return {Number} element width in pixels
 */
$Element.prototype.width = function() {
    return this.get("offsetWidth");
};

/**
 * Calculate element's height in pixels
 * @return {Number} element height in pixels
 */
$Element.prototype.height = function() {
    return this.get("offsetHeight");
};

},{"./element":15}],20:[function(require,module,exports){
var _ = require("./utils"),
    hooks = {};

hooks.value = function(node, value) {
    node.value = value;

    if (node.tagName === "SELECT") {
        _.forEach(node.options, function(option) {
            if (option.value === value) {
                option.selected = true;
                option.setAttribute("selected", "selected");
            }
        });
    }
};

hooks.defaultValue = function(node, value) {
    node.defaultValue = value;

    if (node.tagName === "SELECT") {
        _.forEach(node.options, function(option) {
            if (option.value === value) {
                option.selected = true;
                option.setAttribute("selected", "selected");
            }
        });
    }
};

if (!("textContent" in document.documentElement)) {
    hooks.textContent = function(node, value) {
        node.innerText = value;
    };
}

if (document.attachEvent) {
    // fix NoScope elements in IE < 10
    hooks.innerHTML = function(node, value) {
        node.innerHTML = "";
        node.appendChild(_.parseFragment(value));
    };
}

module.exports = hooks;

},{"./utils":40}],21:[function(require,module,exports){
var _ = require("./utils"),
    $Element = require("./element"),
    hooks = require("./element.set.hooks");

/**
 * Set property/attribute value
 * @param {String} [name] property/attribute name
 * @param {String} value property/attribute value
 * @return {$Element}
 * @see https://github.com/chemerisuk/better-dom/wiki/Getter-and-setter
 */
$Element.prototype.set = function(name, value) {
    var len = arguments.length,
        nameType = typeof name;

    return _.legacy(this, function(node, el) {
        var initialName, hook;

        if (len === 1) {
            if (name == null) {
                value = "";
            } else if (nameType === "object") {
                return _.forOwn(name, function(value, name) { el.set(name, value) });
            } else {
                // handle numbers, booleans etc.
                value = nameType === "function" ? name : String(name);
            }

            initialName = name;

            if (node.type && "value" in node) {
                // for IE use innerText because it doesn't trigger onpropertychange
                name = window.addEventListener || node.tagName === "SELECT" ? "value" : "innerText";
            } else {
                name = "innerHTML";
            }
        } else if (len > 2 || len === 0 || nameType !== "string") {
            throw _.makeError("set", el);
        }

        if (typeof value === "function") {
            value = value.call(el, value.length ? el.get(name) : undefined);
        }

        if (hook = hooks[name]) {
            hook(node, value);
        } else if (value == null) {
            node.removeAttribute(name);
        } else if (name in node) {
            node[name] = value;
        } else {
            node.setAttribute(name, value);
        }

        if (initialName) {
            name = initialName;
            value = undefined;
        }
    });
};

},{"./element":15,"./element.set.hooks":20,"./utils":40}],22:[function(require,module,exports){
var _ = require("./utils"),
    getStyleHooks = {},
    setStyleHooks = {},
    reDash = /\-./g,
    reCamel = /[A-Z]/g,
    directions = ["Top", "Right", "Bottom", "Left"],
    computed = _.getComputedStyle(document.documentElement),
    // In Opera CSSStyleDeclaration objects returned by _getComputedStyle have length 0
    props = computed.length ? _.slice(computed) : _.map(_.keys(computed), function(key) {
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
            // use __dom__ property to determine DOM.importStyles call
            style[style.__dom__ ? propName : stylePropName] = value;
        };
    }

    // Exclude the following css properties from adding px
    if (~" fill-opacity font-weight line-height opacity orphans widows z-index zoom ".indexOf(" " + propName + " ")) {
        setStyleHooks[propName] = function(style, value) {
            style[style.__dom__ ? propName : stylePropName] = value.toString();
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
        _.forEach(props, function(name) {
            style[name] = typeof value === "number" ? value + "px" : value.toString();
        });
    };
});

module.exports = {
    get: getStyleHooks,
    set: setStyleHooks
};

},{"./utils":40}],23:[function(require,module,exports){
var _ = require("./utils"),
    $Element = require("./element"),
    hooks = require("./element.style.hooks");

/**
 * CSS getter/setter for an element
 * @param  {String} name    style property name
 * @param  {String} [value] style property value
 * @return {String|Object} property value or reference to this
 */
$Element.prototype.style = function(name, value) {
    var len = arguments.length,
        node = this._node,
        nameType = typeof name,
        style, hook;

    if (len === 1 && nameType === "string") {
        if (!node) return;

        style = node.style;
        hook = hooks.get[name];

        value = hook ? hook(style) : style[name];

        if (!value) {
            style = _.getComputedStyle(node);
            value = hook ? hook(style) : style[name];
        }

        return value;
    }

    return _.legacy(this, function(node, el) {
        var appendCssText = function(value, key) {
            var hook = hooks.set[key];

            if (typeof value === "function") {
                value = value.call(el, value.length ? el.style(key) : undefined);
            }

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

},{"./element":15,"./element.style.hooks":22,"./utils":40}],24:[function(require,module,exports){
var _ = require("./utils"),
    $Element = require("./element"),
    SelectorMatcher = require("./selectormatcher");

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

        if (!document.addEventListener) {
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

},{"./element":15,"./selectormatcher":39,"./utils":40}],25:[function(require,module,exports){
var $Element = require("./element");

/**
 * Show element
 * @return {$Element}
 */
$Element.prototype.show = function() {
    return this.set("aria-hidden", false);
};

/**
 * Hide element
 * @return {$Element}
 */
$Element.prototype.hide = function() {
    return this.set("aria-hidden", true);
};

/**
 * Toggle element visibility
 * @return {$Element}
 */
$Element.prototype.toggle = function() {
    return this.set("aria-hidden", function(value) { return value !== "true" });
};

},{"./element":15}],26:[function(require,module,exports){
var hooks = {},
    $Element = require("./element"),
    documentElement = document.documentElement;

if (document.addEventListener) {
    hooks.relatedTarget = function(event) {
        return $Element(event.relatedTarget);
    };
} else {
    hooks.relatedTarget = function(event, currentTarget) {
        var propName = ( event.toElement === currentTarget ? "from" : "to" ) + "Element";

        return $Element(event[propName]);
    };

    hooks.defaultPrevented = function(event) {
        return event.returnValue === false;
    };

    hooks.which = function(event) {
        var button = event.button;
        // click: 1 === left; 2 === middle; 3 === right
        return event.keyCode || ( button & 1 ? 1 : ( button & 2 ? 3 : ( button & 4 ? 2 : 0 ) ) );
    };

    hooks.pageX = function(event) {
        return event.clientX + documentElement.scrollLeft - documentElement.clientLeft;
    };

    hooks.pageY = function(event) {
        return event.clientY + documentElement.scrollTop - documentElement.clientTop;
    };
}

module.exports = hooks;

},{"./element":15}],27:[function(require,module,exports){
/*
 * Helper type to create an event handler
 */
var _ = require("./utils"),
    $Element = require("./element"),
    SelectorMatcher = require("./selectormatcher"),
    hooks = require("./eventhandler.hooks"),
    debouncedEvents = "scroll mousemove",
    defaultArgs = ["target", "defaultPrevented"],
    detailedDefaultArgs = ["detail", "target", "defaultPrevented"],
    createCustomEventWrapper = function(originalHandler, type) {
        var handler = function() {
                if (window.event.srcUrn === type) originalHandler();
            };

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

function EventHandler(type, selector, context, callback, extras, currentTarget) {
    context = context || currentTarget;

    var matcher = SelectorMatcher(selector),
        isCallbackProp = typeof callback === "string",
        defaultEventHandler = function(e, target) {
            e = e || window.event;

            if (EventHandler.veto !== type) {
                var fn = isCallbackProp ? context[callback] : callback,
                    args = extras || (e.detail != null ? detailedDefaultArgs : defaultArgs);

                args = _.map(args, function(name) {
                    if (typeof name !== "string") return name;

                    switch (name) {
                    case "type":
                        return type;
                    case "currentTarget":
                        return currentTarget;
                    case "target":
                        target = target || e.target || e.srcElement;
                        // handle DOM variable correctly
                        return target ? $Element(target) : DOM;
                    }

                    var hook = hooks[name];

                    return hook ? hook(e, currentTarget._node) : e[name];
                });

                if (fn && fn.apply(context, args) === false) {
                    // prevent default if handler returns false
                    if (e.preventDefault) {
                        e.preventDefault();
                    } else {
                        e.returnValue = false;
                    }
                }
            }
        },
        result;

    result = !matcher ? defaultEventHandler : function(e) {
        var node = window.event ? window.event.srcElement : e.target,
            root = currentTarget._node;

        for (; node && node !== root; node = node.parentNode) {
            if (matcher(node)) return defaultEventHandler(e, node);
        }
    };

    if (~debouncedEvents.indexOf(type)) {
        result = createDebouncedEventWrapper(result);
    } else if (!document.addEventListener && (type === "submit" || !("on" + type in testEl))) {
        // handle custom events for IE8
        result = createCustomEventWrapper(result, type);
    }

    return result;
}

module.exports = EventHandler;

},{"./element":15,"./eventhandler.hooks":26,"./selectormatcher":39,"./utils":40}],28:[function(require,module,exports){
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

},{"./element":15,"./node":34,"./utils":40}],29:[function(require,module,exports){
var _ = require("./utils"),
    $Node = require("./node");

/**
 * Getter/setter of a data entry value. Tries to read the appropriate
 * HTML5 data-* attribute if it exists
 * @param  {String|Object} key     data key
 * @param  {Object}        [value] data value to store
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

                if (value === undefined && node.hasAttribute("data-" + key)) {
                    value = data[key] = node.getAttribute("data-" + key);
                }
            }

            return value;
        } else if (key && keyType === "object") {
            return _.forEach(this, function(el) {
                _.extend(el._data, key);
            });
        }
    } else if (len === 2 && keyType === "string") {
        return _.forEach(this, function(el) {
            el._data[key] = value;
        });
    }

    throw _.makeError("data", this);
};

},{"./node":34,"./utils":40}],30:[function(require,module,exports){
var _ = require("./utils"),
    $Node = require("./node"),
    $Element = require("./element");

// big part of code inspired by Sizzle:
// https://github.com/jquery/sizzle/blob/master/sizzle.js

// TODO: disallow to use buggy selectors?
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
    if (typeof selector !== "string") {
        throw _.makeError("find", this);
    }

    var node = this._node,
        quickMatch = rquickExpr.exec(selector),
        m, elements, old, nid, context;

    if (!node) return new $Element();

    if (quickMatch) {
        // Speed-up: "TAG"
        if (quickMatch[1]) {
            elements = node.getElementsByTagName(selector);
        // Speed-up: ".CLASS"
        } else if (m = quickMatch[2]) {
            elements = node.getElementsByClassName(m);
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

            context = rsibling.test(selector) && node.parentNode || node;
            selector = nid + selector.split(",").join("," + nid);
        }

        try {
            elements = context[multiple ? "querySelectorAll" : "querySelector"](selector);
        } finally {
            if ( !old ) {
                node.removeAttribute("id");
            }
        }
    }

    return $Element(elements, multiple);
};

/**
 * Finds all matched elements by css selector
 * @param  {String} selector css selector
 * @return {$Element} collection of matched elements
 */
$Node.prototype.findAll = function(selector) {
    return this.find(selector, true);
};
},{"./element":15,"./node":34,"./utils":40}],31:[function(require,module,exports){
var _ = require("./utils"),
    $Node = require("./node"),
    EventHandler = require("./eventhandler"),
    hooks = require("./node.on.hooks");

/**
 * Triggers an event of specific type and executes it's default action if it exists
 * @param  {String} type type of event
 * @param  {Object} [detail] event details
 * @return {Boolean} true if default action wasn't prevented
 * @see https://github.com/chemerisuk/better-dom/wiki/Event-handling
 */
$Node.prototype.fire = function(type, detail) {
    if (typeof type !== "string") {
        throw _.makeError("fire", this);
    }

    return _.every(this, function(el) {
        var node = el._node,
            hook = hooks[type],
            handler = {},
            isCustomEvent, canContinue, e;

        if (hook) hook(handler);

        if (document.createEvent) {
            e = document.createEvent("HTMLEvents");

            e.initEvent(handler._type || type, true, true);
            e.detail = detail;

            canContinue = node.dispatchEvent(e);
        } else {
            isCustomEvent = handler.custom || !("on" + type in node);
            e = document.createEventObject();
            // store original event type
            e.srcUrn = isCustomEvent ? type : undefined;
            e.detail = detail;

            node.fireEvent("on" + (isCustomEvent ? "dataavailable" : handler._type || type), e);

            canContinue = e.returnValue !== false;
        }

        // Call a native DOM method on the target with the same name as the event
        // IE<9 dies on focus/blur to hidden element
        if (canContinue && node[type] && (type !== "focus" && type !== "blur" || node.offsetWidth)) {
            // Prevent re-triggering of the same event
            EventHandler.veto = type;

            node[type]();

            EventHandler.veto = false;
        }

        return canContinue;
    });
};

},{"./eventhandler":27,"./node":34,"./node.on.hooks":36,"./utils":40}],32:[function(require,module,exports){
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
     * Executes callback on each element in the collection
     * @memberOf $Element.prototype
     * @param  {Function} callback callback function
     * @param  {Object}   [context]  callback context
     * @return {$Element}
     * @function
     */
    each: makeCollectionMethod(_.forEach),

    /**
     * Checks if the callback returns true for any element in the collection
     * @memberOf $Element.prototype
     * @param  {Function} callback   callback function
     * @param  {Object}   [context]  callback context
     * @return {Boolean} true, if any element in the collection return true
     * @function
     */
    some: makeCollectionMethod(_.some),

    /**
     * Checks if the callback returns true for all elements in the collection
     * @memberOf $Element.prototype
     * @param  {Function} callback   callback function
     * @param  {Object}   [context]  callback context
     * @return {Boolean} true, if all elements in the collection returns true
     * @function
     */
    every: makeCollectionMethod(_.every),

    /**
     * Creates an array of values by running each element in the collection through the callback
     * @memberOf $Element.prototype
     * @param  {Function} callback   callback function
     * @param  {Object}   [context]  callback context
     * @return {Array} new array of the results of each callback execution
     * @function
     */
    map: makeCollectionMethod(_.map),

    /**
     * Examines each element in a collection, returning an array of all elements the callback returns truthy for
     * @memberOf $Element.prototype
     * @param  {Function} callback   callback function
     * @param  {Object}   [context]  callback context
     * @return {Array} new array with elements where callback returned true
     * @function
     */
    filter: makeCollectionMethod(_.filter),

    /**
     * Boils down a list of values into a single value (from start to end)
     * @memberOf $Element.prototype
     * @param  {Function} callback callback function
     * @param  {Object}   [memo]   initial value of the accumulator
     * @return {Object} the accumulated value
     * @function
     */
    reduce: makeCollectionMethod(_.foldl),

    /**
     * Boils down a list of values into a single value (from end to start)
     * @memberOf $Element.prototype
     * @param  {Function} callback callback function
     * @param  {Object}   [memo]   initial value of the accumulator
     * @return {Object} the accumulated value
     * @function
     */
    reduceRight: makeCollectionMethod(_.foldr),

    /**
     * Executes code in a 'unsafe' block there the first callback argument is native DOM
     * object. Use only when you need to communicate better-dom with third party scripts!
     * @memberOf $Element.prototype
     * @param  {Function} block unsafe block body (nativeNode, index)
     * @return {$Element}
     * @function
     */
    legacy: makeCollectionMethod(_.legacy)
});

},{"./node":34,"./utils":40}],33:[function(require,module,exports){
var _ = require("./utils"),
    $Node = require("./node");

/**
 * Get property by name
 * @param  {String} name property name
 * @return {String} property value
 */
$Node.prototype.get = function(name) {
    if (typeof name !== "string") throw _.makeError(this, "get");

    return this._node[name];
};

},{"./node":34,"./utils":40}],34:[function(require,module,exports){
/**
 * Used to represent a DOM node
 * @name $Node
 * @param node {Object} native node
 * @constructor
 * @private
 */
function $Node(node) {
    if (node) {
        this._node = node;
        this._data = {};
        this._listeners = [];

        Array.prototype.push.call(this, node.__dom__ = this);
    } else {
        this.length = 0;
    }
}

module.exports = $Node;

},{}],35:[function(require,module,exports){
var _ = require("./utils"),
    $Node = require("./node");

/**
 * Unbind a DOM event from the context
 * @param  {String}          type type of event
 * @param  {Object}          [context] callback context
 * @param  {Function|String} [callback] event handler
 * @return {$Node}
 * @see https://github.com/chemerisuk/better-dom/wiki/Event-handling
 */
$Node.prototype.off = function(type, context, callback) {
    if (typeof type !== "string") throw _.makeError("off", this);

    if (arguments.length === 2) {
        callback = context;
        context = !callback ? undefined : this;
    }

    return _.legacy(this, function(node, el) {
        _.forEach(el._listeners, function(handler, index, events) {
            if (handler && type === handler.type && (!context || context === handler.context) && (!callback || callback === handler.callback)) {
                type = handler._type || handler.type;

                if (document.removeEventListener) {
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

},{"./node":34,"./utils":40}],36:[function(require,module,exports){
var _ = require("./utils"),
    $Element = require("./element"),
    hooks = {};

// firefox doesn't support focusin/focusout events
if ("onfocusin" in document.createElement("a")) {
    _.forOwn({focus: "focusin", blur: "focusout"}, function(value, prop) {
        hooks[prop] = function(handler) { handler._type = value };
    });
} else {
    hooks.focus = hooks.blur = function(handler) {
        handler.capturing = true;
    };
}

if (document.createElement("input").validity) {
    hooks.invalid = function(handler) {
        handler.capturing = true;
    };
}

if (document.attachEvent && !window.CSSKeyframesRule) {
    // input event fix via propertychange
    document.attachEvent("onfocusin", (function() {
        var legacyEventHandler = function() {
                if (capturedNode && capturedNode.value !== capturedNodeValue) {
                    capturedNodeValue = capturedNode.value;
                    // trigger special event that bubbles
                    $Element(capturedNode).fire("input");
                }
            },
            capturedNode, capturedNodeValue;

        if (window.addEventListener) {
            // IE9 doesn't fire oninput when text is deleted, so use
            // legacy onselectionchange event to detect such cases
            // http://benalpert.com/2013/06/18/a-near-perfect-oninput-shim-for-ie-8-and-9.html
            document.attachEvent("onselectionchange", legacyEventHandler);
        }

        return function() {
            var target = window.event.srcElement,
                type = target.type;

            if (capturedNode) {
                capturedNode.detachEvent("onpropertychange", legacyEventHandler);
                capturedNode = undefined;
            }

            if (type === "text" || type === "password" || type === "textarea") {
                (capturedNode = target).attachEvent("onpropertychange", legacyEventHandler);
            }
        };
    })());

    if (!window.addEventListener) {
        // submit event bubbling fix
        document.attachEvent("onkeydown", function() {
            var e = window.event,
                target = e.srcElement,
                form = target.form;

            if (form && target.type !== "textarea" && e.keyCode === 13 && e.returnValue !== false) {
                $Element(form).fire("submit");

                return false;
            }
        });

        document.attachEvent("onclick", (function() {
            var handleSubmit = function() {
                    var form = window.event.srcElement;

                    form.detachEvent("onsubmit", handleSubmit);

                    $Element(form).fire("submit");

                    return false;
                };

            return function() {
                var target = window.event.srcElement,
                    form = target.form;

                if (form && target.type === "submit") {
                    form.attachEvent("onsubmit", handleSubmit);
                }
            };
        })());

        hooks.submit = function(handler) {
            handler.custom = true;
        };
    }
}

module.exports = hooks;

},{"./element":15,"./utils":40}],37:[function(require,module,exports){
var _ = require("./utils"),
    $Node = require("./node"),
    EventHandler = require("./eventhandler"),
    hooks = require("./node.on.hooks");

/**
 * Bind a DOM event to the context
 * @param  {String}          type event type with optional selector
 * @param  {Object}          [context] callback context
 * @param  {Function|String} callback event callback/property name
 * @param  {Array}           [props] event properties to pass to the callback function
 * @return {$Node}
 * @see https://github.com/chemerisuk/better-dom/wiki/Event-handling
 */
$Node.prototype.on = function(type, context, callback, props, /*INTERNAL*/once) {
    var eventType = typeof type,
        selector, index;

    if (eventType === "string") {
        index = type.indexOf(" ");

        if (~index) {
            selector = type.substr(index + 1);
            type = type.substr(0, index);
        }

        // handle optional context argument
        if (typeof context !== "object") {
            once = props;
            props = callback;
            callback = context;
            context = undefined;
        }

        if (typeof props !== "object") {
            once = props;
            props = undefined;
        }
    } else if (eventType === "object") {
        _.forOwn(type, function(value, name) { this.on(name, value) }, this);

        return this;
    } else {
        throw _.makeError("on", this);
    }

    return _.legacy(this, function(node, el) {
        var hook, handler;

        if (once) {
            callback = (function(originalCallback) {
                return function() {
                    // remove event listener
                    el.off(handler.type, handler.context, callback);

                    return originalCallback.apply(el, arguments);
                };
            }(callback));
        }

        handler = EventHandler(type, selector, context, callback, props, el);
        handler.type = selector ? type + " " + selector : type;
        handler.callback = callback;
        handler.context = context || el;

        if (hook = hooks[type]) hook(handler);

        if (document.addEventListener) {
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
 * Bind a DOM event to the context and the callback only fire once before being removed
 * @param  {String}   type type of event with optional selector to filter by
 * @param  {Array}    [props] event properties to pass to the callback function
 * @param  {Object}   [context] callback context
 * @param  {Function|String} callback event callback/property name
 * @return {$Node}
 * @see https://github.com/chemerisuk/better-dom/wiki/Event-handling
 */
$Node.prototype.once = function() {
    var args = _.slice(arguments);

    args.push(true);

    return this.on.apply(this, args);
};

},{"./eventhandler":27,"./node":34,"./node.on.hooks":36,"./utils":40}],38:[function(require,module,exports){
var _ = require("./utils"),
    $Node = require("./node");

/**
 * Set property value
 * @param  {String} name  property name
 * @param  {String} value property value
 */
$Node.prototype.set = function(name, value) {
    if (typeof name !== "string" || typeof value !== "string") throw _.makeError(this, "set");

    this._node[name] = value;

    return this;
};

},{"./node":34,"./utils":40}],39:[function(require,module,exports){
/*
 * Helper for css selectors
 */
var _ = require("./utils"),
    // Quick matching inspired by
    // https://github.com/jquery/jquery
    rquickIs = /^(\w*)(?:#([\w\-]+))?(?:\[([\w\-]+)\])?(?:\.([\w\-]+))?$/,
    matchesProp = _.foldl("m oM msM mozM webkitM".split(" "), function(result, prefix) {
        var propertyName = prefix + "atchesSelector";

        if (!result) return document.documentElement[propertyName] && propertyName;
    }, null),
    isEqual = function(val) { return val === this };

module.exports = function(selector) {
    if (typeof selector !== "string") return null;

    var quick = rquickIs.exec(selector);
    // TODO: support attribute value check
    if (quick) {
        //   0  1    2   3          4
        // [ _, tag, id, attribute, class ]
        if (quick[1]) quick[1] = quick[1].toLowerCase();
        if (quick[4]) quick[4] = " " + quick[4] + " ";
    }

    return function(el) {
        if (quick) {
            return (
                (!quick[1] || el.nodeName.toLowerCase() === quick[1]) &&
                (!quick[2] || el.id === quick[2]) &&
                (!quick[3] || el.hasAttribute(quick[3])) &&
                (!quick[4] || (" " + el.className + " ").indexOf(quick[4]) >= 0)
            );
        }

        if (matchesProp) return el[matchesProp](selector);

        return _.some(document.querySelectorAll(selector), isEqual, el);
    };
};

},{"./utils":40}],40:[function(require,module,exports){
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
    defer: function(callback) { return setTimeout(callback, 0) },
    trim: (function() {
        var reTrim = /^\s+|\s+$/g;

        return function(str) {
            if (String.prototype.trim) {
                return str.trim();
            } else {
                return str.replace(reTrim, "");
            }
        };
    }()),
    makeError: function(method, el) {
        var type;

        if (el === DOM) {
            type = "DOM";
        } else {
            type = "$Element";
        }

        return "Error: " + type + "." + method + " was called with illegal arguments. Check http://chemerisuk.github.io/better-dom/" + type + ".html#" + method + " to verify the function call";
    },

    // OBJECT UTILS

    forIn: function(obj, callback, thisPtr) {
        for (var prop in obj) {
            callback.call(thisPtr, obj[prop], prop, obj);
        }
    },
    forOwn: (function() {
        if (Object.keys) {
            return makeLoopMethod({
                BEFORE: "var keys = Object.keys(a), k",
                COUNT:  "keys.length",
                BODY:   "k = keys[i]; cb.call(that, a[k], k, a)"
            });
        } else {
            return function(obj, callback, thisPtr) {
                for (var prop in obj) {
                    if (Object.prototype.hasOwnProperty.call(obj, prop)) callback.call(thisPtr, obj[prop], prop, obj);
                }
            };
        }
    }()),
    keys: Object.keys || (function() {
        var collectKeys = function(value, key) { this.push(key); };

        return function(obj) {
            var result = [];

            this.forOwn(obj, collectKeys, result);

            return result;
        };
    }()),
    extend: function(obj, mixins) {
        this.forOwn(mixins, function(value, key) {
            obj[key] = value;
        });

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
    slice: function(list, index) {
        return Array.prototype.slice.call(list, index | 0);
    },
    legacy: makeLoopMethod({
        BEFORE: "that = a",
        BODY:   "cb.call(that, a[i]._node, a[i], i)",
        AFTER:  "return a"
    }),

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

            while (parser.firstChild) {
                fragment.appendChild(parser.firstChild);
            }

            return fragment;
        };
    })(),
    requestAnimationFrame: (function() {
        var lastTime = 0,
            raf = window.requestAnimationFrame ||
                window.mozRequestAnimationFrame ||
                window.webkitRequestAnimationFrame;

        return raf || function(callback) {
            var currTime = new Date().getTime(),
                timeToCall = Math.max(0, 16 - (currTime - lastTime));

            lastTime = currTime + timeToCall;

            if (timeToCall) {
                setTimeout(callback, timeToCall);
            } else {
                callback(currTime + timeToCall);
            }
        };
    }())
};

},{"./dom":6}]},{},[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,18,17,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40])
;