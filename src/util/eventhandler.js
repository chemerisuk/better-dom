import { WINDOW } from "../const";
import { $Element } from "../types";
import SelectorMatcher from "./selectormatcher";
import HOOK from "./eventhooks";

function getEventProperty(name, e, type, node, target, currentTarget) {
    switch (name) {
    case "type":
        return type;
    case "defaultPrevented":
        // IE8 and Android 2.3 use returnValue instead of defaultPrevented
        return "defaultPrevented" in e ? e.defaultPrevented : e.returnValue === false;
    case "target":
        return $Element(target);
    case "currentTarget":
        return $Element(currentTarget);
    case "relatedTarget":
        return $Element(e.relatedTarget || e[(e.toElement === node ? "from" : "to") + "Element"]);
    }

    var value = e[name];

    if (typeof value === "function") {
        return () => value.apply(e, arguments);
    }

    return value;
}

function EventHandler(type, selector, callback, props, el, once) {
    var node = el[0],
        hook = HOOK[type],
        matcher = SelectorMatcher(selector, node),
        handler = (e) => {
            e = e || WINDOW.event;
            // early stop in case of default action
            if (EventHandler.skip === type) return;
            // srcElement can be null in legacy IE when target is document
            var target = e.target || e.srcElement || (node.ownerDocument ? node.ownerDocument.documentElement : null),
                currentTarget = matcher ? matcher(target) : node,
                args = props ? props.map((name) => getEventProperty(
                    name, e, type, node, target, currentTarget)) : null;

            // early stop for late binding or when target doesn't match selector
            if (!currentTarget) return;

            // off callback even if it throws an exception later
            if (once) el.off(type, callback);

            // prevent default if handler returns false
            if ((args ? callback.apply(el, args) : callback.call(el)) === false) {
                e.preventDefault();
            }
        };

    if (hook) handler = hook(handler, type) || handler;

    handler.type = type;
    handler.callback = callback;
    handler.selector = selector;

    return handler;
}

export default EventHandler;
