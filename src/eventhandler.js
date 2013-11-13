/*
 * Helper type to create an event handler
 */
var _ = require("./utils"),
    $Element = require("./element"),
    SelectorMatcher = require("./selectormatcher"),
    features = require("./features"),
    hooks = require("./eventhandler.hooks"),
    debouncedEvents = "scroll mousemove",
    defaultArgs = ["target", "defaultPrevented"],
    defaultArgsWithData = ["_data", "target", "defaultPrevented"],
    createCustomEventWrapper = function(originalHandler, type) {
        var handler = function() { if (window.event.srcUrn === type) originalHandler() };

        handler._type = "dataavailable";

        return handler;
    },
    createDebouncedEventWrapper = function(originalHandler, debouncing) {
        return function(e) {
            if (!debouncing) {
                debouncing = true;

                _.requestAnimationFrame(function() {
                    originalHandler(e);

                    debouncing = false;
                });
            }
        };
    },
    testEl = document.createElement("div");

function EventHandler(type, selector, context, callback, extras, currentTarget) {
    context = context || currentTarget;

    var matcher = SelectorMatcher(selector),
        handler = function(e) {
            if (EventHandler.veto === type) return;

            e = e || window.event;

            var target = e.target || e.srcElement,
                root = currentTarget._node,
                fn = typeof callback === "string" ? context[callback] : callback,
                args = extras || (e._data ? defaultArgsWithData : defaultArgs);

            for (; matcher && !matcher(target); target = target.parentNode) {
                if (!target || target === root) return; // no matched element was found
            }

            args = _.map(args, function(name) {
                switch (name) {
                case "type":
                    return type;
                case "currentTarget":
                    return currentTarget;
                case "target":
                    // handle DOM variable correctly
                    return target ? $Element(target) : DOM;
                }

                var hook = hooks[name];

                return hook ? hook(e, root) : e[name];
            });

            if (typeof fn === "function" && fn.apply(context, args) === false) {
                // prevent default if handler returns false
                if (features.DOM2_EVENTS) {
                    e.preventDefault();
                } else {
                    e.returnValue = false;
                }
            }
        };

    if (~debouncedEvents.indexOf(type)) {
        handler = createDebouncedEventWrapper(handler);
    } else if (!features.DOM2_EVENTS && (type === "submit" || !("on" + type in testEl))) {
        // handle custom events for IE8
        handler = createCustomEventWrapper(handler, type);
    }

    return handler;
}

module.exports = EventHandler;
