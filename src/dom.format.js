import _ from "./util/index";
import { DOM } from "./index";

var reVar = /\{([\w\-]+)\}/g;

/**
 * Formats template using a variables map
 * @memberof DOM
 * @alias DOM.format
 * @param  {String}  template  template string
 * @param  {Object}  varMap    key/value map of variables
 * @return {String}  result string
 */
DOM.format = function(template, varMap) {
    if (typeof template !== "string" || varMap && typeof varMap !== "object") throw _.makeError("format", true);

    return template.replace(reVar, (x, name) => name in varMap ? String(varMap[name]) : x);
};
