import _ from "../util/index";
import { $NullElement } from "../types";
import { DOM } from "../const";

/**
 * Return {@link $Element} initialized with all existing live extensions.
 * Also exposes private functions that do not usually exist. Accepts the
 * same arguments as {@link DOM.create}
 * @memberof DOM
 * @alias DOM.mock
 * @param  {String}       value     EmmetString or HTMLString
 * @param  {Object|Array} [varMap]  key/value map of variables
 * @return {$Element} a mocked instance
 * @see DOM.create
 */
DOM.mock = function(content, varMap) {
    if (!content) return new $NullElement();

    var result = DOM.create(content, varMap),
        mappings = this._["<%= prop('mappings') %>"],
        applyExtensions = (node) => {
            mappings.forEach((ext) => { ext(node, true) });

            _.each.call(node.children, applyExtensions);
        };

    applyExtensions(result[0]);

    return result;
};
