import { $Document } from "../document/index";
import { injectElement } from "../util/index";
import { DocumentTypeError } from "../errors";

/**
 * Import external scripts on the page and call optional callback when it will be done
 * @param {...String}  url       script file url(s)
 * @param {Function}  [callback] callback that is triggered when all scripts are loaded
 * @example
 * DOM.importScripts("http://cdn/script1.js", function() {
 *     // do something when the script is loaded
 * });
 * // loading several scripts sequentially
 * DOM.importScripts("http://cdn/script2.js", "http://cdn/script3.js");
 */
$Document.prototype.importScripts = function(...urls) {
    var callback = () => {
        const node = this[0];

        if (!node) return;

        var arg = urls.shift(),
            argType = typeof arg,
            script;

        if (argType === "string") {
            script = node.createElement("script");
            script.src = arg;
            script.onload = callback;
            script.async = true;

            injectElement(script);
        } else if (argType === "function") {
            arg();
        } else if (arg) {
            throw new DocumentTypeError("importScripts", arguments);
        }
    };

    callback();
};
