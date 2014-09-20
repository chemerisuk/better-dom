import { WINDOW, DOCUMENT } from "../const";

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
    filter: arrayProto.filter,
    map: arrayProto.map,
    isArray: Array.isArray,
    keys: Object.keys,
    assign: (target, source) => {
        Object.keys(source).forEach((key) => {
            target[key] = source[key];
        });

        return target;
    },
    defer: (func) => {
        return WINDOW.setTimeout(func, 1);
    }
};
