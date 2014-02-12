var _ = require("./utils"),
    $Node = require("./node"),
    dispatcher = document.createElement("a"),
    safePropName = "onpropertychange";

if (_.DOM2_EVENTS) {
    // for modern browsers use late binding for safe calls
    // dispatcher MUST have handleEvent property before registering
    dispatcher[safePropName = "handleEvent"] = null;
    dispatcher.addEventListener(safePropName, dispatcher, false);
}

/**
 * Make a safe method/function call
 * @param  {String|Function}  method  name of method or function for a safe call
 * @param  {...Object}        [args]  extra arguments to pass into each invokation
 * @return {Object} result of the invokation which is undefined if there was an exception
 */
$Node.prototype.dispatch = function(method) {
    var args = _.slice.call(arguments, 1),
        methodType = typeof method,
        el = this,
        node = this._node,
        handler, result, e;

    if (!node) return;

    if (methodType === "function") {
        handler = function() { result = method.apply(el, args) };
    } else if (methodType === "string") {
        handler = function() { result = node[method].apply(node, args) };
    } else {
        throw _.makeError("dispatch");
    }
    // register safe invokation handler
    dispatcher[safePropName] = handler;
    // make a safe call
    if (_.DOM2_EVENTS) {
        e = document.createEvent("HTMLEvents");
        e.initEvent(safePropName, false, false);
        dispatcher.dispatchEvent(e);
    }
    // cleanup references
    dispatcher[safePropName] = null;

    return result;
};
