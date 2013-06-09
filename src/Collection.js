define(["Element"], function(DOMElement, slice, _forEach, _some, _slice, _makeError) {
    "use strict";

    // DOMCollection
    // --------------------

    /**
     * Read-only array-like collection of elements
     * @name DOMCollection
     * @constructor
     * @private
     */
    // jshint unused:false
    var DOMCollection = (function(){
        var initialize = function(element, index) {
                this[index] = DOMElement(element);
            },
            DOMCollection = function(elements) {
                elements = elements || [];

                this.length = elements.length;
            
                _forEach(elements, initialize, this);
            },
            props;

        DOMCollection.prototype = [];

        // clean DOMCollection prototype
        if (Object.getOwnPropertyNames) {
            props = Object.getOwnPropertyNames(Array.prototype);
        } else {
            props = "toLocaleString join pop push concat reverse shift unshift slice splice sort indexOf lastIndexOf".split(" ");
        }
        
        _forEach(props, function(key) {
            if (key !== "length") DOMCollection.prototype[key] = undefined;
        });

        /**
         * Number of elements in the collection
         * @memberOf DOMCollection.prototype
         * @type {Number}
         */
        DOMCollection.prototype.length = 0;

        /**
         * Executes callback on each element in the collection
         * @memberOf DOMCollection.prototype
         * @param  {Function} callback callback function
         * @param  {Object}   [thisArg]  callback context
         * @return {DOMCollection} reference to this
         */
        DOMCollection.prototype.each = function(callback, thisArg) {
            _some(this, callback, thisArg || this);

            return this;
        };

        /**
         * Calls the method named by name on each element in the collection
         * @memberOf DOMCollection.prototype
         * @param  {String}    name   name of the method
         * @param  {...Object} [args] arguments for the method call
         * @return {DOMCollection} reference to this
         */
        DOMCollection.prototype.invoke = function(name) {
            var args = _slice(arguments, 1);

            if (typeof name !== "string") {
                throw _makeError("invoke", this);
            }

            _forEach(this, function(el) {
                el[name].apply(el, args);
            });

            return this;
        };

        return DOMCollection;
    }());
});
