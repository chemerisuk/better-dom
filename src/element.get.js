import _ from "./utils";
import $Node from "./node";
import $Element from "./element";

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
        if (name[0] === "_" || name[0] === "-") {
            key = name.substr(1);

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
    }

    return $Node.prototype.get.call(this, name);
};

// $Element#get hooks

hooks.undefined = function(node) {
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
