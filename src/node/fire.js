import { $Node } from "./index";
import { MethodError } from "../errors";
import EventHandler from "../util/eventhandler";
import HOOK from "../util/eventhooks";

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
$Node.prototype.fire = function(type, detail) {
    const node = this["<%= prop() %>"];
    var e, eventType, canContinue;

    if (typeof type === "string") {
        let hook = HOOK[type],
            handler = {};

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
        // prevent re-triggering of the current event
        EventHandler.skip = type;

        node[type]();

        EventHandler.skip = null;
    }

    return canContinue;
};
