var _ = require("./utils"),
    $Node = require("./node"),
    features = require("./features");

/**
 * Unbind an event from the element
 * @param  {String}          type type of event
 * @param  {Function|String} [callback] event handler
 * @return {$Node}
 * @see https://github.com/chemerisuk/better-dom/wiki/Event-handling
 */
$Node.prototype.off = function(type, callback) {
    if (typeof type !== "string") throw _.makeError("off", this);

    return this.legacy(function(node, el) {
        _.forEach(el._listeners, function(handler, index, events) {
            if (handler && type === handler.type && (!callback || callback === handler.callback)) {
                type = handler._type || handler.type;

                if (features.DOM2_EVENTS) {
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
