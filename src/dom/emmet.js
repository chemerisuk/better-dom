import { StaticMethodError } from "../errors";
import { DOM } from "../types";

/* es6-transpiler has-iterators:false, has-generators: false */

var // operator type / priority object
    operators = {"(": 1,")": 2,"^": 3,">": 4,"+": 4,"*": 5,"`": 6,"]": 5,"[": 6,".": 7,"#": 8},
    reParse = /`[^`]*`|\[[^\]]*\]|\.[^()>^+*`[#]+|[^()>^+*`[#.]+|\^+|./g,
    reAttr = /([\w\-]+)(?:=((?:`((?:\\?.)*)?`)|[^\s]+))?/g,
    reIndex = /(\$+)(?:@(-)?(\d+)?)?/g,
    tagCache = {},
    normalizeAttrs = (_, name, value, singleValue) => {
        var quotes = value && value.indexOf("\"") >= 0 ? "'" : "\"";
        // always wrap attribute values with quotes if they don't exist
        // replace ` quotes with " except when it's a single quotes case
        return name + "=" + quotes + (singleValue || value || name) + quotes;
    },
    injectTerm = (term, append) => (html) => {
        var index = append ? html.lastIndexOf("<") : html.indexOf(">");
        // inject term into the html string
        return html.substr(0, index) + term + html.substr(index);
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

// populate empty tags
"area base br col hr img input link meta param command keygen source".split(" ").forEach((tag) => {
    tagCache[tag] = "<" + tag + ">";
});

/**
 * Parse emmet-like template and return resulting HTML string
 * @memberof DOM
 * @alias DOM.emmet
 * @param  {String}       template  input EmmetString
 * @param  {Object|Array} [varMap]  key/value map of variables
 * @return {String} a resulting HTML string
 * @see https://github.com/chemerisuk/better-dom/wiki/Microtemplating
 * @see http://docs.emmet.io/cheat-sheet/
 * @example
 * DOM.emmet("a");                                 // => "<a></a>"
 * DOM.emmet("ul>li*2");                           // => "<ul><li></li><li></li></ul>"
 * DOM.emmet("b>`hello {user}`", {user: "world"}); // => "<b>hello world</b>
 * DOM.emmet("i.{0}+span", ["icon"]);              // => <i class="icon"></i&gt<span></span>;
 */
DOM.emmet = function(template, varMap) {
    if (typeof template !== "string") throw new StaticMethodError("emmet");

    if (!template) return template;
    // handle varMap
    if (varMap) template = DOM.format(template, varMap);

    var stack = [],
        output = [];

    if (template in tagCache) return tagCache[template];

    for (let str of template.match(reParse)) {
        let op = str[0];
        let priority = operators[op];

        if (priority) {
            if (str !== "(") {
                for (let i = 0, n = (op === "^" ? str.length : 1); i < n; ++i) {
                    while (operators[stack[0]] > priority) {
                        let value = stack.shift();

                        output.push(value);
                        // for ^ operator stop shifting when the first > is found
                        if (op === "^" && value === ">") break;
                    }
                }
            }

            if (str === ")") {
                stack.shift(); // remove "(" symbol from stack
            } else {
                // handle values inside of `...` and [...] sections
                if (op === "[" || op === "`") {
                    output.push(str.substr(1, str.length - 2));
                }
                // handle multiple classes, e.g. a.one.two
                if (op === ".") {
                    output.push(str.substr(1).split(".").join(" "));
                }

                stack.unshift(op);
            }
        } else {
            output.push(str);
        }
    }

    output = output.concat(stack);

    // handle single tag case
    if (output.length === 1) return makeTerm(output[0]);

    // transform RPN into html nodes

    stack = [];

    for (let str of output) {
        if (str in operators) {
            let value = stack.shift();
            let node = stack.shift();

            if (typeof node === "string") node = [ makeTerm(node) ];

            switch(str) {
            case ".":
                value = injectTerm(" class=\"" + value + "\"");
                break;

            case "#":
                value = injectTerm(" id=\"" + value + "\"");
                break;

            case "[":
                if (value) {
                    value = injectTerm(" " + value.replace(reAttr, normalizeAttrs));
                }
                break;

            case "`":
                stack.unshift(node);
                node = [ value ];
                break;

            case "*":
                node = makeIndexedTerm(+value, node.join(""));
                break;

            default:
                value = typeof value === "string" ? makeTerm(value) : value.join("");

                if (str === ">") {
                    value = injectTerm(value, true);
                } else {
                    node.push(value);
                }
            }

            str = typeof value === "function" ? node.map(value) : node;
        }

        stack.unshift(str);
    }

    output = stack[0].join("");
    // cache static string results
    if (varMap) tagCache[template] = output;

    return output;
};
