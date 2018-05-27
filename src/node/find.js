import { map } from "../util/index";
import { MethodError } from "../errors";
import { $Node } from "../node/index";
import { $Element } from "../element/index";
import { $Document } from "../document/index";

// big part of code inspired by Sizzle:
// https://github.com/jquery/sizzle/blob/master/sizzle.js

const rquick = /^(?:(\w+)|\.([\w\-]+))$/;
const rescape = /'|\\/g;

function makeMethod(methodName, all) {
    return function(selector) {
        if (typeof selector !== "string") {
            throw new MethodError(methodName, arguments);
        }

        const node = this[0];

        if (!node) return all ? [] : new $Node();

        const quickMatch = rquick.exec(selector);
        var result, old, nid, context;

        if (quickMatch) {
            if (quickMatch[1]) {
                // speed-up: "TAG"
                result = node.getElementsByTagName(selector);
            } else {
                // speed-up: ".CLASS"
                result = node.getElementsByClassName(quickMatch[2]);
            }

            if (result && !all) result = result[0];
        } else {
            old = true;
            context = node;

            if (!(this instanceof $Document)) {
                // qSA works strangely on Element-rooted queries
                // We can work around this by specifying an extra ID on the root
                // and working up from there (Thanks to Andrew Dupont for the technique)
                if ( (old = node.getAttribute("id")) ) {
                    nid = old.replace(rescape, "\\$&");
                } else {
                    nid = "_<%= prop() %>";
                    node.setAttribute("id", nid);
                }

                nid = "[id='" + nid + "'] ";
                selector = nid + selector.split(",").join("," + nid);
            }

            result = context["querySelector" + all](selector);

            if (!old) node.removeAttribute("id");
        }

        return all ? map.call(result, $Element) : $Element(result);
    };
}

$Node.prototype.find = makeMethod("find", "");
$Node.prototype.findAll = makeMethod("findAll", "All");
