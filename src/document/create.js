import { $Document } from "../document/index";
import { $Element } from "../element/index";

function makeMethod(all) {
    return function(value) {
        const node = this["<%= prop() %>"];

        if (!node) return new $Element();

        var sandbox = this["<%= prop('sandbox') %>"];

        if (!sandbox) {
            sandbox = node.createElement("div");
            this["<%= prop('sandbox') %>"] = sandbox;
        }

        var nodes, el;

        sandbox.innerHTML = value.trim(); // parse input HTML string

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

        return all ? nodes : $Element(nodes);
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
