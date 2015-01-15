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
     * div.value(DOM.create("i"));      // <div><i></i></div>
     * div.value();                     // => "<i></i>"
     */
    value(val) {
        if (arguments.length === 0) {
            var node = this[0], name;

            switch (node.tagName) {
            case "SELECT":
                return ~node.selectedIndex ? node.options[ node.selectedIndex ].value : "";

            case "OPTION":
                name = node.hasAttribute("value") ? "value" : "text";
                break;

            default:
                name = node.type && "value" in node ? "value" : "innerHTML";
            }

            return node[name];
        } else if (typeof val === "string") {
            return this.set(val);
        } else {
            return this.set("").append(val);
        }
    }
});
