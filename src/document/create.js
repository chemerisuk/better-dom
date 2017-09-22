import { DOCUMENT, ELEMENT_NODE } from "../const";
import { $Document } from "../document/index";
import { $Element } from "../element/index";

const reQuick = /^<([a-zA-Z-]+)\/?>$/;
const sandbox = DOCUMENT.createElement("body");

function makeMethod(all) {
    return function(value) {
        const node = this["<%= prop() %>"];

        if (!node) return all ? [] : new $Element();

        const quickMatch = !all && reQuick.exec(value);
        if (quickMatch) {
            return new $Element(node.createElement(quickMatch[1]));
        }

        sandbox.innerHTML = value.trim(); // parse HTML string

        var result = all ? [] : null;

        for (var el; el = sandbox.firstChild; ) {
            sandbox.removeChild(el); // detach element from the sandbox

            if (el.nodeType === ELEMENT_NODE) {
                if (node !== DOCUMENT) {
                    // adopt node for external documents
                    el = node.adoptNode(el);
                }

                if (all) {
                    result.push(new $Element(el));
                } else {
                    result = el;
                    // stop early, because need only the first element
                    break;
                }
            }
        }

        return all ? result : $Element(result);
    };
}


/**
 * Create a new {@link $Element} from a HTML string
 * @memberof $Document#
 * @alias $Document#create
 * @param  {String}       value     HTML string
 * @return {$Element} an element wrapper
 * @function
 * @example
 * DOM.create("<div>");                // => wrapper of <div>
 * DOM.create("<a><span></span></a>"); // => wrapper of <a> + innner <span>
 */
$Document.prototype.create = makeMethod("");

/**
 * Create a new array of {@link $Element}s from a HTML string
 * @memberof $Document#
 * @alias $Document#createAll
 * @param  {String}       value     HTML string
 * @return {Array.<$Element>} an array of element wrappers
 * @function
 * @example
 * DOM.createAll("<span></span><b></b>"); // => array with 2 $Elements: <span> and <b>
 */
$Document.prototype.createAll = makeMethod("All");
