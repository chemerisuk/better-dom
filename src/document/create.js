import { DOCUMENT } from "../const";
import { MethodError } from "../errors";
import { $Document } from "../document/index";
import { $Element } from "../element/index";

const reQuick = /^<([a-zA-Z-]+)\/?>$/;
const sandbox = DOCUMENT.createElement("body");

function makeMethod(all) {
    return function(value) {
        const node = this[0];

        if (!node || typeof value !== "string") {
            throw new MethodError("create" + all, arguments);
        }

        var result = all ? [] : null;

        const quickMatch = !result && reQuick.exec(value);
        if (quickMatch) {
            return new $Element(node.createElement(quickMatch[1]));
        }

        sandbox.innerHTML = value.trim(); // parse HTML string

        for (var it; it = sandbox.firstElementChild; ) {
            sandbox.removeChild(it); // detach element from the sandbox

            if (node !== DOCUMENT) {
                // adopt node for external documents
                it = node.adoptNode(it);
            }

            if (result) {
                result.push(new $Element(it));
            } else {
                result = new $Element(it);
                // need only the first element
                break;
            }
        }

        return result || new $Element();
    };
}


/**
 * Create a new {@link $Element} from a HTML string
 * @param  {String} content HTMLString
 * @return {$Element} an element wrapper
 * @function
 * @example
 * DOM.create("<div>");                // => wrapper of <div>
 * DOM.create("<a><span></span></a>"); // => wrapper of <a> + innner <span>
 */
$Document.prototype.create = makeMethod("");

/**
 * Create a new Array.<{@link $Element}> from a HTML string
 * @param  {String} content HTMLString
 * @return {Array.<$Element>} an array of element wrappers
 * @function
 * @example
 * DOM.createAll("<span></span><b></b>"); // => array with 2 $Elements: <span> and <b>
 */
$Document.prototype.createAll = makeMethod("All");
