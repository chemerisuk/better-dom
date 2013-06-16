define(["SelectorMatcher"], function(SelectorMatcher, DOMElement, _map) {
    "use strict";

    /**
     * Helper type to create an event handler
     * @private
     * @constructor
     */
    var EventHandler = (function() {
        var hooks = {};

        hooks.currentTarget = function(event, currentTarget) {
            return DOMElement(currentTarget);
        };

        if (document.addEventListener) {
            hooks.target = function(event) {
                return DOMElement(event.target);
            };
        } else {
            hooks.target = function(event) {
                return DOMElement(event.srcElement);
            };
        }
        
        if (document.addEventListener) {
            hooks.relatedTarget = function(event) {
                return DOMElement(event.relatedTarget);
            };
        } else {
            hooks.relatedTarget = function(event, currentTarget) {
                var propName = ( event.toElement === currentTarget ? "from" : "to" ) + "Element";

                return DOMElement(event[propName]);
            };
        }

        return function(type, selector, options, callback, extras, context, currentTarget) {
            var matcher = SelectorMatcher(selector),
                isCallbackProp = typeof callback === "string",
                defaultEventHandler = function(e) {
                    if (EventHandler.veto !== type) {
                        var event = e || window.event,
                            fn = isCallbackProp ? context[callback] : callback,
                            cancel = options.cancel,
                            stop = options.stop,
                            args;

                        // populate event handler arguments
                        if (options.args) {
                            args = _map(options.args, function(name) {
                                if (name === "type") return type;

                                var hook = hooks[name];

                                return hook ? hook(event, currentTarget) : event[name];
                            });
                            
                            if (extras) args.push.apply(args, extras);
                        } else {
                            args = extras ? extras.slice(0) : [];
                        }

                        if (typeof cancel === "function") cancel = cancel.apply(context, args);
                        if (typeof stop === "function") stop = stop.apply(context, args);

                        // handle event modifiers
                        if (cancel === true) {
                            event.preventDefault ? event.preventDefault() : event.returnValue = false;
                        }

                        if (stop === true) {
                            event.stopPropagation ? event.stopPropagation() : event.cancelBubble = true;
                        }

                        // optimizations
                        if (args.length) {
                            if (fn) fn.apply(context, args);
                        } else {
                            isCallbackProp ? fn && context[callback]() : fn.call(context);
                        }
                    }
                };

            return !selector ? defaultEventHandler : function(e) {
                var el = window.event ? window.event.srcElement : e.target;

                for (; el && el !== currentTarget; el = el.parentNode) {
                    if (matcher.test(el)) {
                        defaultEventHandler(e);

                        break;
                    }
                }
            };
        };
    }());
});
