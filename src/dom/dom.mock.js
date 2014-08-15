import _ from "../helpers";
import { $Element, DOM } from "../types";
import extensions from "./dom.extend";

var applyExtensions = (node) => {
        extensions.forEach((ext) => { if (ext.accept(node)) ext(node, true) });

        _.each.call(node.children, applyExtensions);
    };

/**
 * Return {@link $Element} initialized with all existing live extensions.
 * Also exposes private event handler functions that aren't usually presented
 * @memberof DOM
 * @alias DOM.mock
 * @param  {HTMLString} [content] string to mock
 * @return {$Element} mocked instance
 */
DOM.mock = function(content, varMap, /*INTERNAL*/all) {
    if (!content) return new $Element();

    var result = DOM.create(content, varMap, all);

    if (all) {
        result.forEach((el) => { el.each((_, node) => { applyExtensions(node) }) });
    } else {
        result.each((_, node) => { applyExtensions(node) });
    }

    return result;
};

/**
 * Return Array of {@link $Element} initialized with all existing live extensions.
 * Also exposes private event handler functions that aren't usually presented
 * @memberof DOM
 * @alias DOM.mockAll
 * @param  {HTMLString} [content] string to mock
 * @return {Array} collection of mocked {@link $Element} instances
 */
DOM.mockAll = function(content, varMap) {
    return DOM.mock(content, varMap, true);
};
