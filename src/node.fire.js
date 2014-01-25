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
        eventType = typeof type,
        handler = {}, hook, isSafeCall;

    if (eventType === "string") {
        if (hook = EventHandler.hooks[type]) handler = hook(handler) || handler;

        eventType = handler._type || type;
    } else if (eventType === "function") {
        isSafeCall = true;
        eventType = "filterchange";
    } else {
        throw _.makeError("fire");
    }

    return _.every(this, function(el, index, ref) {
        var node = el[_.NODE],
            isCustomEvent, canContinue, e;

        if (isSafeCall) el.once(eventType, function() { canContinue = type(el, index, ref) !== false });

        if (_.DOM2_EVENTS) {
            e = document.createEvent("HTMLEvents");
            e.initEvent(eventType, !isSafeCall, !isSafeCall);
            e[_.EVENTARGS] = args;

            node.dispatchEvent(e);

            canContinue = isSafeCall ? !!canContinue : !e.defaultPrevented;
        } else {
            e = document.createEventObject();
            e[_.EVENTARGS] = args;

            isCustomEvent = eventType === "dataavailable" || !("on" + eventType in node);
            // store original event type
            if (isCustomEvent) e.srcUrn = isSafeCall ? eventType : type;

            node.fireEvent("on" + (isCustomEvent ? "dataavailable" : eventType), e);

            canContinue = isSafeCall ? !!canContinue : e.returnValue !== false;
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
