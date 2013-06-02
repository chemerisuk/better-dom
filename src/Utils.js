define([], function() {
    "use strict";

    // UTILS
    // -----

    var _ = {
        
        slice: function(list, index) {
            return Array.prototype.slice.call(list, index || 0);
        },
        forEach: function(list, callback, thisPtr) {
            for (var i = 0, n = list ? list.length : 0; i < n; ++i) {
                callback.call(thisPtr, list[i], i, list);
            }
        },
        filter: function(list, testFn, thisPtr) {
            var result = [];

            _.forEach(list, function(el, index) {
                if (testFn.call(thisPtr, el, index, list)) result.push(el);
            });

            return result;
        },
        every: function(list, testFn, thisPtr) {
            var result = true;

            _.forEach(list, function(el) {
                result = result && testFn.call(thisPtr, el, list);
            });

            return result;
        },
        some: function(list, testFn, thisPtr) {
            for (var i = 0, n = list ? list.length : 0; i < n; ++i) {
                if (testFn.call(thisPtr, list[i], i, list) === true) {
                    return true;
                }
            }

            return false;
        },
        reduce: function(list, callback, result) {
            _.forEach(list, function(el, index) {
                if (!index && result === undefined) {
                    result = el;
                } else {
                    result = callback(result, el, index, list);
                }
            });

            return result;
        },
        map: function(list, callback, thisPtr) {
            var result = [];

            _.forEach(list, function(el, index) {
                result.push(callback.call(thisPtr, el, index, list));
            });

            return result;
        },
        times: function(n, callback, thisArg) {
            for (var i = 0; i < n; ++i) {
                callback.call(thisArg, i);
            }
        },
        isArray: Array.isArray || function(obj) {
            return Object.prototype.toString.call(obj) === "[object Array]";
        },

        // Object utilites

        keys: Object.keys || function(obj) {
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
        forOwn: function(obj, callback, thisPtr) {
            for (var list = this.keys(obj), i = 0, n = list.length; i < n; ++i) {
                callback.call(thisPtr, list[i], i, obj);
            }
        },
        forIn: function(obj, callback, thisPtr) {
            for (var key in obj) {
                callback.call(thisPtr, obj[key], key, obj);
            }
        },
        extend: function(obj, name, value) {
            if (arguments.length === 3) {
                obj[name] = value;
            } else if (name) {
                _.forOwn(name, function(key) {
                    _.extend(obj, key, name[key]);
                });
            }

            return obj;
        },
        uniqueId: (function() {
            var idCounter = 0;

            return function(prefix) {
                var id = ++idCounter;
                return String(prefix || "") + id;
            };
        })()
    };
});