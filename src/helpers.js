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
    slice: arrayProto.slice,
    every: arrayProto.every,
    each: arrayProto.forEach,
    map: arrayProto.map,
    isArray: Array.isArray,
    keys: Object.keys
};
