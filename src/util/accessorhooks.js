import _ from "../helpers";
import { DOM2_EVENTS, HTML, DOCUMENT } from "../constants";

var hooks = {get: {}, set: {}};

// fix camel cased attributes
"tabIndex readOnly maxLength cellSpacing cellPadding rowSpan colSpan useMap frameBorder contentEditable".split(" ").forEach((key) => {
    hooks.get[ key.toLowerCase() ] = (node) => node[key];
});

// style hook
hooks.get.style = (node) => node.style.cssText;
hooks.set.style = (node, value) => { node.style.cssText = value };

// title hook for DOM
hooks.get.title = (node) => node === HTML ? DOCUMENT.title : node.title;
hooks.set.title = (node, value) => { (node === HTML ? DOCUMENT : node).title = value; };

hooks.get.undefined = (node) => {
    var name;

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
};

hooks.set.undefined = function(node, value) {
    // handle numbers, booleans etc.
    value = value == null ? "" : String(value);

    if (node.tagName === "SELECT") {
        // selectbox has special case
        if (_.every.call(node.options, (o) => !(o.selected = o.value === value))) {
            node.selectedIndex = -1;
        }
    } else if (node.type && "value" in node) {
        // for IE use innerText for textareabecause it doesn't trigger onpropertychange
        node[DOM2_EVENTS || node.type !== "textarea" ? "value" : "innerText"] = value;
    } else {
        node.innerHTML = value;
    }
};

// some browsers don't recognize input[type=email] etc.
hooks.get.type = (node) => node.getAttribute("type") || node.type;

// IE8 has innerText but not textContent
if (!DOM2_EVENTS) {
    hooks.get.textContent = (node) => node.innerText;
    hooks.set.textContent = (node, value) => { node.innerText = value };
}

export default hooks;
