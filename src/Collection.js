define(["Element"], function(DOMElement, slice) {
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
            
                _.forEach(elements, initialize, this);
            },
            props;

        DOMCollection.prototype = [];

        /*@
        if (Object.getOwnPropertyNames) {
        @*/
        props = Object.getOwnPropertyNames(Array.prototype);
        /*@
        } else {
            props = ["toLocaleString", "join", "pop", "push", "concat", "reverse", "shift", "unshift", "slice", "splice", "sort", "indexOf", "lastIndexOf"];
        }
        @*/

        _.forEach(props, function(key) {
            if (key !== "length") DOMCollection.prototype[key] = undefined;
        });

        /**
         * Number of elements in the collection
         * @memberOf DOMCollection.prototype
         * @type {Number}
         */
        DOMCollection.prototype.length = 0;

        /**
         * Always returns string "DOMCollection"
         * @memberOf DOMCollection.prototype
         * @return {String} "DOMCollection" string
         */
        DOMCollection.prototype.toString = function () {
            return "DOMCollection";
        };

        return DOMCollection;
    })();
});