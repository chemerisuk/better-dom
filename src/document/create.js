import { $Element, $Document, DOM } from "../types";
import tagCache from "../dom/emmet";

var makeMethod = (all) => function(value, varMap) {
        var doc = this[0].ownerDocument,
            sandbox = doc.createElement("div");

        this["create" + all] = (value, varMap) => {
            var nodes, el;

            if (value && value in tagCache) {
                nodes = doc.createElement(value);

                if (all) nodes = [ new $Element(nodes) ];
            } else {
                value = value.trim();

                if (value[0] === "<" && value[value.length - 1] === ">") {
                    value = varMap ? DOM.format(value, varMap) : value;
                } else {
                    value = DOM.emmet(value, varMap);
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

            return all ? nodes : $Element(nodes);
        };

        return this["create" + all](value, varMap);
    };

/**
 * Create a new {@link $Element} from Emmet or HTML string
 * @memberof! $Document#
 * @alias $Document#create
 * @param  {String}       value     Emmet or HTML string
 * @param  {Object|Array} [varMap]  key/value map of variables
 * @return {$Element} an element wrapper
 * @function
 * @example
 * DOM.create("div");                  // => wrapper of <div>
 * DOM.create("span>`{0}`", ["foo"]);  // => wrapper of <span>foo</span>
 * DOM.create("<a><span></span></a>"); // => wrapper of <a> + innner <span>
 */
$Document.prototype.create = makeMethod("");

/**
 * Create a new array of {@link $Element}s from Emmet or HTML string
 * @memberof! $Document#
 * @alias $Document#createAll
 * @param  {String}       value     Emmet or HTML string
 * @param  {Object|Array} [varMap]  key/value map of variables
 * @return {Array.<$Element>} an array of element wrappers
 * @function
 * @example
 * DOM.createAll("li*5");                 // => array with 5 <li> $Elements
 * DOM.createAll("<span></span><b></b>"); // => array with 2 $Elements: <span> and <b>
 */
$Document.prototype.createAll = makeMethod("All");
