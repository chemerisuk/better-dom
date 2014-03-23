var doc = document,
    win = window,
    userAgent = win.navigator.userAgent,
    currentScript = doc.scripts[0],
    reVar = /\{([\w\-]+)\}/g;

export default {
    makeError: (method, DOM) => {
        var type = DOM ? "DOM" : "$Element";

        return TypeError(type + "." + method + " was called with illegal arguments. Check <%= pkg.docs %> to verify the function call");
    },
    computeStyle: (node) => {
        return window.getComputedStyle ? window.getComputedStyle(node) : node.currentStyle;
    },
    injectElement: (el) => {
        return currentScript.parentNode.insertBefore(el, currentScript);
    },
    format: (template, varMap) => {
        return template.replace(reVar, (x, name) => name in varMap ? varMap[name] : x);
    },
    raf: (function() {
        var lastTime = 0,
            propName = ["r", "webkitR", "mozR", "oR"].reduce((memo, name) => {
                var prop = name + "equestAnimationFrame";

                return memo || window[prop] && prop;
            }, null);

        if (propName) {
            return (callback) => { window[propName](callback) };
        } else {
            return (callback) => {
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
    LEGACY_ANDROID: ~userAgent.indexOf("Android") && userAgent.indexOf("Chrome") < 0,
    DOM2_EVENTS: !!doc.addEventListener,
    WEBKIT_PREFIX: win.WebKitAnimationEvent ? "-webkit-" : "",
    // utilites
    forOwn: (obj, fn, thisPtr) => {
        Object.keys(obj).forEach((key) => { fn.call(thisPtr, obj[key], key) });

        return thisPtr;
    },
    slice: Array.prototype.slice,
    every: Array.prototype.every,
    each: Array.prototype.forEach,
    some: Array.prototype.some
};
