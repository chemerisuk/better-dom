var doc = document,
    win = window,
    userAgent = win.navigator.userAgent,
    currentScript = doc.scripts[0];

export default {
    makeError: (method, DOM) => {
        var type = DOM ? "DOM" : "$Element";

        return TypeError(type + "." + method + " was called with illegal arguments. Check <%= pkg.docs %> to verify the function call");
    },
    computeStyle: (node) => {
        return win.getComputedStyle ? win.getComputedStyle(node) : node.currentStyle;
    },
    injectElement: (el) => {
        return currentScript.parentNode.insertBefore(el, currentScript);
    },
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
