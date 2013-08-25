define(["Element", "CompositeElement"], function($Element, $CompositeElement, _extend, _forIn, _map, _forEach, _slice, _forOwn, _makeError, _some, _every, _filter, _foldl, _foldr) {
    "use strict";

    // ELEMENT COLLECTION EXTESIONS
    // ----------------------------

    _extend($Element.prototype, {
        /**
         * Executes callback on each element in the collection
         * @memberOf $Element.prototype
         * @param  {Function} callback callback function
         * @param  {Object}   [context]  callback context
         * @return {$Element}
         */
        each: function(callback, context) {
            return _forEach(this, callback, context);
        },

        /**
         * (alias: <b>any</b>) Checks if the callback returns true for any element in the collection
         * @memberOf $Element.prototype
         * @param  {Function} callback   callback function
         * @param  {Object}   [context]  callback context
         * @return {Boolean} true, if any element in the collection return true
         */
        some: function(callback, context) {
            return _some(this, callback, context);
        },

        /**
         * (alias: <b>all</b>) Checks if the callback returns true for all elements in the collection
         * @memberOf $Element.prototype
         * @param  {Function} callback   callback function
         * @param  {Object}   [context]  callback context
         * @return {Boolean} true, if all elements in the collection returns true
         */
        every: function(callback, context) {
            return _every(this, callback, context);
        },

        /**
         * (alias: <b>collect</b>) Creates an array of values by running each element in the collection through the callback
         * @memberOf $Element.prototype
         * @param  {Function} callback   callback function
         * @param  {Object}   [context]  callback context
         * @return {Array} new array of the results of each callback execution
         */
        map: function(callback, context) {
            return _map(this, callback, context);
        },

        /**
         * (alias: <b>select</b>) Examines each element in a collection, returning an array of all elements the callback returns truthy for
         * @memberOf $Element.prototype
         * @param  {Function} callback   callback function
         * @param  {Object}   [context]  callback context
         * @return {Array} new array with elements where callback returned true
         */
        filter: function(callback, context) {
            return _filter(this, callback, context);
        },

        /**
         * (alias: <b>foldl</b>) Boils down a list of values into a single value (from start to end)
         * @memberOf $Element.prototype
         * @param  {Function} callback callback function
         * @param  {Object}   memo     initial value of the accumulator
         * @return {Object} the accumulated value
         */
        reduce: function(callback, memo) {
            return _foldl(this, callback, memo);
        },

        /**
         * (alias: <b>foldr</b>) Boils down a list of values into a single value (from end to start)
         * @memberOf $Element.prototype
         * @param  {Function} callback callback function
         * @param  {Object}   memo     initial value of the accumulator
         * @return {Object} the accumulated value
         */
        reduceRight: function(callback, memo) {
            return _foldr(this, callback, memo);
        },

        /**
         * Calls the method named by name on each element in the collection
         * @memberOf $Element.prototype
         * @param  {String}    name   name of the method
         * @param  {...Object} [args] arguments for the method call
         * @return {$Element}
         */
        invoke: function(name) {
            var args = _slice(arguments, 1);

            if (typeof name !== "string") {
                throw _makeError("invoke", this);
            }

            return _forEach(this, function(el) {
                if (args.length) {
                    el[name].apply(el, args);
                } else {
                    el[name]();
                }
            });
        }
    });

    // aliases
    _forOwn({
        all: "every",
        any: "some",
        collect: "map",
        select: "filter",
        foldl: "reduce",
        foldr: "reduceRight"
    }, function(value, key) {
        this[key] = this[value];
    }, $Element.prototype);
});
