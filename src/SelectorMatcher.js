define([], function(_foldl) {
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
                if (this instanceof SelectorMatcher) {
                    this.selector = selector;

                    var quick = rquickIs.exec(selector);
                    // TODO: support attribute value check
                    if (this.quick = quick) {
                        //   0  1    2   3          4
                        // [ _, tag, id, attribute, class ]
                        if (quick[1]) quick[1] = quick[1].toLowerCase();
                        if (quick[4]) quick[4] = " " + quick[4] + " ";
                    }
                } else {
                    return selector ? new SelectorMatcher(selector) : null;
                }
            },
            matchesProp = _foldl("m oM msM mozM webkitM".split(" "), function(result, prefix) {
                var propertyName = prefix + "atchesSelector";

                return result || document.documentElement[propertyName] && propertyName;
            }, null),
            matches = function(el, selector) {
                var nodeList = document.querySelectorAll(selector);

                for (var i = 0, n = nodeList.length; i < n; ++i) {
                    if (nodeList[i] === el) return true;
                }

                return false;
            };

        ctor.prototype = {
            test: function(el) {
                if (this.quick) {
                    return (
                        (!this.quick[1] || (el.nodeName || "").toLowerCase() === this.quick[1]) &&
                        (!this.quick[2] || el.id === this.quick[2]) &&
                        (!this.quick[3] || el.hasAttribute(this.quick[3])) &&
                        (!this.quick[4] || !!~((" " + (el.className || "") + " ").indexOf(this.quick[4])))
                    );
                }

                return matchesProp ? el[matchesProp](this.selector) : matches(el, this.selector);
            }
        };

        return ctor;
    })();
});