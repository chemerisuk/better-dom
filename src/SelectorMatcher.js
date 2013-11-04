/*
 * Helper for css selectors
 */
var _ = require("./utils"),
    // Quick matching inspired by
    // https://github.com/jquery/jquery
    rquickIs = /^(\w*)(?:#([\w\-]+))?(?:\[([\w\-]+)\])?(?:\.([\w\-]+))?$/,
    matchesProp = _.foldl("m oM msM mozM webkitM".split(" "), function(result, prefix) {
        var propertyName = prefix + "atchesSelector";

        if (!result) return document.documentElement[propertyName] && propertyName;
    }, null),
    isEqual = function(val) { return val === this };

module.exports = function(selector) {
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

        return _.some(document.querySelectorAll(selector), isEqual, el);
    };
};
