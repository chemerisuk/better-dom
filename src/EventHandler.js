define(["SelectorMatcher"], function(SelectorMatcher, $Element, _map, documentElement) {
    "use strict";

    /**
     * Helper type to create an event handler
     * @private
     * @constructor
     */
    var EventHandler = (function() {
        var hooks = {};

        hooks.currentTarget = function(event, currentTarget) {
            return $Element(currentTarget);
        };

        if (document.addEventListener) {
            hooks.target = function(event) {
                return $Element(event.target);
            };

            hooks.relatedTarget = function(event) {
                return $Element(event.relatedTarget);
            };
        } else {
            hooks.target = function(event) {
                return $Element(event.srcElement);
            };

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
                return event.clientX + documentElement.scrollLeft;
            };

            hooks.pageY = function(event) {
                return event.clientY + documentElement.scrollTop;
            };
        }

        return function(type, selector, context, callback, extras, currentTarget) {
            var matcher = SelectorMatcher(selector),
                isCallbackProp = typeof callback === "string",
                defaultEventHandler = function(e) {
                    if (EventHandler.veto !== type) {
                        var event = e || window.event,
                            fn = isCallbackProp ? context[callback] : callback,
                            args = _map(extras, function(name) {
                                if (name === "type") return type;

                                var hook = hooks[name];

                                return hook ? hook(event, currentTarget) : event[name];
                            }),
                            result;

                        if (!fn) return;

                        // make performant call
                        if (args.length) {
                            result = fn.apply(context, args);
                        } else {
                            result = isCallbackProp ? context[callback]() : fn.call(context);
                        }

                        // prevent default if handler returns false
                        if (result === false) {
                            if (event.preventDefault) {
                                event.preventDefault();
                            } else {
                                event.returnValue = false;
                            }
                        }
                    }
                };

            return !matcher ? defaultEventHandler : function(e) {
                var node = window.event ? window.event.srcElement : e.target;

                for (; node && node !== currentTarget; node = node.parentNode) {
                    if (matcher.test(node)) return defaultEventHandler(e);
                }
            };
        };
    }());
});
