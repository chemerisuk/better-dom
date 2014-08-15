import { $Element } from "../types";

/**
 * Watch for changes of a particular property/attribute
 * @memberof! $Element#
 * @alias $Element#watch
 * @param  {String}   name     property/attribute name
 * @param  {Function} callback watch callback the accepts (newValue, oldValue, name)
 * @return {$Element}
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
 * @param  {String}   name    property/attribute name
 * @param  {Function} callback watch callback the accepts (name, newValue, oldValue)
 * @return {$Element}
 */
$Element.prototype.unwatch = function(name, callback) {
    var watchers = this._._watchers;

    if (watchers[name]) {
        watchers[name] = watchers[name].filter((w) => w !== callback);
    }

    return this;
};
