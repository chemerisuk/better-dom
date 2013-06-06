define([], function() {
    "use strict";

    // UTILITES
    // --------
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
        
        _slice = function(list, index) {
            return Array.prototype.slice.call(list, index || 0);
        },
        _isArray = Array.isArray || function(obj) {
            return Object.prototype.toString.call(obj) === "[object Array]";
        },
        _forEach = function(list, callback, thisPtr) {
            for (var i = 0, n = list ? list.length : 0; i < n; ++i) {
                callback.call(thisPtr, list[i], i, list);
            }
        },
        _times = function(n, callback, thisArg) {
            for (var i = 0; i < n; ++i) {
                callback.call(thisArg, i);
            }
        },
        _foldl = function(list, callback, result) {
            _forEach(list, function(el, index) {
                if (!index && result === undefined) {
                    result = el;
                } else {
                    result = callback(result, el, index, list);
                }
            });

            return result;
        },
        _map = function(list, callback, thisPtr) {
            var result = [];

            _forEach(list, function(el, index) {
                result.push(callback.call(thisPtr, el, index, list));
            });

            return result;
        },
        _some = function(list, testFn, thisPtr) {
            for (var i = 0, n = list ? list.length : 0; i < n; ++i) {
                if (testFn.call(thisPtr, list[i], i, list) === true) {
                    return true;
                }
            }

            return false;
        },
        _every = function(list, testFn, thisPtr) {
            var result = true;

            _forEach(list, function(el) {
                result = result && testFn.call(thisPtr, el, list);
            });

            return result;
        },
        _filter = function(list, testFn, thisPtr) {
            var result = [];

            _forEach(list, function(el, index) {
                if (testFn.call(thisPtr, el, index, list)) result.push(el);
            });

            return result;
        },

        // Object utilites
        // ---------------
        
        _keys = Object.keys || function(obj) {
            var objType = typeof obj,
                result = [],
                prop;

            if (objType !== "object" && objType !== "function" || obj === null) {
                throw new TypeError("Object.keys called on non-object");
            }
     
            for (prop in obj) {
                if (Object.prototype.hasOwnProperty.call(obj, prop)) result.push(prop);
            }

            return result;
        },
        _forOwn = function(obj, callback, thisPtr) {
            for (var list = _keys(obj), i = 0, n = list.length, key; i < n; ++i) {
                key = list[i];

                callback.call(thisPtr,  obj[key], key, obj);
            }
        },
        _forIn = function(obj, callback, thisPtr) {
            for (var key in obj) {
                callback.call(thisPtr, obj[key], key, obj);
            }
        },
        _extend = function(obj, name, value) {
            if (arguments.length === 3) {
                obj[name] = value;
            } else if (name) {
                _forOwn(name, function(value, key) {
                    _extend(obj, key, value);
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