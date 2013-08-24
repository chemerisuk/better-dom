define(["DOM", "Element"], function(DOM, $Element, _map, _forOwn, _forEach, _extend, _slice, _makeError) {
    "use strict";

    (function(){
        var watchers = {};

        /**
         * Define a DOM extension
         * @memberOf DOM
         * @param  {String} selector extension css selector
         * @param  {Array}  [template] extension templates
         * @param  {Object} mixins extension mixins
         * @example
         * DOM.extend(".myplugin", [
         *     "&#60;span&#62;myplugin text&#60;/span&#62;"
         * ], {
         *     constructor: function(tpl) {
         *         // initialize extension
         *     }
         * });
         *
         * // emmet-like syntax example
         * DOM.extend(".mycalendar", [
         *     "table>(tr>th*7)+(tr>td*7)*6"
         * ], {
         *     constructor: function(tpl) {
         *         // initialize extension
         *     },
         *     method: function() {
         *         // this method will be mixed into every instance
         *     }
         * });
         */
        DOM.extend = function(selector, template, mixins) {
            if (mixins === undefined) {
                mixins = template;
                template = undefined;
            }

            if (typeof mixins === "function") {
                mixins = {constructor: mixins};
            }

            if (!mixins || typeof mixins !== "object" || (selector !== "*" && ~selector.indexOf("*"))) {
                throw _makeError("extend", this);
            }

            if (selector === "*") {
                // extending element prototype
                _extend($Element.prototype, mixins);
            } else {
                var clones = _map(template, function(html) { return DOM.create(html); }),
                    watcher = function(el) {
                        _extend(el, mixins);

                        if (mixins.hasOwnProperty("constructor")) {
                            mixins.constructor.apply(el, _map(clones, function(proto) { return proto.clone(); }));

                            el.constructor = $Element;
                        }
                    };

                (watchers[selector] = watchers[selector] || []).push(watcher);

                DOM.watch(selector, watcher, true);
            }
        };

        /**
         * Return an {@link $Element} mock specified for optional selector
         * @memberOf DOM
         * @param  {String} [selector] selector of mock
         * @return {$Element} mock instance
         */
        DOM.mock = function(content) {
            if (content && typeof content !== "string") {
                throw _makeError("mock", this);
            }

            var el = content ? DOM.create(content) : $Element(),
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
