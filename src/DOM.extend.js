define(["DOM", "Element"], function(DOM, DOMElement) {
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
            throw this.makeError("extend");
        }

        if (selector === "*") {
            // extending element prototype
            _.extend(DOMElement.prototype, mixins);
        } else {
            template = _.map(template || [], DOM.create);
            // update internal element mixins
            DOM.mock(selector, mixins);

            DOM.watch(selector, function(el) {
                _.extend(el, mixins);

                if (mixins.hasOwnProperty("constructor")) {
                    mixins.constructor.apply(el, _.map(template, function(value) {
                        return value.clone();
                    }));
                }
            }, true);
        }
    };
});