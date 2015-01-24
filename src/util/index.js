import { WINDOW, JSCRIPT_VERSION } from "../const";
import { $Document, $Element, $NullElement } from "../types";

var arrayProto = Array.prototype;

export const every = arrayProto.every;
export const each = arrayProto.forEach;
export const filter = arrayProto.filter;
export const map = arrayProto.map;
export const slice = arrayProto.slice;
export const isArray = Array.isArray;
export const keys = Object.keys;

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

export function register(mixins, factory, defaultFactory) {
    var proto = defaultFactory ? $Element.prototype : $Document.prototype;

    if (factory == null) {
        factory = (methodName, strategy) => strategy;
    }

    keys(mixins).forEach((methodName) => {
        var args = [methodName].concat(mixins[methodName]);

        proto[methodName] = factory.apply(null, args);

        if (defaultFactory) {
            $NullElement.prototype[methodName] = defaultFactory.apply(null, args);
        }
    });
}
