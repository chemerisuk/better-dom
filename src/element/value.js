import { register, every } from "../util/index";
import { JSCRIPT_VERSION } from "../const";
import { $Element } from "../types";

register({
    /**
     * Read or write inner content of the element
     * @memberof! $Element#
     * @alias $Element#value
     * @param  {Mixed}  [content]  optional value to set
     * @return {$Element}
     * @function
     * @example
     * var div = DOM.create("div>a+b"); // <div><a></a><b></b></div>
     * div.value(DOM.create("i"));      // <div><i></i></div>
     * div.value();                     // => "<i></i>"
     */
    value(content) {
        var node = this[0], name;

        if (content === void 0) {
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
        } else if ((content instanceof $Element) || Array.isArray(content)) {
            return this.set("").append(content);
        }

        if (typeof content === "function") {
            content = content(this);
        }

        if (typeof content !== "string") {
            content = content == null ? "" : String(content);
        }

        switch (node.tagName) {
        case "INPUT":
        case "OPTION":
            name = "value";
            break;

        case "SELECT":
            // selectbox has special case
            if (every.call(node.options, (o) => !(o.selected = o.value === content))) {
                node.selectedIndex = -1;
            }
            // return earlier
            return this;

        case "TEXTAREA":
            // for IE use innerText for textareabecause it doesn't trigger onpropertychange
            name = JSCRIPT_VERSION < 9 ? "innerText" : "value";
            break;

        default:
            name = "innerHTML";
        }

        return this.set(name, content);
    }
}, null, () => function() {
    if (arguments.length) return this;
});
