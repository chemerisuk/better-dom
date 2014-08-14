import { MethodError } from "../errors";
import { WINDOW } from "../constants";
import { $Element } from "../types";

/**
 * Make a safe method/function call
 * @memberof! $Element#
 * @alias $Element#dispatch
 * @param  {String|Function}  method  name of method or function for a safe call
 * @param  {...Object}        [args]  extra arguments to pass into each invokation
 * @return {Object} result of the invokation which is undefined if there was an exception
 */
$Element.prototype.dispatch = function(method, ...args) {
    var context = this,
        node = this._._node;

    if (node) {
        if (typeof method === "string") {
            context = node;
            method = node[method];
        }

        if (typeof method !== "function") throw new MethodError("dispatch");

        try {
            return method.apply(context, args);
        } catch (err) {
            if ("console" in WINDOW) WINDOW.console.error(err);
        }
    }
};
