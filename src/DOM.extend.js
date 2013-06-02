define(["DOM", "Element"], function(DOM, DOMElement, makeError) {
    "use strict";

    /**
     * Define a DOM extension
     * @memberOf DOM
     * @param  {String} selector extension css selector
     * @param  {{after: String, before: String, append: String, prepend: String}} [template] extension templates
     * @param  {Object} mixins extension mixins
     * @example
     * // simple example
     * DOM.extend(".myplugin", {
     *     append: "&#60;span&#62;myplugin text&#60;/span&#62;"
     * }, {
     *     constructor: function() {
     *         // initialize extension
     *     }
     * });
     *
     * // emmet-like syntax example
     * DOM.extend(".mycalendar", {
     *     after: "table>(tr>th*7)+(tr>td*7)*6"
     * }, {
     *     constructor: function() {
     *         // initialize extension
     *     },
     *     method1: function() {
     *         // this method will be mixed into every instance
     *     },
     *     method2: function() {
     *         // this method will be mixed into evety instance
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
            throw makeError("extend", "DOM");
        }

        if (selector === "*") {
            // extending element prototype
            _.extend(DOMElement.prototype, mixins);

            return;
        }

        if (template) {
            _.forOwn(template, function(value, key) {
                template[key] = DOM.create(value);
            });
        }

        // update internal element mixins
        DOM.mock(selector, mixins);

        DOM.watch(selector, function(el) {
            var tpl = {};

            if (template) {
                _.forOwn(template, function(value, key) {
                    tpl[key] = value.clone();
                });
            }

            _.extend(el, mixins);

            if (mixins.hasOwnProperty("constructor")) {
                mixins.constructor.call(el, tpl);
            }
        }, true);
    };
});