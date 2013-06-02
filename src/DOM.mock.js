define(["DOM", "Element", "MockElement"], function(DOM, DOMElement, MockElement, makeError) {
    "use strict";

    (function() {
        var extensions = {};

        /**
         * Return an {@link DOMElement} mock specified for optional selector
         * @memberOf DOM
         * @param  {String} [selector] selector of mock
         * @return {DOMElement} mock instance
         */
        DOM.mock = function(selector, mixins) {
            if (selector && typeof selector !== "string" || mixins && typeof mixins !== "object") {
                throw makeError("mock", "DOM");
            }

            if (!mixins) {
                var el = DOMElement();

                if (selector) {
                    mixins = extensions[selector];

                    _.extend(el, mixins);

                    if (mixins.hasOwnProperty("constructor")) {
                        el.constructor = MockElement;

                        mixins.constructor.call(el);
                    }
                }

                return el;
            }

            extensions[selector] = _.extend(extensions[selector] || {}, mixins);
        };
    })();
});