import { register, every } from "../util/index";

register({
    /**
     * Read or write inner content of the element
     * @memberof! $Element#
     * @alias $Element#value
     * @param  {String}  [content]  optional value to set
     * @return {$Element}
     * @function
     * @example
     * var div = DOM.create("div>a+b"); // <div><a></a><b></b></div>
     * div.value(DOM.create("i"));      // <div><i></i></div>
     * div.value();                     // => "<i></i>"
     */
    value(content) {
        var node = this[0];
        var tagName = node.tagName;

        if (content === void 0) {
            switch (tagName) {
            case "SELECT":
                return ~node.selectedIndex ? node.options[ node.selectedIndex ].value : "";

            case "OPTION":
                return node[node.hasAttribute("value") ? "value" : "text"];

            case "INPUT":
            case "TEXTAREA":
                return node.value;

            default:
                return node.textContent;
            }
        } else {
            switch (tagName) {
                case "INPUT":
                case "OPTION":
                    node.value = content;
                    break;

                case "SELECT":
                    if (every.call(node.options, (o) => !(o.selected = o.value === content))) {
                        node.selectedIndex = -1;
                    }
                    break;

                default:
                    node[tagName === "TEXTAREA" ? "value" : "textContent"] = content;
            }

            return this;
        }
    }
}, null, () => function() {
    if (arguments.length) return this;
});
