import { register, every } from "../util/index";
import { JSCRIPT_VERSION } from "../const";

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
                return node[JSCRIPT_VERSION < 9 ? "innerText" : "textContent"];
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
                    /* istanbul ignore if */
                    if (JSCRIPT_VERSION < 9) {
                        // IE8 uses innerText for TEXTAREA because
                        // it doesn't trigger onpropertychange
                        node.innerText = content;
                    } else {
                        node[tagName === "TEXTAREA" ? "value" : "textContent"] = content;
                    }
            }

            return this;
        }
    }
}, null, () => function() {
    if (arguments.length) return this;
});
