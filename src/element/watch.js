import { DOM } from "../const";

DOM.register({
    /**
     * Watch for changes of a particular property/attribute
     * @memberof! $Element#
     * @alias $Element#watch
     * @param  {String}    name      property/attribute name
     * @param  {Function}  callback  function for watching changes of the property/attribute
     * @return {$Element}
     * @example
     * targetInput.watch("value", function(value, oldValue) {
     *     // do what you want AFTER the value of targetInput was changed
     * });
     */
    watch(name, callback) {
        var watchers = this._["<%= prop('watcher') %>"];

        if (!watchers[name]) watchers[name] = [];

        watchers[name].push(callback);

        return this;
    },

    /**
     * Disable watching of a particular property/attribute
     * @memberof! $Element#
     * @alias $Element#unwatch
     * @param  {String}    name      property/attribute name
     * @param  {Function}  callback  function for watching changes of the property/attribute
     * @return {$Element}
     * @see $Element#watch
     */
    unwatch(name, callback) {
        var watchers = this._["<%= prop('watcher') %>"];

        if (watchers[name]) {
            watchers[name] = watchers[name].filter((w) => w !== callback);
        }

        return this;
    }
}, (methodName, strategy) => strategy, () => function() { return this });
