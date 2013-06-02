define(["Element"], function(DOMElement, slice) {
    "use strict";

    // CLASSES MANIPULATION
    // --------------------

    (function() {
        var rclass = /[\n\t\r]/g;

        function makeClassesMethod(nativeStrategyName, strategy) {
            var methodName = nativeStrategyName === "contains" ? "hasClass" : nativeStrategyName + "Class";

            return function() {
                var result = true;

                _.forEach(slice.call(arguments), function(className) {
                    if (typeof className !== "string") throw this.makeError(methodName);

                    if (this._node.classList) {
                        result = this._node.classList[nativeStrategyName](className) && result;
                    } else {
                        result = strategy.call(this, className) && result;
                    }
                }, this);

                return nativeStrategyName === "contains" ? result : this;
            };
        }

        /**
         * Check if element contains class name(s)
         * @memberOf DOMElement.prototype
         * @param  {...String} classNames class name(s)
         * @return {Boolean}   true if the element contains all classes
         * @function
         */
        DOMElement.prototype.hasClass = makeClassesMethod("contains", function(className) {
            return !!~((" " + this._node.className + " ")
                        .replace(rclass, " ")).indexOf(" " + className + " ");
        });

        /**
         * Add class(es) to element
         * @memberOf DOMElement.prototype
         * @param  {...String}  classNames class name(s)
         * @return {DOMElement} reference to this
         * @function
         */
        DOMElement.prototype.addClass = makeClassesMethod("add", function(className) {
            if (!this.hasClass(className)) {
                this._node.className += " " + className;
            }
        });

        /**
         * Remove class(es) from element
         * @memberOf DOMElement.prototype
         * @param  {...String}  classNames class name(s)
         * @return {DOMElement} reference to this
         * @function
         */
        DOMElement.prototype.removeClass = makeClassesMethod("remove", function(className) {
            className = (" " + this._node.className + " ")
                    .replace(rclass, " ").replace(" " + className + " ", " ");

            this._node.className = className.substr(className[0] === " " ? 1 : 0, className.length - 2);
        });

        /**
         * Toggle class(es) on element
         * @memberOf DOMElement.prototype
         * @param  {...String}  classNames class name(s)
         * @return {DOMElement} reference to this
         * @function
         */
        DOMElement.prototype.toggleClass = makeClassesMethod("toggle", function(className) {
            var oldClassName = this._node.className;

            this.addClass(className);

            if (oldClassName === this._node.className) {
                this.removeClass(className);
            }
        });
    })();
});