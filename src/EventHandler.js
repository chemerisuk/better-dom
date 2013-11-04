/*
 * Helper type to create an event handler
 */
var _ = require("./utils"),
    $Element = require("./element"),
    SelectorMatcher = require("./selectormatcher"),
    documentElement = document.documentElement,
    hooks = {},
    debouncedEvents = "scroll mousemove",
    createCustomEventWrapper = function(originalHandler, type) {
        var handler = function() {
                if (window.event.srcUrn === type) originalHandler();
            };

        handler._type = "dataavailable";

        return handler;
    },
    createDebouncedEventWrapper = function(originalHandler) {
        var canProcess = true;

        return function(e) {
            if (canProcess) {
                canProcess = false;

                _.requestAnimationFrame(function() {
                    originalHandler(e);

                    canProcess = true;
                });
            }
        };
    },
    testEl = document.createElement("div");

if (document.addEventListener) {
    hooks.relatedTarget = function(event) {
        return $Element(event.relatedTarget);
    };
} else {
    hooks.relatedTarget = function(event, currentTarget) {
        var propName = ( event.toElement === currentTarget ? "from" : "to" ) + "Element";

        return $Element(event[propName]);
    };

    hooks.defaultPrevented = function(event) {
        return event.returnValue === false;
    };

    hooks.which = function(event) {
        var button = event.button;

        if (button !== undefined) {
            // click: 1 === left; 2 === middle; 3 === right
            return button & 1 ? 1 : ( button & 2 ? 3 : ( button & 4 ? 2 : 0 ) );
        } else {
            // add which for key events
            return event.charCode || event.keyCode || undefined;
        }
    };

    hooks.pageX = function(event) {
        return event.clientX + documentElement.scrollLeft - documentElement.clientLeft;
    };

    hooks.pageY = function(event) {
        return event.clientY + documentElement.scrollTop - documentElement.clientTop;
    };
}

function EventHandler(type, selector, context, callback, extras, currentTarget) {
    context = context || currentTarget;
    extras = extras || ["target", "defaultPrevented"];

    var matcher = SelectorMatcher(selector),
        isCallbackProp = typeof callback === "string",
        defaultEventHandler = function(e, target) {
            e = e || window.event;

            if (EventHandler.veto !== type) {
                var fn = isCallbackProp ? context[callback] : callback,
                    args = _.map(extras, function(name) {
                        switch (name) {
                        case "type":
                            return type;
                        case "currentTarget":
                            return currentTarget;
                        case "target":
                            if (!target) target = e.target || e.srcElement;
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
