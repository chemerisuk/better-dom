var doc = document,
    win = window,
    currentScript = doc.scripts[0];

module.exports = {
    makeError: function(method, DOM) {
        var type = DOM ? "DOM" : "$Element";

        return TypeError(type + "." + method + " was called with illegal arguments. Check <%= pkg.docs %> to verify the function call");
    },
    computeStyle: function(node) {
        return window.getComputedStyle ? window.getComputedStyle(node) : node.currentStyle;
    },
    injectElement: function(el) {
        return currentScript.parentNode.insertBefore(el, currentScript);
    },
    raf: (function() {
        var lastTime = 0,
            propName = ["r", "webkitR", "mozR", "oR"].reduce(function(memo, name) {
                var prop = name + "equestAnimationFrame";

                return memo || window[prop] && prop;
            }, null);

        if (propName) {
            return function(callback) { window[propName](callback) };
        } else {
            return function(callback) {
                var currTime = new Date().getTime(),
                    timeToCall = Math.max(0, 16 - (currTime - lastTime));

                lastTime = currTime + timeToCall;

                if (timeToCall) {
                    setTimeout(callback, timeToCall);
                } else {
                    callback(currTime + timeToCall);
                }
            };
        }
    }()),
    // constants
    docEl: doc.documentElement,
    CSS3_ANIMATIONS: win.CSSKeyframesRule || !doc.attachEvent,
    LEGACY_ANDROID: ~navigator.userAgent.indexOf("Android 2"),
    DOM2_EVENTS: !!doc.addEventListener,
    WEBKIT_PREFIX: win.WebKitAnimationEvent ? "-webkit-" : "",
    RAF: ["r", "webkitR", "mozR", "oR"].reduce(function(memo, name) {
        var prop = name + "equestAnimationFrame";

        return memo || window[prop] && prop;
    }, null),

    // utilites
    forOwn: function(obj, fn, thisPtr) {
        Object.keys(obj).forEach(function(key) {
            fn.call(thisPtr, obj[key], key);
        });

        return thisPtr;
    },
    extend: function(obj, mixins) {
        this.forOwn(mixins || {}, function(value, key) { obj[key] = value });

        return obj;
    },
    slice: Array.prototype.slice,
    every: Array.prototype.every,
    each: Array.prototype.forEach,
    some: Array.prototype.some
};
