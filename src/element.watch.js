import { $Element } from "./index";

/**
 * Watch for changes of a particular property/attribute
 * @memberof! $Element#
 * @alias $Element#watch
 * @param  {String}   name     property/attribute name
 * @param  {Function} callback watch callback the accepts (newValue, oldValue, name)
 * @return {$Element}
 */
$Element.prototype.watch = function(name, callback) {
    return this.each((el) => {
        var watchers = el._._watchers;

        if (!watchers) el._._watchers = watchers = {};

        (watchers[name] || (watchers[name] = [])).push(callback);
    });
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
    var eq = (w) => w !== callback;

    return this.each((el) => {
        var watchers = el._._watchers;

        if (watchers) watchers[name] = (watchers[name] || []).filter(eq);
    });
};
