define(["DOM", "MockElement"], function(DOM, MockElement) {
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
                throw this.makeError("mock");
            }

            if (!mixins) {
                var el = new MockElement();

                if (selector) {
                    _.extend(el, extensions[selector]);

                    el.constructor = MockElement;
                }

                return el;
            }

            extensions[selector] = _.extend(extensions[selector] || {}, mixins);
        };
    })();
});