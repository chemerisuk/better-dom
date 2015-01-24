import { register } from "../util/index";
import { RETURN_THIS } from "../const";

register({
    /**
     * Remove child nodes of current element from the DOM
     * @memberof! $Element#
     * @alias $Element#empty
     * @return {$Element}
     * @function
     * @example
     * var div = DOM.create("div>a+b"); // <div><a></a><b></b></div>
     * div.empty();                     // <div></div>
     */
    empty() {
        return this.set("");
    }
}, null, () => RETURN_THIS);
