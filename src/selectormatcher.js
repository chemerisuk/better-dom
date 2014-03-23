import _ from "./utils";
/*
 * Helper for css selectors
 */
var rquickIs = /^(\w*)(?:#([\w\-]+))?(?:\[([\w\-\=]+)\])?(?:\.([\w\-]+))?$/;
// Quick matching inspired by jQuery
export default function(selector, context) {
    if (typeof selector !== "string") return null;

    var quick = rquickIs.exec(selector);

    if (quick) {
        //   0  1    2   3          4
        // [ _, tag, id, attribute, class ]
        if (quick[1]) quick[1] = quick[1].toLowerCase();
        if (quick[3]) quick[3] = quick[3].split("=");
        if (quick[4]) quick[4] = " " + quick[4] + " ";
    }

    return function(node) {
        var result, found, test;

        if (!quick && !node.webkitMatchesSelector) {
            found = (context || document).querySelectorAll(selector);
            test = function(x) { return x === node };
        }

        for (; node && node.nodeType === 1; node = node.parentNode) {
            if (quick) {
                result = (
                    (!quick[1] || node.nodeName.toLowerCase() === quick[1]) &&
                    (!quick[2] || node.id === quick[2]) &&
                    (!quick[3] || (quick[3][1] ? node.getAttribute(quick[3][0]) === quick[3][1] : node.hasAttribute(quick[3][0]))) &&
                    (!quick[4] || (" " + node.className + " ").indexOf(quick[4]) >= 0)
                );
            } else {
                // querySelectorAll is faster in all browsers except Webkit-based:
                // http://jsperf.com/queryselectorall-vs-matches/3
                if (node.webkitMatchesSelector) {
                    result = node.webkitMatchesSelector(selector);
                } else {
                    result = _.some.call(found, test);
                }
            }

            if (result || !context || node === context) break;
        }

        return result && node;
    };
}
