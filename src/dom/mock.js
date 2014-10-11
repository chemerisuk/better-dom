import _ from "../util/index";
import { $NullElement, DOM } from "../types";
import extensions from "./extend";

var applyExtensions = (node) => {
        extensions.forEach((ext, index) => { if (ext.accept(node, index)) ext(node, true) });

        _.each.call(node.children, applyExtensions);
    },
    makeMethod = (all) => function(content, varMap) {
        if (!content) return new $NullElement();

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
 * Also exposes private functions that do not usually exist
 * Accept same arguments as {@link DOM.create}
 * @memberof DOM
 * @alias DOM.mock
 * @param  {String}       value     EmmetString or HTMLString
 * @param  {Object|Array} [varMap]  key/value map of variables
 * @return {$Element} a mocked instance
 * @function
 * @see DOM.create
 */
DOM.mock = makeMethod("");

/**
 * Return Array of {@link $Element} initialized with all existing live extensions.
 * Also exposes private functions that do not usually exist
 * Accept same arguments as {@link DOM.createAll}
 * @memberof DOM
 * @alias DOM.mockAll
 * @param  {String}       value     EmmetString or HTMLString
 * @param  {Object|Array} [varMap]  key/value map of variables
 * @return {Array.<$Element>} an array of mocked element wrappers
 * @function
 * @see DOM.createAll
 */
DOM.mockAll = makeMethod("All");
