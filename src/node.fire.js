var _ = require("./utils"),
    $Node = require("./node"),
    EventHandler = require("./eventhandler");

/**
 * Triggers an event of specific type with optional extra arguments
 * @param  {String|Function}  type    type of event or function for a safe call
 * @param  {...Object}        [args]  extra arguments to pass into each event handler
 * @return {Boolean} true if default action wasn't prevented
 * @see https://github.com/chemerisuk/better-dom/wiki/Event-handling
 */
$Node.prototype.fire = function(type) {
    var args = _.slice(arguments, 1),
        isSafeCall = typeof type === "function";

    if (typeof type !== "string" && !isSafeCall) throw _.makeError("fire");

    return _.every(this, function(el, index, ref) {
        var node = el[_.NODE],
            hook = EventHandler.hooks[type.toString()],
            handler = {},
            isCustomEvent, eventType, canContinue, e;

        if (hook) hook(handler);

        eventType = handler._type || type;

        if (isSafeCall) el.once(eventType = "filterchange", function() { type(el, index, ref) });

        if (_.DOM2_EVENTS) {
            e = document.createEvent("HTMLEvents");
            e.initEvent(eventType, !isSafeCall, !isSafeCall);
            e[_.EVENTARGS] = args;

            canContinue = node.dispatchEvent(e);
        } else {
            e = document.createEventObject();
            e[_.EVENTARGS] = args;

            isCustomEvent = eventType === "submit" || !("on" + eventType in node);
            // store original event type
            if (isCustomEvent) e.srcUrn = isSafeCall ? eventType : type;

            node.fireEvent("on" + (isCustomEvent ? "dataavailable" : eventType), e);

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
