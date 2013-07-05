define(["Element"], function(DOMElement, _extend, _forIn, _map, _forEach, _slice, _forOwn, _makeError, _some, _every, _filter, _foldl, _foldr) {
    "use strict";

    // DOM COLLECTION
    // --------------

    /**
     * Read-only array-like collection of elements
     * @name DOMCollection
     * @constructor
     * @private
     */
    function DOMCollection(elements) {
        Array.prototype.push.apply(this, _map(elements, DOMElement));
    }

    DOMCollection.prototype = new DOMElement();
    DOMCollection.prototype.constructor = DOMCollection;

    _forIn(DOMCollection.prototype, function(value, key, proto) {
        if (typeof value !== "function") return;

        if (~value.toString().indexOf("return this;")) {
            proto[key] = function() {
                var args = arguments;

                _forEach(this, function(el) {
                    value.apply(el, args);
                });

                return this;
            };
        } else {
            proto[key] = function() {};
        }
    });

    _extend(DOMElement.prototype, {
        /**
         * Executes callback on each element in the collection
         * @memberOf DOMElement.prototype
         * @param  {Function} callback callback function
         * @param  {Object}   [thisArg]  callback context
         * @return {DOMElement}
         */
        each: function(callback, thisArg) {
            return _forEach(this, callback, thisArg);
        },

        /**
         * (alias: <b>any</b>) Checks if the callback returns true for any element in the collection
         * @memberOf DOMElement.prototype
         * @param  {Function} callback   callback function
         * @param  {Object}   [thisArg]  callback context
         * @return {Boolean} true, if any element in the collection return true
         */
        some: function(callback, thisArg) {
            return _some(this, callback, thisArg);
        },

        /**
         * (alias: <b>all</b>) Checks if the callback returns true for all elements in the collection
         * @memberOf DOMElement.prototype
         * @param  {Function} callback   callback function
         * @param  {Object}   [thisArg]  callback context
         * @return {Boolean} true, if all elements in the collection returns true
         */
        every: function(callback, thisArg) {
            return _every(this, callback, thisArg);
        },

        /**
         * (alias: <b>collect</b>) Creates an array of values by running each element in the collection through the callback
         * @memberOf DOMElement.prototype
         * @param  {Function} callback   callback function
         * @param  {Object}   [thisArg]  callback context
         * @return {Array} new array of the results of each callback execution
         */
        map: function(callback, thisArg) {
            return _map(this, callback, thisArg);
        },

        /**
         * (alias: <b>select</b>) Examines each element in a collection, returning an array of all elements the callback returns truthy for
         * @memberOf DOMElement.prototype
         * @param  {Function} callback   callback function
         * @param  {Object}   [thisArg]  callback context
         * @return {DOMElement} new DOMCollection of elements that passed the callback check
         */
        filter: function(callback, thisArg) {
            return new DOMCollection(_filter(this, callback, thisArg));
        },

        /**
         * (alias: <b>foldl</b>) Boils down a list of values into a single value (from start to end)
         * @memberOf DOMElement.prototype
         * @param  {Function} callback callback function
         * @param  {Object}   memo     initial value of the accumulator
         * @return {Object} the accumulated value
         */
        reduce: function(callback, memo) {
            return _foldl(this, callback, memo);
        },

        /**
         * (alias: <b>foldr</b>) Boils down a list of values into a single value (from end to start)
         * @memberOf DOMElement.prototype
         * @param  {Function} callback callback function
         * @param  {Object}   memo     initial value of the accumulator
         * @return {Object} the accumulated value
         */
        reduceRight: function(callback, memo) {
            return _foldr(this, callback, memo);
        },

        /**
         * Calls the method named by name on each element in the collection
         * @memberOf DOMElement.prototype
         * @param  {String}    name   name of the method
         * @param  {...Object} [args] arguments for the method call
         * @return {DOMElement}
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
    }, DOMElement.prototype);
});
