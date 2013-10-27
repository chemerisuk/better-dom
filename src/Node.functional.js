define(["Node", "CompositeElement"], function($Node, $CompositeElement, _extend, _forIn, _map, _forEach, _slice, _forOwn, _makeError, _some, _every, _filter, _foldl, _foldr, _legacy) {
    "use strict";

    // NODE FUNCTIONAL
    // ---------------

    (function() {
        function makeCollectionMethod(fn) {
            var code = fn.toString();
            // extract function body
            code = code.substring(code.indexOf("{") + 1, code.lastIndexOf("}"));
            // use this variable unstead of a
            code = code.replace(/a([^\w])/g, function(a, symbol) { return "this" + symbol; });
            // compile the function
            return Function("cb", "that", code);
        }

        _extend($Node.prototype, {
            /**
             * Executes callback on each element in the collection
             * @memberOf $Element.prototype
             * @param  {Function} callback callback function
             * @param  {Object}   [context]  callback context
             * @return {$Element}
             * @function
             */
            each: makeCollectionMethod(_forEach),

            /**
             * Checks if the callback returns true for any element in the collection
             * @memberOf $Element.prototype
             * @param  {Function} callback   callback function
             * @param  {Object}   [context]  callback context
             * @return {Boolean} true, if any element in the collection return true
             * @function
             */
            some: makeCollectionMethod(_some),

            /**
             * Checks if the callback returns true for all elements in the collection
             * @memberOf $Element.prototype
             * @param  {Function} callback   callback function
             * @param  {Object}   [context]  callback context
             * @return {Boolean} true, if all elements in the collection returns true
             * @function
             */
            every: makeCollectionMethod(_every),

            /**
             * Creates an array of values by running each element in the collection through the callback
             * @memberOf $Element.prototype
             * @param  {Function} callback   callback function
             * @param  {Object}   [context]  callback context
             * @return {Array} new array of the results of each callback execution
             * @function
             */
            map: makeCollectionMethod(_map),

            /**
             * Examines each element in a collection, returning an array of all elements the callback returns truthy for
             * @memberOf $Element.prototype
             * @param  {Function} callback   callback function
             * @param  {Object}   [context]  callback context
             * @return {Array} new array with elements where callback returned true
             * @function
             */
            filter: makeCollectionMethod(_filter),

            /**
             * Boils down a list of values into a single value (from start to end)
             * @memberOf $Element.prototype
             * @param  {Function} callback callback function
             * @param  {Object}   [memo]   initial value of the accumulator
             * @return {Object} the accumulated value
             * @function
             */
            reduce: makeCollectionMethod(_foldl),

            /**
             * Boils down a list of values into a single value (from end to start)
             * @memberOf $Element.prototype
             * @param  {Function} callback callback function
             * @param  {Object}   [memo]   initial value of the accumulator
             * @return {Object} the accumulated value
             * @function
             */
            reduceRight: makeCollectionMethod(_foldr),

            /**
             * Executes code in a 'unsafe' block there the first callback argument is native DOM
             * object. Use only when you need to communicate better-dom with third party scripts!
             * @memberOf $Element.prototype
             * @param  {Function} block unsafe block body (nativeNode, index)
             */
            legacy: makeCollectionMethod(_legacy)
        });
    }());
});
