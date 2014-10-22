import { DOM } from "../types";

var reVar = /\{([\w\-]+)\}/g;

/**
 * Formats template using a variables map
 * @memberof DOM
 * @alias DOM.format
 * @param  {String}  tmpl    template string
 * @param  {Object}  varMap  key/value map of variables
 * @return {String}  a resulting string
 * @example
 * DOM.format("foo {name}", {name: "bar"}); // => "foo bar"
 * DOM.format("your {0}", ["title"]); // => "your title"
 */
DOM.format = function(tmpl, varMap) {
    if (typeof tmpl !== "string") tmpl = String(tmpl);

    if (!varMap || typeof varMap !== "object") varMap = {};

    return tmpl.replace(reVar, (x, name) => name in varMap ? String(varMap[name]) : x);
};
