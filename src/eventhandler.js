/*
 * Helper type to create an event handler
 */
var _ = require("./utils"),
    $Element = require("./element"),
    SelectorMatcher = require("./selectormatcher"),
    features = require("./features"),
    hooks = require("./eventhandler.hooks"),
    debouncedEvents = "scroll mousemove",
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

function EventHandler(type, selector, callback, props, el, once) {
    var matcher = SelectorMatcher(selector),
        handler = function(e) {
            if (EventHandler.skip === type) return; // early stop in case of default action

            e = e || window.event;

            var target = e.target || e.srcElement,
                root = el._node,
                fn = typeof callback === "string" ? el[callback] : callback,
                args = props || ["target", "defaultPrevented"];

            if (typeof fn !== "function") return; // early stop for late binding

            for (; matcher && !matcher(target); target = target.parentNode) {
                if (!target || target === root) return; // no matched element was found
            }

            // off callback even if it throws an exception later
            if (once) el.off(type, callback);

            args = _.map(args, function(name) {
                switch (name) {
                case "type":
                    return type;
                case "currentTarget":
                    return el;
                case "target":
                    // handle DOM variable correctly
                    return target ? $Element(target) : DOM;
                }

                var hook = hooks[name];

                return hook ? hook(e, root) : e[name];
            });

            // prepend extra arguments if they exist
            if (e._args && e._args.length) args = e._args.concat(args);

            if (fn.apply(el, args) === false) {
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
