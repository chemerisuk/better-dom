define(["Element"], function(DOMElement) {
    "use strict";

    /**
     * Helper for events
     * @private
     * @constructor
     */
    function EventHelper(event, currentTarget) {
        this._event = event;
        this._currentTarget = currentTarget;
    }

    (function() {
        var hooks = {},
            returnTrue = function() { return true; },
            makeFuncMethod = function(name, propName, legacyHandler) {
                return !document.addEventListener ? legacyHandler : function() {
                    this._event[name]();

                    // IE9 behaves strangely with defaultPrevented so
                    // it's safer manually overwrite the getter
                    this[propName] = returnTrue;
                };
            };

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
    }());
});