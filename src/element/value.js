import { $Element } from "../element/index";
import { every } from "../util/index";

/**
 * Read or write inner content of the element
 * @param  {HTMLString} [content] Value to set to
 * @return {$Element|String} Self or inner content value
 * @function
 * @example
 * var div = DOM.create("div>a+b"); // <div><a></a><b></b></div>
 * div.value("inner content");      // <div>inner content</div>
 * div.value();                     // => "inner content"
 */
$Element.prototype.value = function(content) {
    const node = this[0];

    if (!node) return content ? this : void 0;

    const tagName = node.tagName;

    if (content === void 0) {
        if (tagName === "SELECT") {
            return ~node.selectedIndex ? node.options[node.selectedIndex].value : "";
        } else if (tagName === "OPTION") {
            return node.hasAttribute("value") ? node.value : node.text;
        } else if (tagName === "INPUT" || tagName === "TEXTAREA") {
            return node.value;
        } else {
            return node.textContent;
        }
    } else {
        switch (tagName) {
            case "INPUT":
            case "OPTION":
            case "TEXTAREA":
                if (typeof content === "function") {
                    content = content(node.value);
                }
                node.value = content;
                break;

            case "SELECT":
                if (typeof content === "function") {
                    content = content(node.value);
                }
                if (every.call(node.options, (o) => !(o.selected = o.value === content))) {
                    node.selectedIndex = -1;
                }
                break;

            default:
                if (typeof content === "function") {
                    content = content(node.textContent);
                }
                node.textContent = content;
        }

        return this;
    }
};


/**
 * Clears all children
 * @return {$Element} Self
 * @function
 * @example
 * var div = DOM.create("div>a+b"); // <div><a></a><b></b></div>
 * div.empty();                     // <div></div>
 */
$Element.prototype.empty = function() {
    return this.value("");
};
