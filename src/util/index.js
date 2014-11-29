import { WINDOW, JSCRIPT_VERSION } from "../const";
import { $Element, $NullElement } from "../types";

var arrayProto = Array.prototype;

export default {
    computeStyle(node) {
        /* istanbul ignore if */
        if (JSCRIPT_VERSION < 9) {
            return node.currentStyle;
        } else {
            return WINDOW.getComputedStyle(node);
        }
    },
    injectElement(el) {
        if (el && el.nodeType === 1) {
            return el.ownerDocument.getElementsByTagName("head")[0].appendChild(el);
        }
    },
    // utilites
    every: arrayProto.every,
    each: arrayProto.forEach,
    filter: arrayProto.filter,
    map: arrayProto.map,
    slice: arrayProto.slice,
    isArray: Array.isArray,
    keys: Object.keys,
    safeInvoke(context, fn, arg1, arg2) {
        if (typeof fn === "string") fn = context[fn];

        try {
            return fn.call(context, arg1, arg2);
        } catch (err) {
            /* istanbul ignore next */
            WINDOW.setTimeout(() => { throw err }, 1);

            return false;
        }
    },
    register(mixins, defaultBehavior) {
        defaultBehavior = defaultBehavior || function() {};

        Object.keys(mixins).forEach((key) => {
            var defaults = defaultBehavior(key) || function() { return this };

            $Element.prototype[key] = mixins[key];
            $NullElement.prototype[key] = defaults;
        });
    },
    getLegacyFile(type) {
        /* istanbul ignore if */
        if (JSCRIPT_VERSION < 10) {
            var legacyScripts = arrayProto.filter.call(document.scripts, (el) => el.src.indexOf("better-dom-legacy.js") >= 0);

            if (legacyScripts.length < 1) {
                throw new Error("In order to use live extensions in IE < 10 you have to include extra files. See <%= pkg.repository.url %>#notes-about-old-ies for details.");
            }

            return legacyScripts[0].src.replace(".js", "." + type);
        }
    }
};
