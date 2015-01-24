import { register } from "../util/index";
import { MethodError } from "../errors";

register({
    /**
     * Invokes a function for element if it's not empty and return array of results
     * @memberof! $Element#
     * @alias $Element#map
     * @param  {Function}  fn         function to invoke
     * @param  {Object}    [context]  execution context
     * @return {Array} an empty array or array with returned value
     * @example
     * var sayHello = function() { alert("hello!") };
     *
     * DOM.find("body").map(sayHello); // show "hello!"
     * DOM.mock().map(sayHello);       // no alert is displayed
     */
    map(fn, context) {
        if (typeof fn !== "function") {
            throw new MethodError("map", arguments);
        }

        return [ fn.call(context, this) ];
    }
}, null, () => () => []);
