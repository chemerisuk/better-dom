import { $Element } from "../types";
// import tagCache from "../global/emmet";
import { register } from "../util/index";

register({
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
    create: "",
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
    createAll: "All"

}, (methodName, all) => function(value) {
    var sandbox = this._["<%= prop('sandbox') %>"];

    if (!sandbox) {
        sandbox = this[0].createElement("div");
        this._["<%= prop('sandbox') %>"] = sandbox;
    }

    var nodes, el;

    // if (value && value in tagCache) {
    //     nodes = doc.createElement(value);

    //     if (all) nodes = [ new $Element(nodes) ];
    // } else {
    // value = varMap ? DOM.format(value, varMap) : value;

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
    // }

    return all ? nodes : $Element(nodes);
});
