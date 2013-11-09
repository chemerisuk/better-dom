/*
 * Helper type to create an event handler
 */
var _ = require("./utils"),
    $Element = require("./element"),
    SelectorMatcher = require("./selectormatcher"),
    hooks = require("./eventhandler.hooks"),
    debouncedEvents = "scroll mousemove",
    defaultArgs = ["target", "defaultPrevented"],
    defaultArgsWithData = ["_data", "target", "defaultPrevented"],
    createCustomEventWrapper = function(originalHandler, type) {
        var handler = function() {
                if (window.event.srcUrn === type) originalHandler();
            };

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
        isCallbackProp = typeof callback === "string",
        defaultEventHandler = function(e, target) {
            e = e || window.event;

            if (EventHandler.veto !== type) {
                var fn = isCallbackProp ? context[callback] : callback,
                    args = extras || (e._data ? defaultArgsWithData : defaultArgs);

                args = _.map(args, function(name) {
                    switch (name) {
                    case "type":
                        return type;
                    case "currentTarget":
                        return currentTarget;
                    case "target":
                        target = target || e.target || e.srcElement;
                        // handle DOM variable correctly
                        return target ? $Element(target) : DOM;
                    }

                    var hook = hooks[name];

                    return hook ? hook(e, currentTarget._node) : e[name];
                });

                if (fn && fn.apply(context, args) === false) {
                    // prevent default if handler returns false
                    if (e.preventDefault) {
                        e.preventDefault();
                    } else {
                        e.returnValue = false;
                    }
                }
            }
        },
        result;

    result = !matcher ? defaultEventHandler : function(e) {
        var node = window.event ? window.event.srcElement : e.target,
            root = currentTarget._node;

        for (; node && node !== root; node = node.parentNode) {
            if (matcher(node)) return defaultEventHandler(e, node);
        }
    };

    if (~debouncedEvents.indexOf(type)) {
        result = createDebouncedEventWrapper(result);
    } else if (!document.addEventListener && (type === "submit" || !("on" + type in testEl))) {
        // handle custom events for IE8
        result = createCustomEventWrapper(result, type);
    }

    return result;
}

module.exports = EventHandler;
