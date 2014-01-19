/*
 * Helper type to create an event handler
 */
var _ = require("./utils"),
    $Element = require("./element"),
    SelectorMatcher = require("./selectormatcher"),
    hooks = {},
    eventHooks = {},
    docEl = document.documentElement,
    debouncedEvents = "scroll mousemove",
    requestAnimationFrame = ["r", "webkitR", "mozR", "oR"].reduce(function(memo, name) {
        return memo || window[name + "equestAnimationFrame"];
    }, null),
    createCustomEventWrapper = function(originalHandler, type) {
        var handler = function() { if (window.event.srcUrn === type) originalHandler() };

        handler._type = "dataavailable";

        return handler;
    },
    createDebouncedEventWrapper = function(originalHandler, debouncing) {
        return function(e) {
            if (!debouncing) {
                debouncing = true;

                requestAnimationFrame(function() {
                    originalHandler(e);

                    debouncing = false;
                });
            }
        };
    };

module.exports = function(type, selector, callback, props, el, once) {
    var hook = hooks[type],
        matcher = SelectorMatcher(selector),
        handler = function(e) {
            if (module.exports.skip === type) return; // early stop in case of default action

            e = e || window.event;

            // srcElement could be null in legacy IE when target is document
            var node = el._node,
                target = e.target || e.srcElement || document,
                currentTarget = selector ? target : node,
                fn = typeof callback === "string" ? el[callback] : callback,
                args = props || [selector ? "currentTarget" : "target", "defaultPrevented"];

            if (typeof fn !== "function") return; // early stop for late binding

            for (; matcher && !matcher(currentTarget); currentTarget = currentTarget.parentNode) {
                if (!currentTarget || currentTarget === node) return; // no matched element was found
            }

            // off callback even if it throws an exception later
            if (once) el.off(type, callback);

            args = _.map(args, function(name) {
                switch (name) {
                case "type":
                    return type;
                case "target":
                    return $Element(target);
                case "currentTarget":
                    return $Element(currentTarget);
                }

                var hook = eventHooks[name];

                return hook ? hook(e, node) : e[name];
            });

            // prepend extra arguments if they exist
            if (e._args && e._args.length) args = e._args.concat(args);

            if (fn.apply(el, args) === false) {
                // prevent default if handler returns false
                if (_.DOM2_EVENTS) {
                    e.preventDefault();
                } else {
                    e.returnValue = false;
                }
            }
        };

    if (hook) hook(handler);

    handler.type = handler._type || type;

    if (~debouncedEvents.indexOf(handler.type)) {
        handler = createDebouncedEventWrapper(handler);
    } else if (!_.DOM2_EVENTS && (handler.type === "submit" || !("on" + handler.type in el._node))) {
        // handle custom events for IE8
        handler = createCustomEventWrapper(handler, type);
    }

    handler.type = selector ? type + " " + selector : type;
    handler.callback = callback;

    return handler;
};

// EventHandler eventHooks

if (_.DOM2_EVENTS) {
    eventHooks.relatedTarget = function(e) { return $Element(e.relatedTarget) };
} else {
    eventHooks.relatedTarget = function(e, currentTarget) {
        return $Element(e[(e.toElement === currentTarget ? "from" : "to") + "Element"]);
    };

    eventHooks.defaultPrevented = function(e) { return e.returnValue === false };

    eventHooks.which = function(e) { return e.keyCode };

    eventHooks.button = function(e) {
        var button = e.button;
        // click: 1 === left; 2 === middle; 3 === right
        return button & 1 ? 1 : ( button & 2 ? 3 : ( button & 4 ? 2 : 0 ) );
    };

    eventHooks.pageX = function(e) {
        return e.clientX + docEl.scrollLeft - docEl.clientLeft;
    };

    eventHooks.pageY = function(e) {
        return e.clientY + docEl.scrollTop - docEl.clientTop;
    };
}

if ("onfocusin" in document.documentElement) {
    _.forOwn({focus: "focusin", blur: "focusout"}, function(value, prop) {
        hooks[prop] = function(handler) { handler._type = value };
    });
} else {
    // firefox doesn't support focusin/focusout events
    hooks.focus = hooks.blur = function(handler) { handler.capturing = true };
}

if (document.createElement("input").validity) {
    hooks.invalid = function(handler) { handler.capturing = true };
}

module.exports.hooks = hooks;
