import { map } from "../util/index";
import { MethodError } from "../errors";
import { $Node } from "../node/index";
import { $Element } from "../element/index";
import { $Document } from "../document/index";

// big part of code inspired by Sizzle:
// https://github.com/jquery/sizzle/blob/master/sizzle.js

const REGEXP_QUICK = /^(?:(\w+)|\.([\w\-]+))$/;
const REGEXP_ESCAPE = /'|\\/g;

function makeMethod(methodName, all) {
    return function(selector) {
        if (typeof selector !== "string") {
            throw new MethodError(methodName, arguments);
        }

        const node = this[0];

        if (!node) return all ? [] : new $Node();

        let result;

        if (this instanceof $Document || this instanceof $Element) {
            const quickMatch = REGEXP_QUICK.exec(selector);

            if (quickMatch) {
                if (quickMatch[1]) {
                    // speed-up: "TAG"
                    result = node.getElementsByTagName(selector);
                } else {
                    // speed-up: ".CLASS"
                    result = node.getElementsByClassName(quickMatch[2]);
                }

                if (result && !all) result = result[0];
            } else if (this instanceof $Element) {
                const id = node.getAttribute("id");

                // qSA works strangely on Element-rooted queries
                // We can work around this by specifying an extra ID on the root
                // and working up from there (Thanks to Andrew Dupont for the technique)

                let prefix;
                if (id) {
                    prefix = id.replace(REGEXP_ESCAPE, "\\$&");
                } else {
                    prefix = "_<%= prop() %>";
                    // set fake id attribute value
                    node.setAttribute("id", prefix);
                }

                prefix = "[id='" + prefix + "'] ";
                selector = prefix + selector.split(",").join("," + prefix);

                result = node["querySelector" + all](selector);
                // cleanup fake id attribute value
                if (!id) node.removeAttribute("id");
            } else {
                result = node["querySelector" + all](selector);
            }
        } else {
            result = node["querySelector" + all](selector);
        }

        return all ? map.call(result, $Element) : $Element(result);
    };
}

/**
 * Find the first matched element in the current context by a CSS selector
 * @param  {String} selector CSS selector
 * @return {$Element} The first matched element
 * @function
 * @example
 * var body = DOM.find("body");  // => <body> wrapper
 * var foo  = body.find(".foo"); // => the first element with class "foo"
 * foo.find(".bar>span");        // => the first element that matches ".bar>span"
 */
$Node.prototype.find = makeMethod("find", "");

/**
 * Find all matched elements in the current context by a CSS selector
 * @param  {String} selector CSS selector
 * @return {Array.<$Element>} An array of matched elements
 * @function
 * @example
 * DOM.findAll("a");         // => all links in the document
 * context.findAll("ol>li"); // => all <li> inside of <ol>
 */
$Node.prototype.findAll = makeMethod("findAll", "All");
