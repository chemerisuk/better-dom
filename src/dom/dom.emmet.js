import { StaticMethodError } from "../errors";
import { DOM } from "../types";

/* es6-transpiler has-iterators:false, has-generators: false */

var // operator type / priority object
    operators = {"(": 1,")": 2,"^": 3,">": 4,"+": 4,"*": 5,"`": 6,"]": 5,"[": 6,".": 7,"#": 8},
    reAttr = /([\w\-]+)(?:=((?:`((?:\\?.)*)?`)|[^\s]+))?/g,
    reIndex = /(\$+)(?:@(-)?(\d+)?)?/g,
    // populate empty tags
    tagCache = "area base br col hr img input link meta param command keygen source".split(" ").reduce((tagCache, tag) => {
        tagCache[tag] = "<" + tag + ">";

        return tagCache;
    }, {}),
    normalizeAttrs = (_, name, value, singleValue) => {
        var quotes = value && value.indexOf("\"") >= 0 ? "'" : "\"";
        // always wrap attribute values with quotes if they don't exist
        // replace ` quotes with " except when it's a single quotes case
        return name + "=" + quotes + (singleValue || value || name) + quotes;
    },
    injectTerm = (term, first) => (el) => {
        var index = first ? el.indexOf(">") : el.lastIndexOf("<");
        // inject term into the html string
        return el.substr(0, index) + term + el.substr(index);
    },
    makeTerm = (tag) => {
        var result = tagCache[tag];

        if (!result) result = tagCache[tag] = "<" + tag + "></" + tag + ">";

        return result;
    },
    makeIndexedTerm = (n, term) => {
        var result = [], i;

        for (i = 0; i < n; ++i) {
            result.push(term.replace(reIndex, (expr, fmt, sign, base) => {
                var index = (sign ? n - i - 1 : i) + (base ? +base : 1);
                // handle zero-padded strings
                return (fmt + index).slice(-fmt.length).split("$").join("0");
            }));
        }

        return result;
    };

/**
 * Parse emmet-like template and return resulting HTML string
 * @memberof DOM
 * @alias DOM.emmet
 * @param  {String}       template  input EmmetString
 * @param  {Object|Array} [varMap]  key/value map of variables
 * @return {String} HTML string
 * @see https://github.com/chemerisuk/better-dom/wiki/Microtemplating
 * @see http://docs.emmet.io/cheat-sheet/
 */
DOM.emmet = function(template, varMap) {
    if (typeof template !== "string") throw new StaticMethodError("emmet");

    if (!template) return template;
    // handle varMap
    if (varMap) template = DOM.format(template, varMap);

    var stack = [],
        output = [],
        term = "",
        priority, skip, node, str;

    if (template in tagCache) return tagCache[template];

    // if (!template || reHtml.exec(template)) return template;

    // parse expression into RPN

    for (str of template) {
        // concat .c1.c2 into single space separated class string
        if (str === "." && stack[0] === ".") str = " ";

        priority = operators[str];

        if (priority && (!skip || skip === str)) {
            // fix for a>`text`+b
            if (str === "+" && stack[0] === "`") str = ">";
            // remove redundat ^ operators from the stack when more than one exists
            if (str === "^" && stack[0] === "^") stack.shift();

            if (term) {
                output.push(term);
                term = "";
            }

            if (str !== "(") {
                while (operators[stack[0]] > priority) {
                    output.push(stack.shift());
                    // for ^ operator stop shifting when the first > is found
                    if (str === "^" && output[output.length - 1] === ">") break;
                }
            }

            if (str === ")") {
                stack.shift(); // remove "(" symbol from stack
            } else if (!skip) {
                stack.unshift(str);

                if (str === "[") skip = "]";
                if (str === "`") skip = "`";
            } else {
                skip = false;
            }
        } else {
            term += str;
        }
    }

    if (term) {
        // handle single tag case
        if (!output.length && !stack.length) return makeTerm(term);

        output.push(term);
    }

    output = output.concat(stack);

    // transform RPN into html nodes

    stack = [];

    for (str of output) {
        if (str in operators) {
            term = stack.shift();
            node = stack.shift() || [""];

            if (typeof node === "string") node = [ makeTerm(node) ];

            switch(str) {
            case ".":
                term = injectTerm(" class=\"" + term + "\"", true);
                break;

            case "#":
                term = injectTerm(" id=\"" + term + "\"", true);
                break;

            case "[":
                term = injectTerm(" " + term.replace(reAttr, normalizeAttrs), true);
                break;

            case "`":
                term = injectTerm(term);
                break;

            case "*":
                node = makeIndexedTerm(+term, typeof node === "string" ? node : node.join(""));
                break;

            default:
                term = typeof term === "string" ? makeTerm(term) : term.join("");

                if (str === ">") {
                    term = injectTerm(term);
                } else {
                    node.push(term);
                }
            }

            str = typeof term === "function" ? node.map(term) : node;
        }

        stack.unshift(str);
    }

    output = stack[0];

    if (typeof output !== "string") output = output.join("");

    return varMap ? output : tagCache[template] = output;
};
