define(["Element"], function(DOMElement) {
    "use strict";

    // DOMElementCollection
    // --------------------

    /**
     * Prototype for collection of elements in better-dom
     * @name DOMElementCollection
     * @constructor
     */
    function DOMElementCollection(elements) {
        this._nodes = _.map(elements || [], DOMElement);
        this.length = this._nodes.length;
    }

    (function() {
        function makeCollectionMethod(name) {
            var process = DOMElement.prototype[name];

            return function() {
                var args = _.slice(arguments);

                return this.each(function(elem) {
                    process.apply(elem, args);
                });
            };
        }

        DOMElementCollection.prototype = {
            /**
             * Execute callback for each element in collection
             * @memberOf DOMElementCollection.prototype
             * @param  {Function} callback action to execute
             * @return {DOMElementCollection} reference to this
             */
            each: function(callback) {
                _.forEach(this._nodes, callback, this);

                return this;
            },

            /**
             * Shortcut to {@link DOMNode#on} method
             * @memberOf DOMElementCollection.prototype
             * @param  {String}   event    event type
             * @param  {String}   [selector] css selector to filter
             * @param  {Function} callback event handler
             * @return {DOMElementCollection} reference to this
             * @function
             * @see DOMElement#on
             */
            on: makeCollectionMethod("on"),

            /**
             * Shortcut to {@link DOMNode#off} method
             * @memberOf DOMElementCollection.prototype
             * @param  {String}   eventType event type
             * @param  {Function} [callback]  event handler
             * @return {DOMElementCollection} reference to this
             * @function
             * @see DOMElement#off
             */
            off: makeCollectionMethod("off"),

            /**
             * Shortcut to {@link DOMNode#fire} method
             * @memberOf DOMElementCollection.prototype
             * @param  {String} eventType type of event
             * @param  {Object} [detail] data to attach
             * @return {DOMElementCollection} reference to this
             * @function
             * @see DOMElement#fire
             */
            fire: makeCollectionMethod("fire"),

            /**
             * Shortcut to {@link DOMNode#setData} method
             * @memberOf DOMElementCollection.prototype
             * @param {String|Object} key data entry key | key/value pairs
             * @param {Object} value data to store
             * @return {DOMElementCollection} reference to this
             * @function
             * @see DOMElement#setData
             */
            setData: makeCollectionMethod("setData"),

            /**
             * Shortcut to {@link DOMElement#set} method
             * @memberOf DOMElementCollection.prototype
             * @param {String} name  property/attribute name
             * @param {String} value property/attribute value
             * @return {DOMElementCollection} reference to this
             * @function
             * @see DOMElement#set
             */
            set: makeCollectionMethod("set"),

            /**
             * Shortcut to {@link DOMElement#setStyle} method
             * @memberOf DOMElementCollection.prototype
             * @param {String} name  property name
             * @param {String} value property value
             * @return {DOMElementCollection} reference to this
             * @function
             * @see DOMElement#setStyle
             */
            setStyle: makeCollectionMethod("setStyle"),

            /**
             * Shortcut to {@link DOMElement#addClass} method
             * @memberOf DOMElementCollection
             * @param {String} classNames space-separated class name(s)
             * @return {DOMElementCollection} reference to this
             * @function
             * @see DOMElement#addClass
             */
            addClass: makeCollectionMethod("addClass"),

            /**
             * Shortcut to {@link DOMElement#removeClass} method
             * @memberOf DOMElementCollection.prototype
             * @param {String} classNames space-separated class name(s)
             * @return {DOMElementCollection} reference to this
             * @function
             * @see DOMElement#removeClass
             */
            removeClass: makeCollectionMethod("removeClass"),

            /**
             * Shortcut to {@link DOMElement#toggleClass} method
             * @memberOf DOMElementCollection.prototype
             * @param {String} classNames space-separated class name(s)
             * @return {DOMElementCollection} reference to this
             * @function
             * @see DOMElement#toggleClass
             */
            toggleClass: makeCollectionMethod("toggleClass")
        };
    })();
});