define(["DOM", "Element"], function(DOM, $Element, _map, _forEach, _extend, _makeError) {
    "use strict";

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
            template = _map(template || [], DOM.create);
            // update internal element mixins
            DOM.mock(selector, mixins);

            DOM.watch(selector, function(el) {
                _extend(el, mixins);

                if (mixins.hasOwnProperty("constructor")) {
                    mixins.constructor.apply(el, _map(template, function(value) {
                        return value.clone();
                    }));
                }
            }, true);
        }
    };
});
