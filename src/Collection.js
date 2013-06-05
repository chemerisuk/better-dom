define(["Element"], function(DOMElement, slice) {
    "use strict";

    // DOMCollection
    // --------------------

    /**
     * Prototype for collection of elements in better-dom
     * @name DOMCollection
     * @constructor
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

        DOMCollection.prototype.length = 0;
        DOMCollection.prototype.toString = function () {
            return slice.call(this).toString();
        };

        return DOMCollection;
    })();
});