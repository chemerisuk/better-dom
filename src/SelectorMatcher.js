define([], function(documentElement, _foldl, _some) {
    "use strict";

    /**
     * Helper for css selectors
     * @private
     * @constructor
     */
    // jshint unused:false
    var SelectorMatcher = (function() {
        // Quick matching inspired by
        // https://github.com/jquery/jquery
        var rquickIs = /^(\w*)(?:#([\w\-]+))?(?:\[([\w\-]+)\])?(?:\.([\w\-]+))?$/,
            matchesProp = _foldl("m oM msM mozM webkitM".split(" "), function(result, prefix) {
                var propertyName = prefix + "atchesSelector";

                if (!result) return documentElement[propertyName] && propertyName;
            }, null),
            isEqual = function(val) { return val === this };

        return function(selector) {
            if (typeof selector !== "string") return null;

            var quick = rquickIs.exec(selector);
            // TODO: support attribute value check
            if (quick) {
                //   0  1    2   3          4
                // [ _, tag, id, attribute, class ]
                if (quick[1]) quick[1] = quick[1].toLowerCase();
                if (quick[4]) quick[4] = " " + quick[4] + " ";
            }

            return function(el) {
                if (quick) {
                    return (
                        (!quick[1] || el.nodeName.toLowerCase() === quick[1]) &&
                        (!quick[2] || el.id === quick[2]) &&
                        (!quick[3] || el.hasAttribute(quick[3])) &&
                        (!quick[4] || (" " + el.className + " ").indexOf(quick[4]) >= 0)
                    );
                }

                if (matchesProp) return el[matchesProp](selector);

                return _some(document.querySelectorAll(selector), isEqual, el);
            };
        };
    }());
});
