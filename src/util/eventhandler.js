import { DOM2_EVENTS, HTML, WINDOW, DOCUMENT, CUSTOM_EVENT_TYPE } from "../const";
import { $Element } from "../types";
import SelectorMatcher from "./selectormatcher";
import HOOK from "./eventhooks";

/*
 * Helper type to create an event handler
 */

var EventHandler = (type, selector, callback, props, el, once) => {
        var node = el[0],
            hook = HOOK[type],
            matcher = SelectorMatcher(selector, node),
            handler = (e) => {
                e = e || WINDOW.event;
                // early stop in case of default action
                if (EventHandler.skip === type) return;
                // handle custom events in legacy IE
                if (handler._type === CUSTOM_EVENT_TYPE && e.srcUrn !== type) return;
                // srcElement can be null in legacy IE when target is document
                var target = e.target || e.srcElement || DOCUMENT,
                    currentTarget = matcher ? matcher(target) : node,
                    eventArgs = e._args || [],
                    args = props;

                // early stop for late binding or when target doesn't match selector
                if (!currentTarget) return;

                // off callback even if it throws an exception later
                if (once) el.off(type, callback);

                args = !args ? eventArgs : args.map((name) => {
                    if (typeof name === "number") return eventArgs[name - 1];

                    if (!DOM2_EVENTS) {
                        switch (name) {
                        case "which":
                            return e.keyCode;
                        case "button":
                            var button = e.button;
                            // click: 1 === left; 2 === middle; 3 === right
                            return button & 1 ? 1 : ( button & 2 ? 3 : ( button & 4 ? 2 : 0 ) );
                        case "pageX":
                            return e.clientX + HTML.scrollLeft - HTML.clientLeft;
                        case "pageY":
                            return e.clientY + HTML.scrollTop - HTML.clientTop;
                        }
                    }

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

                    return e[name];
                });

                // if props is not specified then prepend extra arguments
                if (callback.apply(el, args) === false) {
                    // prevent default if handler returns false
                    if (DOM2_EVENTS) {
                        e.preventDefault();
                    } else {
                        e.returnValue = false;
                    }
                }
            };

        if (hook) handler = hook(handler, type) || handler;
        // handle custom events for IE8
        if (!DOM2_EVENTS && !("on" + (handler._type || type) in node)) {
            handler._type = CUSTOM_EVENT_TYPE;
        }

        handler.type = selector ? type + " " + selector : type;
        handler.callback = callback;

        return handler;
    };

export default EventHandler;
