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
        key, value;

    if (!node) return;

    if (hook) return hook(node, name);

    if (typeof name === "string") {
        if (name[0] === "_") {
            key = name.substr(1);

            if (key in data) {
                value = data[key];
            } else {
                try {
                    value = node.getAttribute("data-" + key);
                    // parse object notation syntax
                    if (value[0] === "{" && value[value.length - 1] === "}") {
                        value = JSON.parse(value);
                    }
                } catch (err) { }

                if (value != null) data[key] = value;
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

    if (node.tagName === "OPTION") {
        name = node.hasAttribute("value") ? "value" : "text";
    } else if (node.tagName === "SELECT") {
        return ~node.selectedIndex ? node.options[node.selectedIndex].value : "";
    } else {
        name = node.type && "value" in node ? "value" : "innerHTML";
    }

    return node[name];
};

// some browsers don't recognize input[type=email] etc.
hooks.type = (node) => node.getAttribute("type") || node.type;

if (!_.DOM2_EVENTS) hooks.textContent = (node) => node.innerText;
