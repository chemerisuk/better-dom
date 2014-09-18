import _ from "../helpers";
import { $Element, DOM } from "../types";
import extensions from "./extend";

var applyExtensions = (node) => {
        extensions.forEach((ext) => { if (ext.accept(node)) ext(node, true) });

        _.each.call(node.children, applyExtensions);
    },
    makeMethod = (all) => function(content, varMap) {
        if (!content) return new $Element();

        var result = DOM["create" + all](content, varMap);

        if (all) {
            result.forEach((el) => { applyExtensions(el[0]) });
        } else {
            applyExtensions(result[0]);
        }

        return result;
    };

/**
 * Return {@link $Element} initialized with all existing live extensions.
 * Also exposes private event handler functions that aren't usually presented
 * @memberof DOM
 * @alias DOM.mock
 * @param  {String}       value     EmmetString or HTMLString
 * @param  {Object|Array} [varMap]  key/value map of variables
 * @return {$Element} mocked instance
 * @function
 */
DOM.mock = makeMethod("");

/**
 * Return Array of {@link $Element} initialized with all existing live extensions.
 * Also exposes private event handler functions that aren't usually presented
 * @memberof DOM
 * @alias DOM.mockAll
 * @param  {String}       value     EmmetString or HTMLString
 * @param  {Object|Array} [varMap]  key/value map of variables
 * @return {Array.<$Element>} an array of element wrappers
 * @function
 */
DOM.mockAll = makeMethod("All");
