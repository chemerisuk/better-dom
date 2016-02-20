import { HTML, VENDOR_PREFIXES } from "../const";

/* es6-transpiler has-iterators:false, has-generators: false */

// Helper for css selectors

var rquickIs = /^(\w*)(?:#([\w\-]+))?(?:\[([\w\-\=]+)\])?(?:\.([\w\-]+))?$/,
    propName = VENDOR_PREFIXES.concat(null)
        .map((p) => (p ? p.toLowerCase() + "M" : "m") + "atchesSelector")
        .reduceRight((propName, p) => propName || p in HTML && p, null);

export default function(selector, context) {
    if (typeof selector !== "string") return null;

    var quick = rquickIs.exec(selector);

    if (quick) {
        // Quick matching is inspired by jQuery:
        //   0  1    2   3          4
        // [ _, tag, id, attribute, class ]
        if (quick[1]) quick[1] = quick[1].toLowerCase();
        if (quick[3]) quick[3] = quick[3].split("=");
        if (quick[4]) quick[4] = " " + quick[4] + " ";
    }

    return function(node) {
        var result, found;
        /* istanbul ignore if */
        if (!quick && !propName) {
            found = (context || node.ownerDocument).querySelectorAll(selector);
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
                /* istanbul ignore else */
                if (propName) {
                    result = node[propName](selector);
                } else {
                    for (let i = 0, n = found.length; i < n; ++i) {
                        let n = found[i];

                        if (n === node) return n;
                    }
                }
            }

            if (result || !context || node === context) break;
        }

        return result && node;
    };
}
