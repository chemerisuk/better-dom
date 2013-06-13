define(["DOM", "NullElement"], function(DOM, NullElement, _extend, _makeError) {
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
                throw _makeError("mock", this);
            }

            if (!mixins) {
                var el = new NullElement();

                if (selector) {
                    _extend(el, extensions[selector]);

                    el.constructor = NullElement;
                }

                return el;
            }

            extensions[selector] = _extend(extensions[selector] || {}, mixins);
        };
    })();
});