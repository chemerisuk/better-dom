import { $Element } from "../types";
import { MethodError } from "../errors";

/**
 * Execute callback if the element is not a dummy element
 * @memberof! $Element#
 * @alias $Element#each
 * @param  {Function} callback  function that accepts (el, node)
 * @param  {Object}   [context] callback context
 * @return {$Element}
 */
$Element.prototype.each = function(callback, context) {
    var node = this._._node;

    if (typeof callback !== "function") throw MethodError("each");

    if (node) {
        if (context) {
            callback.call(context, this, node);
        } else {
            callback(this, node);
        }
    }

    return this;
};
