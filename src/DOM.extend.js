define(["DOM", "Element"], function(DOM, $Element, $NullElement, _map, _forOwn, _forEach, _extend, _slice, _makeError) {
    "use strict";

    (function(){
        var watchers = {};

        /**
         * Define a DOM extension
         * @memberOf DOM
         * @param  {String}          selector extension css selector
         * @param  {Object|Function} mixins   extension mixins/constructor function
         * @example
         * DOM.extend(".myplugin", {
         *     constructor: function() {
         *         // initialize extension
         *     },
         *     method: function() {
         *         // this method will be mixed into every matched element
         *     }
         * });
         */
        DOM.extend = function(selector, mixins) {
            if (typeof mixins === "function") mixins = {constructor: mixins};

            if (!mixins || typeof mixins !== "object" || (selector !== "*" && ~selector.indexOf("*"))) {
                throw _makeError("extend", this);
            }

            if (selector === "*") {
                // extending element prototype
                _extend($Element.prototype, mixins);
            } else {
                var watcher = function(el) {
                        _extend(el, mixins);

                        if (mixins.hasOwnProperty("constructor")) {
                            mixins.constructor.apply(el);

                            el.constructor = $Element;
                        }
                    };

                (watchers[selector] = watchers[selector] || []).push(watcher);

                DOM.watch(selector, watcher, true);
            }
        };

        /**
         * Synchronously return dummy {@link $Element} instance specified for optional selector
         * @memberOf DOM
         * @param  {String} [selector] selector of mock
         * @return {$Element} mock instance
         */
        DOM.mock = function(content) {
            if (content && typeof content !== "string") {
                throw _makeError("mock", this);
            }

            var el = content ? DOM.create(content) : new $NullElement(),
                makeMock = function(el) {
                    _forOwn(watchers, function(watchers, selector) {
                        if (el.matches(selector)) {
                            _forEach(watchers, function(watcher) { watcher(el); });
                        }
                    });
                };

            if (content) {
                makeMock(el);

                el.findAll("*").each(makeMock);
            }

            return el;
        };
    }());
});
