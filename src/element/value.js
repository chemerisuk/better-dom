import _ from "../util/index";

_.register({
    /**
     * Replace child nodes of current element
     * @memberof! $Element#
     * @alias $Element#content
     * @return {$Element}
     * @function
     * @example
     * var div = DOM.create("div>a+b"); // <div><a></a><b></b></div>
     * div.content(DOM.create("i"));    // <div><i></i></div>
     */
    value(val) {
        if (arguments.length === 0) {
            return this.get();
        } else if (typeof val === "string") {
            return this.set(val);
        } else {
            return this.set("").append(val);
        }
    }
});
