var _ = require("./utils"),
    $Node = require("./node"),
    invoker = document.createElement("form");

/**
 * Make a safe method/function call
 * @param  {String|Function}  method  name of method or function for a safe call
 * @param  {...Object}        [args]  extra arguments to pass into each invokation
 * @return {Array|Boolean} array of results when there was no exception or false otherwise
 */
$Node.prototype.invoke = function(method) {
    var args = _.slice(arguments, 1),
        methodType = typeof method,
        ref = this, handler, result;

    if (methodType === "function") {
        handler = function(el, index) {
            return method.apply(null, args.concat(el, index, ref));
        };
    } else if (methodType === "string") {
        handler = function(el) {
            return el._node[method].apply(el._node, args);
        };
    } else {
        throw _.makeError("invoke");
    }
    // register event callback
    invoker.onreset = function() { result = ref.map(handler) };
    // make a safe call
    invoker.reset();
    // cleanup references
    invoker.onreset = null;

    return result ? (this._node ? result[0] : result) : false;
};
