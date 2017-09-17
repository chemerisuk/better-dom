import { $NewDocument } from "../document/index";
import { $NewElement } from "../element/index";

function makeMethod(methodName, all) {
    return function(value) {
        const node = this["<%= prop() %>"];

        if (!node) return new $NewElement();

        var sandbox = this["<%= prop('sandbox') %>"];

        if (!sandbox) {
            sandbox = node.createElement("div");
            this["<%= prop('sandbox') %>"] = sandbox;
        }

        var nodes, el;

        // if (value && value in tagCache) {
        //     nodes = doc.createElement(value);

        //     if (all) nodes = [ new $Element(nodes) ];
        // } else {
        // value = varMap ? DOM.format(value, varMap) : value;

        sandbox.innerHTML = value.trim(); // parse input HTML string

        for (nodes = all ? [] : null; el = sandbox.firstChild; ) {
            sandbox.removeChild(el); // detach element from the sandbox

            if (el.nodeType === 1) {
                if (all) {
                    nodes.push(new $NewElement(el));
                } else {
                    nodes = el;

                    break; // stop early, because need only the first element
                }
            }
        }
        // }

        return all ? nodes : $NewElement(nodes);
    };
}

$NewDocument.prototype.create = makeMethod("");
$NewDocument.prototype.createAll = makeMethod("All");
