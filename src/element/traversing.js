import { $Element } from "../element/index";
import { MethodError } from "../errors";
import SelectorMatcher from "../util/selectormatcher";

function makeMethod(methodName, propertyName, all) {
    return function(selector) {
        if (selector && typeof selector !== "string") {
            throw new MethodError(methodName, arguments);
        }

        var node = this[0];
        var result = all ? [] : null;

        if (node) {
            const matcher = SelectorMatcher(selector);
            // method closest starts traversing from the element itself
            // except no selector was specified where it returns parent
            if (node && (!matcher || methodName !== "closest")) {
                node = node[propertyName];
            }

            for (var it = node; it; it = it[propertyName]) {
                if (!matcher || matcher(it)) {
                    if (result) {
                        result.push($Element(it));
                    } else {
                        result = $Element(it);
                        // need only the first element
                        break;
                    }
                }
            }
        }

        return result || new $Element();
    };
}

/**
 * Find next sibling element filtered by optional selector
 * @param {String} [selector] CSS selector
 * @return {$Element} Matched element
 * @function
 * @example
 * var div = DOM.create("div>a+b+i"); // <div><a></a><b></b><i></i></div>
 * var link = div.child(0);           // <a>
 * link.next();                       // <b>
 * link.next("i");                    // <i>
 */
$Element.prototype.next = makeMethod("next", "nextElementSibling");

/**
 * Find previous sibling element filtered by optional selector
 * @param {String} [selector] CSS selector
 * @return {$Element} Matched element
 * @function
 * @example
 * var div = DOM.create("div>b+i+a"); // <div><b></b><i></i><a></a></div>
 * var link = div.child(-1);          // <a>
 * link.prev();                       // <i>
 * link.prev("b");                    // <b>
 */
$Element.prototype.prev = makeMethod("prev", "previousElementSibling");

/**
 * Find all next sibling elements filtered by optional selector
 * @param {String} [selector] CSS selector
 * @return {Array.<$Element>} An array of all matched elements
 * @function
 * @example
 * var div = DOM.create("div>a+i+b+i"); // <div><a></a><i></i><b></b><i></i></div>
 * var link = DOM.child(0);             // <a>
 * link.nextAll();                      // [<i>, <b>, <i>]
 * link.nextAll("i");                   // [<i>, <i>]
 */
$Element.prototype.nextAll = makeMethod("nextAll", "nextElementSibling", true);

/**
 * Find all previous sibling elements filtered by optional selector
 * @param {String} [selector] CSS selector
 * @return {Array.<$Element>} An array of all matched elements
 * @function
 * @example
 * var div = DOM.create("div>a+i+b+i"); // <div><i></i><b></b><i></i><a></a></div>
 * var link = DOM.child(-1);            // <a>
 * link.prevAll();                      // [<i>, <b>, <i>]
 * link.prevAll("b");                   // [<b>]
 */
$Element.prototype.prevAll = makeMethod("prevAll", "previousElementSibling", true);

/**
 * Find the closest ancestor of the current element (or the current element itself) which matches selector
 * @param {String} [selector] CSS selector
 * @return {$Element} Matched element
 * @function
 * @example
 * var div = DOM.create("div.foo>div.bar>a"); // <div class="foo"><div class="bar"><a></a></div></div>
 * var link = div.find("a");                  // => <a>
 * link.closest();                            // => <div class="bar">
 * link.closest("a");                         // => itself
 * link.closest(".bar");                      // => <div class="bar">
 * link.closest(".foo");                      // => <div class="foo">
 */
$Element.prototype.closest = makeMethod("closest", "parentNode");
