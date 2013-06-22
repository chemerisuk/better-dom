define(["SelectorMatcher"], function(SelectorMatcher, DOMElement, _map) {
    "use strict";

    /**
     * Helper type to create an event handler
     * @private
     * @constructor
     */
    var EventHandler = (function() {
        var hooks = {}, legacyIE = !document.addEventListener;

        hooks.currentTarget = function(event, currentTarget) {
            return DOMElement(currentTarget);
        };

        if (legacyIE) {
            hooks.target = function(event) {
                return DOMElement(event.srcElement);
            };
        } else {
            hooks.target = function(event) {
                return DOMElement(event.target);
            };
        }
        
        if (legacyIE) {
            hooks.relatedTarget = function(event, currentTarget) {
                var propName = ( event.toElement === currentTarget ? "from" : "to" ) + "Element";

                return DOMElement(event[propName]);
            };
        } else {
            hooks.relatedTarget = function(event) {
                return DOMElement(event.relatedTarget);
            };
        }

        if (legacyIE) {
            hooks.defaulPrevented = function(event) {
                return event.returnValue === false;
            };
        }

        return function(expr, extras, callback, context, currentTarget) {
            var matcher = SelectorMatcher(expr[3]),
                isCallbackProp = typeof callback === "string",
                defaultEventHandler = function(e) {
                    if (EventHandler.veto !== expr[1]) {
                        var event = e || window.event,
                            fn = isCallbackProp ? context[callback] : callback,
                            result, args;

                        // populate event handler arguments
                        if (expr[2]) {
                            args = _map(expr[2].split(","), function(name) {
                                if (name === "type") return expr[1];

                                var hook = hooks[name];

                                return hook ? hook(event, currentTarget) : event[name];
                            });
                            
                            if (extras) args.push.apply(args, extras);
                        } else {
                            args = extras ? extras.slice(0) : [];
                        }

                        // make performant call
                        if (args.length) {
                            if (fn) result = fn.apply(context, args);
                        } else {
                            result = isCallbackProp ? fn && context[callback]() : fn.call(context);
                        }

                        // prevent default if handler returns false
                        if (result === false) {
                            event.preventDefault ? event.preventDefault() : event.returnValue = false;
                        }
                    }
                };

            return !matcher ? defaultEventHandler : function(e) {
                var el = window.event ? window.event.srcElement : e.target;

                for (; el && el !== currentTarget; el = el.parentNode) {
                    if (matcher.test(el)) return defaultEventHandler(e);
                }
            };
        };
    }());
});
