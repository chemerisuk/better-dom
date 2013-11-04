// NODE FUNCTIONAL
// ---------------

var _ = require("./utils"),
    $Node = require("./node");

function makeCollectionMethod(fn) {
    var code = fn.toString();
    // extract function body
    code = code.substring(code.indexOf("{") + 1, code.lastIndexOf("}"));
    // use this variable unstead of a
    code = code.replace(/a([^\w])/g, function(a, symbol) { return "this" + symbol; });
    // compile the function
    return Function("cb", "that", code);
}

_.extend($Node.prototype, {
    /**
     * Executes callback on each element in the collection
     * @memberOf $Element.prototype
     * @param  {Function} callback callback function
     * @param  {Object}   [context]  callback context
     * @return {$Element}
     * @function
     */
    each: makeCollectionMethod(_.forEach),

    /**
     * Checks if the callback returns true for any element in the collection
     * @memberOf $Element.prototype
     * @param  {Function} callback   callback function
     * @param  {Object}   [context]  callback context
     * @return {Boolean} true, if any element in the collection return true
     * @function
     */
    some: makeCollectionMethod(_.some),

    /**
     * Checks if the callback returns true for all elements in the collection
     * @memberOf $Element.prototype
     * @param  {Function} callback   callback function
     * @param  {Object}   [context]  callback context
     * @return {Boolean} true, if all elements in the collection returns true
     * @function
     */
    every: makeCollectionMethod(_.every),

    /**
     * Creates an array of values by running each element in the collection through the callback
     * @memberOf $Element.prototype
     * @param  {Function} callback   callback function
     * @param  {Object}   [context]  callback context
     * @return {Array} new array of the results of each callback execution
     * @function
     */
    map: makeCollectionMethod(_.map),

    /**
     * Examines each element in a collection, returning an array of all elements the callback returns truthy for
     * @memberOf $Element.prototype
     * @param  {Function} callback   callback function
     * @param  {Object}   [context]  callback context
     * @return {Array} new array with elements where callback returned true
     * @function
     */
    filter: makeCollectionMethod(_.filter),

    /**
     * Boils down a list of values into a single value (from start to end)
     * @memberOf $Element.prototype
     * @param  {Function} callback callback function
     * @param  {Object}   [memo]   initial value of the accumulator
     * @return {Object} the accumulated value
     * @function
     */
    reduce: makeCollectionMethod(_.foldl),

    /**
     * Boils down a list of values into a single value (from end to start)
     * @memberOf $Element.prototype
     * @param  {Function} callback callback function
     * @param  {Object}   [memo]   initial value of the accumulator
     * @return {Object} the accumulated value
     * @function
     */
    reduceRight: makeCollectionMethod(_.foldr),

    /**
     * Executes code in a 'unsafe' block there the first callback argument is native DOM
     * object. Use only when you need to communicate better-dom with third party scripts!
     * @memberOf $Element.prototype
     * @param  {Function} block unsafe block body (nativeNode, index)
     * @function
     */
    legacy: makeCollectionMethod(_.legacy)
});
