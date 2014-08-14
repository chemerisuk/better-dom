import _ from "../util/index";
import { StaticMethodError } from "../errors";
import { DOCUMENT } from "../constants";
import { DOM } from "../types";

/**
 * Import external scripts on the page and call optional callback when it will be done
 * @memberof DOM
 * @alias DOM.importScripts
 * @param {...String} urls       script file urls
 * @param {Function}  [callback] callback that is triggered when all scripts are loaded
 */
DOM.importScripts = function(...urls) {
    var callback = function() {
        var arg = urls.shift(),
            argType = typeof arg,
            script;

        if (argType === "string") {
            script = DOCUMENT.createElement("script");
            script.src = arg;
            script.onload = callback;
            script.async = true;

            _.injectElement(script);
        } else if (argType === "function") {
            arg();
        } else if (arg) {
            throw new StaticMethodError("importScripts");
        }
    };

    callback();
};
