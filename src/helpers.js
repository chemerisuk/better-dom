import { WINDOW, DOCUMENT } from "./constants";

var arrayProto = Array.prototype,
    currentScript = DOCUMENT.scripts[0];

export default {
    computeStyle: (node) => {
        return WINDOW.getComputedStyle ? WINDOW.getComputedStyle(node) : node.currentStyle;
    },
    injectElement: (el) => {
        return currentScript.parentNode.insertBefore(el, currentScript);
    },
    // utilites
    every: arrayProto.every,
    each: arrayProto.forEach,
    isArray: Array.isArray,
    keys: Object.keys,
    assign: (target, source) => {
        Object.keys(source).forEach((key) => {
            target[key] = source[key];
        });

        return target;
    }
};
