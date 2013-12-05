var _ = require("./utils"),
    $Node = require("./node"),
    EventHandler = require("./eventhandler"),
    hooks = require("./node.on.hooks"),
    features = require("./features");

/**
 * Triggers an event of specific type with optional extra arguments
 * @param  {String}    type   type of event
 * @param  {...Object} [args] extra arguments to pass into each event handler
 * @return {Boolean} true if default action wasn't prevented
 * @see https://github.com/chemerisuk/better-dom/wiki/Event-handling
 */
$Node.prototype.fire = function(type) {
    if (typeof type !== "string") throw _.makeError("fire", this);

    var args = _.slice(arguments, 1);

    return _.every(this, function(el) {
        var node = el._node,
            hook = hooks[type],
            handler = {},
            isCustomEvent, canContinue, e;

        if (hook) hook(handler);

        if (features.DOM2_EVENTS) {
            e = document.createEvent("HTMLEvents");

            e.initEvent(handler._type || type, true, true);
            e._args = args;

            canContinue = node.dispatchEvent(e);
        } else {
            isCustomEvent = type === "submit" || !("on" + type in node);
            e = document.createEventObject();
            // store original event type
            e.srcUrn = isCustomEvent ? type : undefined;
            e._args = args;

            node.fireEvent("on" + (isCustomEvent ? "dataavailable" : handler._type || type), e);

            canContinue = e.returnValue !== false;
        }

        // Call native method. IE<9 dies on focus/blur to hidden element
        if (canContinue && node[type] && (type !== "focus" && type !== "blur" || node.offsetWidth)) {
            // Prevent re-triggering of the same event
            EventHandler.skip = type;

            node[type]();

            EventHandler.skip = null;
        }

        return canContinue;
    });
};
