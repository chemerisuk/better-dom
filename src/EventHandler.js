define(["SelectorMatcher"], function(SelectorMatcher, DOMElement, _map) {
    "use strict";

    /**
     * Helper type to create an event handler
     * @private
     * @constructor
     */
    var EventHandler = (function() {
        var hooks = {},
            returnTrue = function() { return true; },
            makeFuncMethod = function(name, propName, legacyHandler) {
                return !document.addEventListener ? legacyHandler : function() {
                    this._event[name]();

                    // IE9 behaves strange with defaultPrevented so
                    // it's safer manually overwrite the getter
                    this[propName] = returnTrue;
                };
            };
        
        function EventHelper(event, currentTarget) {
            this._event = event;
            this._currentTarget = currentTarget;
        }

        EventHelper.prototype = {
            get: function(name) {
                var hook = hooks[name];

                return hook ? hook(this) : this._event[name];
            },
            preventDefault: makeFuncMethod("preventDefault", "isDefaultPrevented", function() {
                this._event.returnValue = false;
            }),
            stopPropagation: makeFuncMethod("stopPropagation", "isBubbleCanceled", function() {
                this._event.cancelBubble = true;
            }),
            isDefaultPrevented: function() {
                return this._event.defaultPrevented || this._event.returnValue === false;
            },
            isBubbleCanceled: function() {
                return this._event.bubbleCanceled || this._event.cancelBubble === true;
            }
        };

        hooks.currentTarget = function(thisArg) {
            return DOMElement(thisArg._currentTarget);
        };

        if (document.addEventListener) {
            hooks.target = function(thisArg) {
                return DOMElement(thisArg._event.target);
            };
        } else {
            hooks.target = function(thisArg) {
                return DOMElement(thisArg._event.srcElement);
            };
        }
        
        if (document.addEventListener) {
            hooks.relatedTarget = function(thisArg) {
                return DOMElement(thisArg._event.relatedTarget);
            };
        } else {
            hooks.relatedTarget = function(thisArg) {
                var propName = ( thisArg._event.toElement === thisArg._currentTarget ? "from" : "to" ) + "Element";

                return DOMElement(thisArg._event[propName]);
            };
        }

        return function(type, selector, options, callback, extras, context, thisArg) {
            var currentTarget = thisArg._node,
                matcher = SelectorMatcher(selector),
                defaultEventHandler = function(e) {
                    if (EventHandler.veto !== type) {
                        var eventHelper = new EventHelper(e || window.event, currentTarget),
                            fn = typeof callback === "string" ? context[callback] : callback,
                            args;

                        // handle modifiers
                        if (options.cancel) eventHelper.preventDefault();
                        if (options.stop) eventHelper.stopPropagation();

                        // populate extra event arguments
                        if (options.args) {
                            args = _map(options.args, eventHelper.get, eventHelper);
                            
                            if (extras) args.push.apply(args, extras);
                        } else {
                            args = extras ? extras.slice(0) : [];
                        }

                        if (fn) fn.apply(context, args);
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
