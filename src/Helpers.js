define([], function() {
    "use strict";

    // HELPERS
    // -------

    // jshint unused:false
    var _uniqueId = (function() {
            var idCounter = 0;

            return function(prefix) {
                var id = ++idCounter;
                return String(prefix || "") + id;
            };
        })(),
        _defer = function(callback) {
            return setTimeout(callback, 0);
        },

        // Collection utilites
        // -------------------
        
        makeCollectionMethod = (function(){
            var tpl = "", args = {
                    BEFORE: "",
                    COUNT:  "a ? a.length : 0",
                    BODY:   "",
                    AFTER:  ""
                };

            tpl += "%BEFORE%";
            tpl += "\nfor (var i = 0, n = %COUNT%; i < n; ++i) {";
            tpl += "%BODY%";
            tpl += "}%AFTER%";

            return function(options) {
                var code = tpl, key;

                for (key in args) {
                    code = code.replace("%" + key + "%", options[key] || args[key]);
                }

                return Function("a", "cb", "that", "undefined", code);
            };
        })(),
        _forEach = makeCollectionMethod({
            BODY:   "cb.call(that, a[i], i, a)"
        }),
        _times = makeCollectionMethod({
            COUNT:  "a",
            BODY:   "cb.call(that, i)"
        }),
        _map = makeCollectionMethod({
            BEFORE: "var out = []",
            BODY:   "out.push(cb.call(that, a[i], i, a))",
            AFTER:  "return out"
        }),
        _some = makeCollectionMethod({
            BODY:   "if (cb.call(that, a[i], i, a) === true) return true",
            AFTER:  "return false"
        }),
        _every = makeCollectionMethod({
            BEFORE: "var out = true",
            BODY:   "out = out && cb.call(that, a[i], a)",
            AFTER:  "return out"
        }),
        _filter = makeCollectionMethod({
            BEFORE: "var out = []",
            BODY:   "if (cb.call(that, a[i], i, a)) out.push(a[i])",
            AFTER:  "return out"
        }),
        _foldl = makeCollectionMethod({
            BODY:   "that = !i && that === undefined ? a[i] : cb(that, a[i], i, a)",
            AFTER:  "return that"
        }),
        _slice = function(list, index) {
            return Array.prototype.slice.call(list, index || 0);
        },
        _isArray = Array.isArray || function(obj) {
            return Object.prototype.toString.call(obj) === "[object Array]";
        },

        // Object utilites
        // ---------------
        
        _forOwn = function(obj, callback, thisPtr) {
            for (var prop in obj) {
                if (Object.prototype.hasOwnProperty.call(obj, prop)) callback.call(thisPtr, obj[prop], prop, obj);
            }
        },
        _forIn = function(obj, callback, thisPtr) {
            for (var prop in obj) {
                callback.call(thisPtr, obj[prop], prop, obj);
            }
        },
        _keys = Object.keys || (function() {
            var collectKeys = function(value, key) { this.push(key); };

            return function(obj) {
                var result = [];

                _forOwn(obj, collectKeys, result);

                return result;
            };
        }()),
        _extend = function(obj, name, value) {
            if (arguments.length === 3) {
                obj[name] = value;
            } else if (name) {
                _forOwn(name, function(value, key) {
                    obj[key] = value;
                });
            }

            return obj;
        },

        // DOM utilites
        // ------------

        _getComputedStyle = function(el) {
            return /*@ !window.getComputedStyle ? el.currentStyle : @*/window.getComputedStyle(el);
        },
        _createElement = function(tagName) {
            return document.createElement(tagName);
        },
        _createFragment = function() {
            return document.createDocumentFragment();
        },
        _parseFragment = (function() {
            var parser = document.createElement("body");

            /*@
            if (!document.addEventListener) {
                // Add html5 elements support via:
                // https://github.com/aFarkas/html5shiv
                (function(){
                    var elements = "abbr article aside audio bdi canvas data datalist details figcaption figure footer header hgroup main mark meter nav output progress section summary template time video",
                        // Used to skip problem elements
                        reSkip = /^<|^(?:button|map|select|textarea|object|iframe|option|optgroup)$/i,
                        // Not all elements can be cloned in IE
                        saveClones = /^(?:a|b|code|div|fieldset|h1|h2|h3|h4|h5|h6|i|label|li|ol|p|q|span|strong|style|table|tbody|td|th|tr|ul)$/i,
                        create = document.createElement,
                        frag = _createFragment(),
                        cache = {};

                    frag.appendChild(parser);

                    _createElement = function(nodeName) {
                        var node;

                        if (cache[nodeName]) {
                            node = cache[nodeName].cloneNode();
                        } else if (saveClones.test(nodeName)) {
                            node = (cache[nodeName] = create(nodeName)).cloneNode();
                        } else {
                            node = create(nodeName);
                        }

                        return node.canHaveChildren && !reSkip.test(nodeName) ? frag.appendChild(node) : node;
                    };

                    _createFragment = Function("f", "return function(){" +
                        "var n=f.cloneNode(),c=n.createElement;" +
                        "(" +
                            // unroll the `createElement` calls
                            elements.split(" ").join().replace(/\w+/g, function(nodeName) {
                                create(nodeName);
                                frag.createElement(nodeName);
                                return "c('" + nodeName + "')";
                            }) +
                        ");return n}"
                    )(frag);
                })();
            }
            @*/
            return function(html) {
                var fragment = _createFragment();

                // fix NoScope bug
                parser.innerHTML = "<br/>" + html;
                parser.removeChild(parser.firstChild);

                while (parser.firstChild) {
                    fragment.appendChild(parser.firstChild);
                }

                return fragment;
            };
        })();
});