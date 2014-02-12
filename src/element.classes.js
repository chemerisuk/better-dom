/**
 * Class manipulation support
 * @module classes
 */
var _ = require("./utils"),
    $Element = require("./element"),
    rclass = /[\n\t\r]/g;

function makeClassesMethod(nativeStrategyName, strategy) {
    var methodName = nativeStrategyName === "contains" ? "hasClass" : nativeStrategyName + "Class";

    if (_.docEl.classList) {
        strategy = function(className) {
            return this._node.classList[nativeStrategyName](className);
        };
    }

    if (methodName === "hasClass") {
        return function(className) {
            var args = arguments;

            if (this._node) {
                if (args.length === 1) {
                    return strategy.call(this, className);
                } else {
                    return Array.prototype.every.call(args, strategy, this);
                }
            }
        };
    } else {
        return function(className) {
            var args = arguments;

            return this.each(function(el) {
                if (args.length === 1) {
                    strategy.call(el, className);
                } else {
                    Array.prototype.forEach.call(args, strategy, el);
                }
            });
        };
    }
}

/**
 * Check if element contains class name(s)
 * @memberOf module:classes
 * @param  {...String} classNames class name(s)
 * @return {Boolean}   true if the element contains all classes
 * @function
 */
$Element.prototype.hasClass = makeClassesMethod("contains", function(className) {
    return (" " + this._node.className + " ").replace(rclass, " ").indexOf(" " + className + " ") >= 0;
});

/**
 * Add class(es) to element
 * @memberOf module:classes
 * @param  {...String} classNames class name(s)
 * @return {$Element}
 * @function
 */
$Element.prototype.addClass = makeClassesMethod("add", function(className) {
    if (!this.hasClass(className)) this._node.className += " " + className;
});

/**
 * Remove class(es) from element
 * @memberOf module:classes
 * @param  {...String} classNames class name(s)
 * @return {$Element}
 * @function
 */
$Element.prototype.removeClass = makeClassesMethod("remove", function(className) {
    className = (" " + this._node.className + " ").replace(rclass, " ").replace(" " + className + " ", " ");

    this._node.className = className.trim();
});

/**
 * Toggle class(es) on element
 * @memberOf module:classes
 * @param  {...String}  classNames class name(s)
 * @return {$Element}
 * @function
 */
$Element.prototype.toggleClass = makeClassesMethod("toggle", function(className) {
    var oldClassName = this._node.className;

    this.addClass(className);

    if (oldClassName === this._node.className) this.removeClass(className);
});
