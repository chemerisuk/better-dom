define(["DOM", "Collection"], function(DOM, DOMCollection, _extend, _makeError) {
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
                var el = new DOMCollection();

                if (selector) {
                    _extend(el, extensions[selector]);

                    el.constructor = DOMCollection;
                }

                return el;
            }

            extensions[selector] = _extend(extensions[selector] || {}, mixins);
        };
    })();
});