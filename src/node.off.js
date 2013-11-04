var _ = require("./utils"),
    $Node = require("./node");

/**
 * Unbind a DOM event from the context
 * @param  {String}          type type of event
 * @param  {Object}          [context] callback context
 * @param  {Function|String} [callback] event handler
 * @return {$Node}
 * @see https://github.com/chemerisuk/better-dom/wiki/Event-handling
 */
$Node.prototype.off = function(type, context, callback) {
    if (typeof type !== "string") throw _.makeError("off", this);

    if (arguments.length === 2) {
        callback = context;
        context = !callback ? undefined : this;
    }

    return _.legacy(this, function(node, el) {
        _.forEach(el._listeners, function(handler, index, events) {
            if (handler && type === handler.type && (!context || context === handler.context) && (!callback || callback === handler.callback)) {
                type = handler._type || handler.type;

                if (document.removeEventListener) {
                    node.removeEventListener(type, handler, !!handler.capturing);
                } else {
                    // IE8 doesn't support onscroll on document level
                    if (el === DOM && type === "scroll") node = window;

                    node.detachEvent("on" + type, handler);
                }

                delete events[index];
            }
        });
    });
};
