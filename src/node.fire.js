var _ = require("./utils"),
    $Node = require("./node"),
    EventHandler = require("./eventhandler");

/**
 * Triggers an event of specific type with optional extra arguments
 * @param  {String}  type  type of event
 * @param  {...Object}     [args]  extra arguments to pass into each event handler
 * @return {Boolean} true if default action wasn't prevented
 * @see https://github.com/chemerisuk/better-dom/wiki/Event-handling
 */
$Node.prototype.fire = function(type) {
    var args = _.slice(arguments, 1),
        eventType = typeof type,
        handler = {}, hook;

    if (eventType === "string") {
        if (hook = EventHandler.hooks[type]) handler = hook(handler) || handler;

        eventType = handler._type || type;
    } else {
        throw _.makeError("fire");
    }

    return _.every(this, function(el) {
        var node = el._node,
            e, canContinue;

        if (_.DOM2_EVENTS) {
            e = document.createEvent("HTMLEvents");
            e.initEvent(eventType, true, true);
            e._args = args;

            canContinue = node.dispatchEvent(e);
        } else {
            e = document.createEventObject();
            e._args = args;
            // handle custom events for legacy IE
            if (!("on" + eventType in node)) eventType = "dataavailable";
            // store original event type
            if (eventType === "dataavailable") e.srcUrn = type;

            node.fireEvent("on" + eventType, e);

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
