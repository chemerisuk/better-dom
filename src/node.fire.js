var _ = require("./utils"),
    $Node = require("./node"),
    EventHandler = require("./eventhandler"),
    hooks = require("./node.on.hooks");

/**
 * Triggers an event of specific type
 * @param  {String} type type of event
 * @param  {Object} [detail] event details
 * @return {Boolean} true if default action wasn't prevented
 * @see https://github.com/chemerisuk/better-dom/wiki/Event-handling
 */
$Node.prototype.fire = function(type, detail) {
    if (typeof type !== "string") {
        throw _.makeError("fire", this);
    }

    return _.every(this, function(el) {
        var node = el._node,
            hook = hooks[type],
            handler = {},
            isCustomEvent, canContinue, e;

        if (hook) hook(handler);

        if (document.createEvent) {
            e = document.createEvent("HTMLEvents");

            e.initEvent(handler._type || type, true, true);
            e.detail = detail;

            canContinue = node.dispatchEvent(e);
        } else {
            isCustomEvent = handler.custom || !("on" + type in node);
            e = document.createEventObject();
            // store original event type
            e.srcUrn = isCustomEvent ? type : undefined;
            e.detail = detail;

            node.fireEvent("on" + (isCustomEvent ? "dataavailable" : handler._type || type), e);

            canContinue = e.returnValue !== false;
        }

        // Call a native DOM method on the target with the same name as the event
        // IE<9 dies on focus/blur to hidden element
        if (canContinue && node[type] && (type !== "focus" && type !== "blur" || node.offsetWidth)) {
            // Prevent re-triggering of the same event
            EventHandler.veto = type;

            node[type]();

            EventHandler.veto = false;
        }

        return canContinue;
    });
};
