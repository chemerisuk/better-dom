import _ from "./utils";
import $Element from "./element";
import SelectorMatcher from "./selectormatcher";

/*
 * Helper type to create an event handler
 */

var defaultArgs = ["target", "currentTarget", "defaultPrevented"],
    CUSTOM_EVENT_TYPE = "dataavailable",
    hooks = {},
    EventHandler = (type, selector, callback, props, el, node, once) => {
        var hook = hooks[type],
            matcher = SelectorMatcher(selector, node),
            handler = (e) => {
                e = e || window.event;
                // early stop in case of default action
                if (EventHandler.skip === type) return;
                // handle custom events in legacy IE
                if (handler._type === CUSTOM_EVENT_TYPE && e.srcUrn !== type) return;
                // srcElement can be null in legacy IE when target is document
                var target = e.target || e.srcElement || document,
                    currentTarget = matcher ? matcher(target) : node,
                    args = props || defaultArgs,
                    fn = callback;

                if (typeof callback === "string") {
                    if (callback[0] === "-") {
                        fn = el._[callback.substr(1)];
                    } else {
                        fn = el[callback];
                    }
                }

                // early stop for late binding or when target doesn't match selector
                if (typeof fn !== "function" || !currentTarget) return;

                // off callback even if it throws an exception later
                if (once) el.off(type, callback);

                args = args.map((name) => {
                    if (!_.DOM2_EVENTS) {
                        switch (name) {
                        case "which":
                            return e.keyCode;
                        case "button":
                            var button = e.button;
                            // click: 1 === left; 2 === middle; 3 === right
                            return button & 1 ? 1 : ( button & 2 ? 3 : ( button & 4 ? 2 : 0 ) );
                        case "pageX":
                            return e.pageX || e.clientX + _.docEl.scrollLeft - _.docEl.clientLeft;
                        case "pageY":
                            return e.clientY + _.docEl.scrollTop - _.docEl.clientTop;
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
                // if props is not specified then prepend extra arguments if they exist
                if (e._args) args = e._args.concat(args);

                if (fn.apply(el, args) === false) {
                    // prevent default if handler returns false
                    if (_.DOM2_EVENTS) {
                        e.preventDefault();
                    } else {
                        e.returnValue = false;
                    }
                }
            };

        if (hook) handler = hook(handler, type) || handler;
        // handle custom events for IE8
        if (!_.DOM2_EVENTS && !("on" + (handler._type || type) in node)) {
            handler._type = CUSTOM_EVENT_TYPE;
        }

        handler.type = selector ? type + " " + selector : type;
        handler.callback = callback;

        return handler;
    };

// EventHandler hooks

["scroll", "mousemove"].forEach((name) => {
    hooks[name] = (handler) => {
        var free = true;
        // debounce frequent events
        return (e) => { if (free) free = _.raf(() => { free = !handler(e) }) };
    };
});

if ("onfocusin" in _.docEl) {
    _.forOwn({focus: "focusin", blur: "focusout"}, (value, prop) => {
        hooks[prop] = (handler) => { handler._type = value };
    });
} else {
    // firefox doesn't support focusin/focusout events
    hooks.focus = hooks.blur = (handler) => { handler.capturing = true };
}

if (document.createElement("input").validity) {
    hooks.invalid = (handler) => { handler.capturing = true };
}

if (!_.DOM2_EVENTS) {
    // fix non-bubbling form events for IE8
    ["submit", "change", "reset"].forEach((name) => {
        hooks[name] = (handler) => { handler._type = CUSTOM_EVENT_TYPE };
    });
}

EventHandler.hooks = hooks;

export default EventHandler;
