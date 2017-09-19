import { $Element } from "../element/index";
import SelectorMatcher from "./selectormatcher";
import HOOK from "./eventhooks";

function getEventProperty(name, e, type, node, target, currentTarget) {
    switch (name) {
    case "target":
        return $Element(target);
    case "currentTarget":
        return $Element(currentTarget);
    case "relatedTarget":
        return $Element(e.relatedTarget);
    }

    var value = e[name];

    if (typeof value === "function") {
        return () => value.apply(e, arguments);
    }

    return value;
}

function EventHandler(type, selector, callback, props, el, once) {
    var node = el["<%= prop() %>"],
        hook = HOOK[type],
        matcher = SelectorMatcher(selector, node),
        handler = (e) => {
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
            if (once) handler.off();
            // prevent default if handler returns false
            if ((args ? callback.apply(el, args) : callback.call(el)) === false) {
                e.preventDefault();
            }
        };

    if (hook) handler = hook(handler, type) || handler;

    handler.type = type;
    handler.callback = callback;
    handler.selector = selector;
    handler.off = () => {
        node.removeEventListener(type, handler, !!handler.capturing);
    };

    return handler;
}

export default EventHandler;
