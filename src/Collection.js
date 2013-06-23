define(["Element"], function(DOMElement, _map, _forEach, _slice, _forIn, _makeError, _some, _every, _filter, _foldl, _foldr) {
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

    DOMCollection.prototype = {
        constructor: DOMCollection,
        
        /**
         * Executes callback on each element in the collection
         * @memberOf DOMCollection.prototype
         * @param  {Function} callback callback function
         * @param  {Object}   [thisArg]  callback context
         * @return {DOMCollection}
         */
        each: function(callback, thisArg) {
            _forEach(this, callback, thisArg);

            return this;
        },

        /**
         * Checks if the callback returns true for any element in the collection
         * @memberOf DOMCollection.prototype
         * @param  {Function} callback   callback function
         * @param  {Object}   [thisArg]  callback context
         * @return {Boolean} true, if any element in the collection return true
         */
        some: function(callback, thisArg) {
            return _some(this, callback, thisArg);
        },

        /**
         * Checks if the callback returns true for all elements in the collection
         * @memberOf DOMCollection.prototype
         * @param  {Function} callback   callback function
         * @param  {Object}   [thisArg]  callback context
         * @return {Boolean} true, if all elements in the collection returns true
         */
        every: function(callback, thisArg) {
            return _every(this, callback, thisArg);
        },

        /**
         * Creates an array of values by running each element in the collection through the callback
         * @param  {Function} callback   callback function
         * @param  {Object}   [thisArg]  callback context
         * @return {Array} new array of the results of each callback execution
         */
        map: function(callback, thisArg) {
            return _map(this, callback, thisArg);
        },

        /**
         * Examines each element in a collection, returning an array of all elements the callback returns truthy for
         * @param  {Function} callback   callback function
         * @param  {Object}   [thisArg]  callback context
         * @return {DOMCollection} new DOMCollection of elements that passed the callback check
         */
        filter: function(callback, thisArg) {
            return new DOMCollection(_filter(this, callback, thisArg));
        },

        /**
         * Boils down a list of values into a single value (from start to end)
         * @param  {Function} callback callback function
         * @param  {Object}   memo     initial value of the accumulator
         * @return {Object} the accumulated value
         */
        foldl: function(callback, memo) {
            return _foldl(this, callback, memo);
        },

        /**
         * Boils down a list of values into a single value (from end to start)
         * @param  {Function} callback callback function
         * @param  {Object}   memo     initial value of the accumulator
         * @return {Object} the accumulated value
         */
        foldr: function(callback, memo) {
            return _foldr(this, callback, memo);
        }
    };

    // aliases
    DOMCollection.prototype.reduce = DOMCollection.prototype.foldl;

    // shortcuts
    _forIn(DOMElement.prototype, function(value, key) {
        if (~("" + value).indexOf("return this;")) {
            var functor = function(el) { el[key].apply(el, this); };

            DOMCollection.prototype[key] = function() {
                return this.each(functor, arguments);
            };
        }
    });
});
