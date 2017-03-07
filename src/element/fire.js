import { register, safeCall } from "../util/index";
import { MethodError } from "../errors";
import { JSCRIPT_VERSION, CUSTOM_EVENT_TYPE, RETURN_TRUE } from "../const";
import EventHandler from "../util/eventhandler";
import HOOK from "../util/eventhooks";

register({
    /**
     * Triggers an event of specific type with optional extra arguments
     * @memberof! $Element#
     * @alias $Element#fire
     * @param  {String}   type    type of event
     * @param  {Object}  [detail] custom event data
     * @return {Boolean} returns <code>true</code> if default action wasn't prevented
     * @example
     * link.fire("click");                   // fire click event
     * link.fire("my:event", {a: "b"}, 123); // fire "my:event" with arguments
     */
    fire(type, detail) {
        var node = this[0],
            e, eventType, canContinue;

        if (typeof type === "string") {
            let hook = HOOK[type],
                handler = {};

            if (hook) handler = hook(handler) || handler;

            eventType = handler._type || type;
        } else {
            throw new MethodError("fire", arguments);
        }
        /* istanbul ignore if */
        if (JSCRIPT_VERSION < 9) {
            e = (node.ownerDocument || node).createEventObject();

            if (detail) e.detail = detail;
            // handle custom events for legacy IE
            if (!("on" + eventType in node)) eventType = CUSTOM_EVENT_TYPE;
            // store original event type
            if (eventType === CUSTOM_EVENT_TYPE) e.srcUrn = type;

            node.fireEvent("on" + eventType, e);

            canContinue = e.returnValue !== false;
        } else {
            e = (node.ownerDocument || node).createEvent("CustomEvent");
            e.initCustomEvent(eventType, true, true, detail);
            canContinue = node.dispatchEvent(e);
        }

        // call native function to trigger default behavior
        if (canContinue && node[type]) {
            // prevent re-triggering of the current event
            EventHandler.skip = type;

            safeCall(node, type);

            EventHandler.skip = null;
        }

        return canContinue;
    }
}, null, () => RETURN_TRUE);
