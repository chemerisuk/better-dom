import { WINDOW, DOCUMENT, JSCRIPT_VERSION } from "../const";

var arrayProto = Array.prototype;

export function computeStyle(node) {
    /* istanbul ignore if */
    if (JSCRIPT_VERSION < 9) {
        return node.currentStyle;
    } else {
        return node.ownerDocument.defaultView.getComputedStyle(node);
    }
}

export function injectElement(node) {
    if (node && node.nodeType === 1) {
        return node.ownerDocument.getElementsByTagName("head")[0].appendChild(node);
    }
}

export function safeCall(context, fn, arg1, arg2) {
    if (typeof fn === "string") fn = context[fn];

    try {
        return fn.call(context, arg1, arg2);
    } catch (err) {
        /* istanbul ignore next */
        WINDOW.setTimeout(() => { throw err }, 1);

        return false;
    }
}

export default {
    // utilites
    every: arrayProto.every,
    each: arrayProto.forEach,
    filter: arrayProto.filter,
    map: arrayProto.map,
    slice: arrayProto.slice,
    isArray: Array.isArray,
    keys: Object.keys
};
