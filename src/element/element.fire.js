import { MethodError } from "../errors";
import { DOM2_EVENTS, DOCUMENT, CUSTOM_EVENT_TYPE } from "../constants";
import { $Element } from "../types";
import EventHandler from "../util/eventhandler";
import HOOK from "../util/eventhooks";

/**
 * Triggers an event of specific type with optional extra arguments
 * @memberof! $Element#
 * @alias $Element#fire
 * @param  {String}  type  type of event
 * @param  {...Object}     [args]  extra arguments to pass into each event handler
 * @return {Boolean} true if default action wasn't prevented
 */
$Element.prototype.fire = function(type, ...args) {
    var node = this._._node,
        eventType = typeof type,
        handler = {},
        hook, e, canContinue;

    if (eventType === "string") {
        if (hook = HOOK[type]) handler = hook(handler) || handler;

        eventType = handler._type || type;
    } else {
        throw new MethodError("fire");
    }

    if (!node) return false;

    if (DOM2_EVENTS) {
        e = DOCUMENT.createEvent("HTMLEvents");
        e.initEvent(eventType, true, true);
        e._args = args;

        canContinue = node.dispatchEvent(e);
    } else {
        e = DOCUMENT.createEventObject();
        e._args = args;
        // handle custom events for legacy IE
        if (!("on" + eventType in node)) eventType = CUSTOM_EVENT_TYPE;
        // store original event type
        if (eventType === CUSTOM_EVENT_TYPE) e.srcUrn = type;

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
};
