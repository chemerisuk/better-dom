import { $Element } from "../types";

/**
 * Callback function for watching changes of a property/attribute
 * @callback watchCallback
 * @param {Object} newValue a current value
 * @param {Object} oldValue a previous value
 */

/**
 * Watch for changes of a particular property/attribute
 * @memberof! $Element#
 * @alias $Element#watch
 * @param  {String}        name     property/attribute name
 * @param  {watchCallback} callback function for watching changes of the property/attribute
 * @return {$Element}
 * @example
 * targetInput.watch("value", function(value, oldValue) {
 *   // do what you want AFTER the value of targetInput was changed
 * });
 */
$Element.prototype.watch = function(name, callback) {
    var watchers = this._._watchers;

    if (!watchers[name]) watchers[name] = [];

    watchers[name].push(callback);

    return this;
};

/**
 * Disable watching of a particular property/attribute
 * @memberof! $Element#
 * @alias $Element#unwatch
 * @param  {String}        name     property/attribute name
 * @param  {watchCallback} callback function for watching changes of the property/attribute
 * @return {$Element}
 */
$Element.prototype.unwatch = function(name, callback) {
    var watchers = this._._watchers;

    if (watchers[name]) {
        watchers[name] = watchers[name].filter((w) => w !== callback);
    }

    return this;
};
