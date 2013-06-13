define(["Element"], function(DOMElement, _map, _forEach, _slice, _forIn, _makeError) {
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

    DOMCollection.prototype = {
        constructor: DOMCollection,
        
        /**
         * Executes callback on each element in the collection
         * @memberOf DOMCollection.prototype
         * @param  {Function} callback callback function
         * @param  {Object}   [thisArg]  callback context
         * @return {DOMCollection} reference to this
         */
        each: function(callback, thisArg) {
            _forEach(this, callback, thisArg || this);

            return this;
        },

        /**
         * Calls the method named by name on each element in the collection
         * @memberOf DOMCollection.prototype
         * @param  {String}    name   name of the method
         * @param  {...Object} [args] arguments for the method call
         * @return {DOMCollection} reference to this
         */
        invoke: function(name) {
            var args = _slice(arguments, 1);

            if (typeof name !== "string") {
                throw _makeError("invoke", this);
            }

            _forEach(this, function(el) {
                el[name].apply(el, args);
            });

            return this;
        }
    };

    // shortcuts
    _forIn(DOMElement.prototype, function(value, key) {
        if (~("" + value).indexOf("return this;")) {
            var args = [key];

            DOMCollection.prototype[key] = function() {
                return this.invoke.apply(this, args.concat(_slice(arguments)));
            };
        }
    });
});
