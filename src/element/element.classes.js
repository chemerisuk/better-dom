import _ from "../helpers";
import { HTML } from "../constants";
import { $Element } from "../types";

var reSpace = /[\n\t\r]/g;

function makeClassesMethod(nativeStrategyName, strategy) {
    var methodName = nativeStrategyName === "contains" ? "hasClass" : nativeStrategyName + "Class";

    if (HTML.classList) {
        strategy = function(className) {
            return this[0].classList[nativeStrategyName](className);
        };
    }

    if (methodName === "hasClass") {
        return function(className) {
            var args = arguments;

            if (this[0]) {
                if (args.length === 1) {
                    return strategy.call(this, className);
                } else {
                    return _.every.call(args, strategy, this);
                }
            }
        };
    } else {
        return function(className) {
            var args = arguments;

            if (args.length === 1) {
                strategy.call(this, className);
            } else {
                _.each.call(args, strategy, this);
            }

            return this;
        };
    }
}

/**
 * Check if element contains class name(s)
 * @memberof! $Element#
 * @alias $Element#hasClass
 * @param  {...String} classNames class name(s)
 * @return {Boolean}   true if the element contains all classes
 * @function
 */
$Element.prototype.hasClass = makeClassesMethod("contains", function(className) {
    return (" " + this[0].className + " ").replace(reSpace, " ").indexOf(" " + className + " ") >= 0;
});

/**
 * Add class(es) to element
 * @memberof! $Element#
 * @alias $Element#addClass
 * @param  {...String} classNames class name(s)
 * @return {$Element}
 * @function
 */
$Element.prototype.addClass = makeClassesMethod("add", function(className) {
    if (!this.hasClass(className)) this[0].className += " " + className;
});

/**
 * Remove class(es) from element
 * @memberof! $Element#
 * @alias $Element#removeClass
 * @param  {...String} classNames class name(s)
 * @return {$Element}
 * @function
 */
$Element.prototype.removeClass = makeClassesMethod("remove", function(className) {
    className = (" " + this[0].className + " ").replace(reSpace, " ").replace(" " + className + " ", " ");

    this[0].className = className.trim();
});

/**
 * Toggle class(es) on element
 * @memberof! $Element#
 * @alias $Element#toggleClass
 * @param  {...String}  classNames class name(s)
 * @return {$Element}
 * @function
 */
$Element.prototype.toggleClass = makeClassesMethod("toggle", function(className) {
    var oldClassName = this[0].className;

    this.addClass(className);

    if (oldClassName === this[0].className) this.removeClass(className);
});
