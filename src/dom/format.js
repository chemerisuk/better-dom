import { StaticMethodError } from "../errors";
import { DOM } from "../types";

var reVar = /\{([\w\-]+)\}/g;

/**
 * Formats template using a variables map
 * @memberof DOM
 * @alias DOM.format
 * @param  {String}  template  template string
 * @param  {Object}  varMap    key/value map of variables
 * @return {String}  a resulting string
 * @example
 * DOM.format("foo {name}", {name: "bar"}); // => "foo bar"
 * DOM.format("your {0}", ["title"]); // => "your title"
 */
DOM.format = function(template, varMap) {
    if (typeof template !== "string" || varMap && typeof varMap !== "object") {
        throw new StaticMethodError("format");
    }

    return template.replace(reVar, (x, name) => name in varMap ? String(varMap[name]) : x);
};
