import { MethodError } from "../errors";
import { DOCUMENT } from "../constants";
import { $Element, DOM } from "../types";

/* es6-transpiler has-iterators:false, has-generators: false */

// big part of code inspired by Sizzle:
// https://github.com/jquery/sizzle/blob/master/sizzle.js

var rquickExpr = DOCUMENT.getElementsByClassName ? /^(?:(\w+)|\.([\w\-]+))$/ : /^(?:(\w+))$/,
    rescape = /'|\\/g,
    tmpId = "DOM" + Date.now();

/**
 * Find the first matched element by css selector
 * @memberof! $Element#
 * @alias $Element#find
 * @param  {String} selector css selector
 * @return {$Element} the first matched element
 */
$Element.prototype.find = function(selector, /*INTERNAL*/all = "") {
    if (typeof selector !== "string") throw new MethodError("find" + all);

    var node = this[0],
        quickMatch = rquickExpr.exec(selector),
        result, old, nid, context;

    if (!node) return all ? [] : new $Element();

    if (quickMatch) {
        if (quickMatch[1]) {
            // speed-up: "TAG"
            result = node.getElementsByTagName(selector);
        } else {
            // speed-up: ".CLASS"
            result = node.getElementsByClassName(quickMatch[2]);
        }

        if (result && !all) result = result[0];
    } else {
        old = true;
        nid = tmpId;
        context = node;

        if (this !== DOM) {
            // qSA works strangely on Element-rooted queries
            // We can work around this by specifying an extra ID on the root
            // and working up from there (Thanks to Andrew Dupont for the technique)
            if ( (old = node.getAttribute("id")) ) {
                nid = old.replace(rescape, "\\$&");
            } else {
                node.setAttribute("id", nid);
            }

            nid = "[id='" + nid + "'] ";
            selector = nid + selector.split(",").join("," + nid);
        }

        try {
            result = context["querySelector" + all](selector);
        } finally {
            if (!old) node.removeAttribute("id");
        }
    }

    return all ? [for (n of result) $Element(n)] : $Element(result);
};

/**
 * Find all matched elements by css selector
 * @memberof! $Element#
 * @alias $Element#findAll
 * @param  {String} selector css selector
 * @return {Array} matched elements
 */
$Element.prototype.findAll = function(selector) {
    return this.find(selector, "All");
};
