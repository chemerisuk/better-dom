import _ from "./util/index";
import { $Element } from "./index";

var hooks = {};

/**
 * Get property or attribute value by name
 * @param  {String|Array} [name] property/attribute name or array of names
 * @return {Object} property/attribute value
 */
$Element.prototype.get = function(name) {
    var data = this._,
        node = data._node,
        hook = hooks[name],
        nameType = typeof name,
        key, value;

    if (!node) return;

    if (hook) return hook(node, name);

    if (nameType === "string") {
        if (name.substr(0, 2) === "--") {
            key = name.substr(2);

            if (key in data) {
                value = data[key];
            } else {
                value = node.getAttribute("data-" + key);

                if (value != null) {
                    // try to recognize and parse  object notation syntax
                    if (value[0] === "{" && value[value.length - 1] === "}") {
                        try {
                            value = JSON.parse(value);
                        } catch (err) { }
                    }

                    data[key] = value;
                }
            }

            return value;
        }

        return name in node ? node[name] : node.getAttribute(name);
    } else if (Array.isArray(name)) {
        return name.reduce((r, key) => { return r[key] = this.get(key), r }, {});
    } else {
        throw _.makeError("get");
    }
};

// $Element#get hooks

// fix camel cased attributes
"tabIndex readOnly maxLength cellSpacing cellPadding rowSpan colSpan useMap frameBorder contentEditable".split(" ").forEach((key) => {
    hooks[key.toLowerCase()] = (node) => node[key];
});

hooks.style = (node) => node.style.cssText;

hooks.title = (node) => node === _.docEl ? document.title : node.title;

hooks.undefined = (node) => {
    var name;

    switch(node.tagName) {
    case "SELECT":
        return ~node.selectedIndex ? node.options[node.selectedIndex].value : "";

    case "OPTION":
        name = node.hasAttribute("value") ? "value" : "text";
        break;

    default:
        name = node.type && "value" in node ? "value" : "innerHTML";
    }

    return node[name];
};

// some browsers don't recognize input[type=email] etc.
hooks.type = (node) => node.getAttribute("type") || node.type;

if (!_.DOM2_EVENTS) hooks.textContent = (node) => node.innerText;
