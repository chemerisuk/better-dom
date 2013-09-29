define(["DOM", "Element"], function(DOM, $Element, $NullElement, _map, _forOwn, _forEach, _extend, _slice, _makeError) {
    "use strict";

    (function(){
        var watchers = {};

        /**
         * Define a DOM extension
         * @memberOf DOM
         * @param  {String}          selector extension css selector
         * @param  {Object|Function} mixins   extension mixins/constructor function
         * @tutorial Living extensions
         */
        DOM.extend = function(selector, mixins) {
            if (typeof mixins === "function") mixins = {constructor: mixins};

            if (!mixins || typeof mixins !== "object") {
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

            return this;
        };

        /**
         * Synchronously return dummy {@link $Element} instance specified for optional selector
         * @memberOf DOM
         * @param  {Mixed} [content] mock element content
         * @return {$Element} mock instance
         */
        DOM.mock = function(content) {
            var el = content ? DOM.create(content) : new $NullElement(),
                applyWatchers = function(el) {
                    _forOwn(watchers, function(watchers, selector) {
                        if (el.matches(selector)) {
                            _forEach(watchers, function(watcher) { watcher(el); });
                        }
                    });

                    el.children().each(applyWatchers);
                };

            if (content) applyWatchers(el);

            return el;
        };
    }());
});
