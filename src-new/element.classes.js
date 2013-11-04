// CLASSES MANIPULATION
// --------------------

var _ = require("utils"),
    $Element = require("element"),
    rclass = /[\n\t\r]/g;

function makeClassesMethod(nativeStrategyName, strategy) {
    var methodName = nativeStrategyName === "contains" ? "hasClass" : nativeStrategyName + "Class";

    if (document.documentElement.classList) {
        strategy = function(className) {
            return this._node.classList[nativeStrategyName](className);
        };
    }

    strategy = (function(strategy){
        return function(className) {
            if (typeof className !== "string") throw _.makeError(methodName, this);

            return strategy.call(this, className);
        };
    })(strategy);

    if (methodName === "hasClass") {
        return function() {
            if (!this._node) return;

            return _.every(arguments, strategy, this);
        };
    } else {
        return function() {
            var args = arguments;

            return _.forEach(this, function(el) {
                _.forEach(args, strategy, el);
            });
        };
    }
}

/**
 * Check if element contains class name(s)
 * @param  {...String} classNames class name(s)
 * @return {Boolean}   true if the element contains all classes
 * @function
 */
$Element.prototype.hasClass = makeClassesMethod("contains", function(className) {
    return (" " + this._node.className + " ").replace(rclass, " ").indexOf(" " + className + " ") >= 0;
});

/**
 * Add class(es) to element
 * @param  {...String} classNames class name(s)
 * @return {$Element}
 * @function
 */
$Element.prototype.addClass = makeClassesMethod("add", function(className) {
    if (!this.hasClass(className)) this._node.className += " " + className;
});

/**
 * Remove class(es) from element
 * @param  {...String} classNames class name(s)
 * @return {$Element}
 * @function
 */
$Element.prototype.removeClass = makeClassesMethod("remove", function(className) {
    className = (" " + this._node.className + " ").replace(rclass, " ").replace(" " + className + " ", " ");

    this._node.className = _.trim(className);
});

/**
 * Toggle class(es) on element
 * @param  {...String}  classNames class name(s)
 * @return {$Element}
 * @function
 */
$Element.prototype.toggleClass = makeClassesMethod("toggle", function(className) {
    var oldClassName = this._node.className;

    this.addClass(className);

    if (oldClassName === this._node.className) this.removeClass(className);
});
