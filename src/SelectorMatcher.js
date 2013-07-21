define([], function(documentElement, _foldl, _some) {
    "use strict";

    /**
     * Helper for css selectors
     * @private
     * @constructor
     */
    var SelectorMatcher = (function() {
        // Quick matching inspired by
        // https://github.com/jquery/jquery
        var rquickIs = /^(\w*)(?:#([\w\-]+))?(?:\[([\w\-]+)\])?(?:\.([\w\-]+))?$/,
            ctor =  function(selector) {
                if (!(this instanceof SelectorMatcher)) {
                    return selector ? new SelectorMatcher(selector) : null;
                }

                this.selector = selector;

                var quick = rquickIs.exec(selector);
                // TODO: support attribute value check
                if (this.quick = quick) {
                    //   0  1    2   3          4
                    // [ _, tag, id, attribute, class ]
                    if (quick[1]) quick[1] = quick[1].toLowerCase();
                    if (quick[4]) quick[4] = " " + quick[4] + " ";
                }
            },
            matchesProp = _foldl("m oM msM mozM webkitM".split(" "), function(result, prefix) {
                var propertyName = prefix + "atchesSelector";

                if (!result) return documentElement[propertyName] && propertyName;
            }, null),
            matchesFunc = (function() {
                var isEqual = function(val) { return val === this; };

                return function(el, selector) {
                    return _some(document.querySelectorAll(selector), isEqual, el);
                };
            }());

        ctor.prototype = {
            test: function(el) {
                if (this.quick) {
                    return (
                        (!this.quick[1] || (el.nodeName || "").toLowerCase() === this.quick[1]) &&
                        (!this.quick[2] || el.id === this.quick[2]) &&
                        (!this.quick[3] || el.hasAttribute(this.quick[3])) &&
                        (!this.quick[4] || (" " + (el.className || "") + " ").indexOf(this.quick[4]) >= 0)
                    );
                }

                return matchesProp ? el[matchesProp](this.selector) : matchesFunc(el, this.selector);
            }
        };

        return ctor;
    }());
});
