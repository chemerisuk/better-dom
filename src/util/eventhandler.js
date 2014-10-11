import _ from "./index";
import { JSCRIPT_VERSION, HTML, WINDOW, DOCUMENT, CUSTOM_EVENT_TYPE } from "../const";
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
                /* istanbul ignore if */
                if (handler._type === CUSTOM_EVENT_TYPE && e.srcUrn !== type) {
                    return; // handle custom events in legacy IE
                }
                // srcElement can be null in legacy IE when target is document
                var target = e.target || e.srcElement || DOCUMENT,
                    currentTarget = matcher ? matcher(target) : node,
                    args = props || [];

                // early stop for late binding or when target doesn't match selector
                if (!currentTarget) return;

                // off callback even if it throws an exception later
                if (once) el.off(type, callback);

                if (!args.length) {
                    // if props is not specified then prepend extra arguments
                    args = e[0] ? _.slice.call(e[0], 1) : [];
                } else {
                    args = args.map((name) => {
                        if (typeof name === "number") return e[0] ? e[0][name] : void 0;
                        if (typeof name !== "string") return name;
                        /* istanbul ignore if */
                        if (JSCRIPT_VERSION < 9) {
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
                }

                // prevent default if handler returns false
                if (callback.apply(el, args) === false) {
                    /* istanbul ignore if */
                    if (JSCRIPT_VERSION < 9) {
                        e.returnValue = false;
                    } else {
                        e.preventDefault();
                    }
                }
            };

        if (hook) handler = hook(handler, type) || handler;
        /* istanbul ignore next */
        if (JSCRIPT_VERSION < 9 && !("on" + (handler._type || type) in node)) {
            // handle custom events for IE8
            handler._type = CUSTOM_EVENT_TYPE;
        }

        handler.type = selector ? type + " " + selector : type;
        handler.callback = callback;

        return handler;
    };

export default EventHandler;
