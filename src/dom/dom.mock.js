import _ from "../helpers";
import { $Element, DOM } from "../types";
import extensions from "./dom.extend";

function applyExtensions(node) {
    extensions.forEach((ext) => { if (ext.accept(node)) ext(node, true) });

    _.each.call(node.children, applyExtensions);
}

/**
 * Return {@link $Element} initialized with all existing live extensions.
 * Also exposes private event handler functions that aren't usually presented
 * @memberof DOM
 * @alias DOM.mock
 * @param  {String}       value     EmmetString or HTMLString
 * @param  {Object|Array} [varMap]  key/value map of variables
 * @return {$Element} mocked instance
 */
DOM.mock = function(content, varMap, /*INTERNAL*/all) {
    if (!content) return new $Element();

    var result = DOM.create(content, varMap, all);

    if (all) {
        result.forEach((el) => { applyExtensions(el[0]) });
    } else {
        applyExtensions(result[0]);
    }

    return result;
};

/**
 * Return Array of {@link $Element} initialized with all existing live extensions.
 * Also exposes private event handler functions that aren't usually presented
 * @memberof DOM
 * @alias DOM.mockAll
 * @param  {String}       value     EmmetString or HTMLString
 * @param  {Object|Array} [varMap]  key/value map of variables
 * @return {Array.<$Element>} an array of element wrappers
 */
DOM.mockAll = function(content, varMap) {
    return DOM.mock(content, varMap, true);
};
