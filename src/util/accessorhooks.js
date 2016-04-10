import { JSCRIPT_VERSION } from "../const";

var hooks = {get: {}, set: {}};

// fix camel cased attributes
"tabIndex readOnly maxLength cellSpacing cellPadding rowSpan colSpan useMap frameBorder contentEditable".split(" ").forEach((key) => {
    hooks.get[ key.toLowerCase() ] = (node) => node[key];
});

// style hook
hooks.get.style = (node) => node.style.cssText;
hooks.set.style = (node, value) => { node.style.cssText = value };

// some browsers don't recognize input[type=email] etc.
hooks.get.type = (node) => node.getAttribute("type") || node.type;
/* istanbul ignore if */
if (JSCRIPT_VERSION < 9) {
    // IE8 sometimes breaks on innerHTML
    hooks.set.innerHTML = function(node, value) {
        try {
            node.innerHTML = value;
        } catch (err) {
            var sandbox = node.ownerDocument.createElement("div"), it;

            node.innerText = ""; // cleanup inner content
            sandbox.innerHTML = value;

            while (it = sandbox.firstChild) {
                node.appendChild(it);
            }
        }
    };
}

export default hooks;
