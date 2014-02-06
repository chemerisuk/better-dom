var _ = require("./utils"),
    $Node = require("./node"),
    invoker = document.createElement("a"),
    safeEvent = "filterchange";

if (_.DOM2_EVENTS) {
    invoker.addEventListener(safeEvent, function() { this.onfilterchange() }, false);
}

/**
 * Make a safe method/function call
 * @param  {String|Function}  method  name of method or function for a safe call
 * @param  {...Object}        [args]  extra arguments to pass into each invokation
 * @return {Object} false there was an exception, result for a single node, array of results for collection
 */
$Node.prototype.invoke = function(method) {
    var args = _.slice(arguments, 1),
        methodType = typeof method,
        ref = this, handler, result, e;

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
    invoker.onfilterchange = function() { result = ref.map(handler) };
    // make a safe call
    if (_.DOM2_EVENTS) {
        e = document.createEvent("HTMLEvents");
        e.initEvent(safeEvent, false, false);
        invoker.dispatchEvent(e);
    } else {
        invoker.fireEvent("on" + safeEvent);
    }
    // cleanup references
    invoker.onreset = null;

    return result ? (this._node ? result[0] : result) : false;
};
