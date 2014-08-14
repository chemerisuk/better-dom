var doc = document,
    win = window,
    currentScript = doc.scripts[0];

export default {
    computeStyle: (node) => {
        return win.getComputedStyle ? win.getComputedStyle(node) : node.currentStyle;
    },
    injectElement: (el) => {
        return currentScript.parentNode.insertBefore(el, currentScript);
    },
    // utilites
    slice: Array.prototype.slice,
    every: Array.prototype.every,
    each: Array.prototype.forEach,
    some: Array.prototype.some
};
