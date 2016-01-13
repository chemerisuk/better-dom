import { register, injectElement } from "../util/index";
import { DocumentTypeError } from "../errors";

register({
    /**
     * Import external scripts on the page and call optional callback when it will be done
     * @memberof $Document#
     * @alias $Document#importScripts
     * @param {...String} urls       script file urls
     * @param {Function}  [callback] callback that is triggered when all scripts are loaded
     * @example
     * DOM.importScripts("http://cdn/script1.js", function() {
     *     // do something when the script is loaded
     * });
     * // loading several scripts sequentially
     * DOM.importScripts("http://cdn/script2.js", "http://cdn/script3.js");
     */
    importScripts(...urls) {
        var callback = () => {
            var arg = urls.shift(),
                argType = typeof arg,
                script;

            if (argType === "string") {
                script = this[0].createElement("script");
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
    }
});
