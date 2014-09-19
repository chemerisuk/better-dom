import { DOCUMENT } from "../constants";
import { StaticMethodError } from "../errors";
import { $Element, DOM } from "../types";

var reTest = /^(?:[a-z-]+|\s*(<.+>)\s*)$/i,
    sandbox = DOCUMENT.createElement("body"),
    makeMethod = (all) => function(value, varMap) {
        var test = reTest.exec(value),
            nodes, el;

        if (value && test && !test[1]) {
            nodes = DOCUMENT.createElement(value);

            if (all) nodes = [ new $Element(nodes) ];
        } else {
            if (test && test[1]) {
                value = varMap ? DOM.format(test[1], varMap) : test[1];
            } else if (typeof value === "string") {
                value = DOM.emmet(value, varMap);
            } else {
                throw new StaticMethodError("create" + all);
            }

            sandbox.innerHTML = value; // parse input HTML string

            for (nodes = all ? [] : null; el = sandbox.firstChild; ) {
                sandbox.removeChild(el); // detach element from the sandbox

                if (el.nodeType === 1) {
                    if (all) {
                        nodes.push(new $Element(el));
                    } else {
                        nodes = el;

                        break; // stop early, because need only the first element
                    }
                }
            }
        }

        return all ? nodes : new $Element(nodes);
    };

/**
 * Create a new {@link $Element} from Emmet or HTML string
 * @memberof DOM
 * @alias DOM.create
 * @param  {String}       value     Emmet or HTML string
 * @param  {Object|Array} [varMap]  key/value map of variables
 * @return {$Element} an element wrapper
 * @function
 * @example
 * DOM.create("div"); // => wrapper of &lt;div&gt;
 * DOM.create("&lt;a&gt;&lt;span&gt;&lt;/span&gt;&lt;/a&gt;"); // => wrapper of &lt;a&gt; + innner &lt;span&gt;
 */
DOM.create = makeMethod("");

/**
 * Create a new array of {@link $Element}s from Emmet or HTML string
 * @memberof DOM
 * @alias DOM.createAll
 * @param  {String}       value     Emmet or HTML string
 * @param  {Object|Array} [varMap]  key/value map of variables
 * @return {Array.<$Element>} an array of element wrappers
 * @function
 * @example
 * DOM.createAll("&lt;span&gt;&lt;/span&gt;&lt;b&gt;&lt;/b&gt;"); // => array with 2 $Elements: &lt;span&gt; and &lt;b&gt;
 * DOM.createAll("li*5"); // => array with 5 &lt;li&gt; $Elements
 */
DOM.createAll = makeMethod("All");