import _ from "./utils";
import DOM from "./dom";

var reVar = /\{([\w\-]+)\}/g;

/**
 * Formats template using a variables map
 * @memberOf DOM
 * @param  {String}  tmpl    template string
 * @param  {Object}  varMap  key/value map of variables
 * @return {String}  result string
 */
DOM.format = (tmpl, varMap) => {
    if (typeof tmpl !== "string" || varMap && typeof varMap !== "object") throw _.makeError("format", true);

    return tmpl.replace(reVar, (x, name) => name in varMap ? String(varMap[name]) : x);
};
