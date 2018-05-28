import { $Node } from "./index";
import { MethodError } from "../errors";
import EventHandler from "../util/eventhandler";
import HOOK from "../util/eventhooks";

/**
 * Triggers an event of specific type with optional extra arguments
 * @param  {String}   type    type of event
 * @param  {Object}  [detail] custom event data
 * @return {Boolean} `true` if default event action was NOT prevented
 * @example
 * link.fire("click");                   // fire click event
 * link.fire("my:event", {a: "b"}, 123); // fire "my:event" with arguments
 */
$Node.prototype.fire = function(type, detail) {
    const node = this[0];
    var e, eventType, canContinue;

    if (typeof type === "string") {
        let hook = HOOK[type],
            handler = {options: {}};

        if (hook) handler = hook(handler) || handler;

        eventType = handler._type || type;
    } else {
        throw new MethodError("fire", arguments);
    }

    if (!node) return true;

    e = (node.ownerDocument || node).createEvent("CustomEvent");
    e.initCustomEvent(eventType, true, true, detail);
    canContinue = node.dispatchEvent(e);

    // call native function to trigger default behavior
    if (canContinue && node[type]) {
        const _handleEvent = EventHandler.prototype.handleEvent;
        // intercept handleEvent to prevent double event callbacks
        EventHandler.prototype.handleEvent = function(e) {
            // prevent re-triggering of the current event
            if (this.type !== type) {
                return _handleEvent.call(this, e);
            }
        };

        node[type]();
        // restore original method
        EventHandler.prototype.handleEvent = _handleEvent;
    }

    return canContinue;
};
