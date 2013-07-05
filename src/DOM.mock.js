define(["DOM", "CompositeElement"], function(DOM, $CompositeElement, _extend, _makeError) {
    "use strict";

    (function() {
        var extensions = {};

        /**
         * Return an {@link $Element} mock specified for optional selector
         * @memberOf DOM
         * @param  {String} [selector] selector of mock
         * @return {$Element} mock instance
         */
        DOM.mock = function(selector, mixins) {
            if (selector && typeof selector !== "string" || mixins && typeof mixins !== "object") {
                throw _makeError("mock", this);
            }

            if (!mixins) {
                var el = new $CompositeElement();

                if (selector) {
                    _extend(el, extensions[selector]);

                    el.constructor = $CompositeElement;
                }

                return el;
            }

            extensions[selector] = _extend(extensions[selector] || {}, mixins);
        };
    })();
});