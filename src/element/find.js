import { register, map, safeCall } from "../util/index";
import { DOCUMENT } from "../const";
import { MethodError } from "../errors";
import { $Element, $Document, $NullElement } from "../types";

// big part of code inspired by Sizzle:
// https://github.com/jquery/sizzle/blob/master/sizzle.js

var rquick = DOCUMENT.getElementsByClassName ? /^(?:(\w+)|\.([\w\-]+))$/ : /^(?:(\w+))$/,
    rescape = /'|\\/g;

register({
    /**
     * Find the first matched element by css selector
     * @memberof! $Element#
     * @alias $Element#find
     * @param  {String} selector css selector
     * @return {$Element} the first matched element
     * @function
     * @example
     * var body = DOM.find("body");  // => <body> wrapper
     * var foo  = body.find(".foo"); // => the first element with class "foo"
     * foo.find(".bar>span");        // => the first element that matches ".bar>span"
     */
    find: "",

    /**
     * Find all matched elements by css selector
     * @memberof! $Element#
     * @alias $Element#findAll
     * @param  {String} selector css selector
     * @return {Array.<$Element>} an array of element wrappers
     * @function
     * @example
     * DOM.findAll("a");         // => all links in the document
     * context.findAll("ol>li"); // => all <li> inside of <ol>
     */
    findAll: "All"

}, (methodName, all) => function(selector) {
    if (typeof selector !== "string") throw new MethodError(methodName, arguments);

    var node = this[0],
        quickMatch = rquick.exec(selector),
        result, old, nid, context;

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
        context = node;

        if (!(this instanceof $Document)) {
            // qSA works strangely on Element-rooted queries
            // We can work around this by specifying an extra ID on the root
            // and working up from there (Thanks to Andrew Dupont for the technique)
            if ( (old = node.getAttribute("id")) ) {
                nid = old.replace(rescape, "\\$&");
            } else {
                nid = "<%= prop('DOM') %>";
                node.setAttribute("id", nid);
            }

            nid = "[id='" + nid + "'] ";
            selector = nid + selector.split(",").join("," + nid);
        }

        result = safeCall(context, "querySelector" + all, selector);

        if (!old) node.removeAttribute("id");
    }

    return all ? map.call(result, $Element) : $Element(result);
}, (methodName, all) => () => all ? [] : new $NullElement());
