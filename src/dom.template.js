/**
 * Emmet abbreviation syntax support
 * @module template
 * @see https://github.com/chemerisuk/better-dom/wiki/Microtemplating
 * @see http://docs.emmet.io/cheat-sheet/
 */
var _ = require("./utils"),
    DOM = require("./dom"),
    // operator type / priority object
    operators = {"(": 1,")": 2,"^": 3,">": 4,"+": 4,"*": 5,"`": 6,"]": 5,"[": 6,".": 7,"#": 8},
    reAttr = /([\w\-]+)(?:=((?:(`|')((?:\\?.)*)?\3)|[^\s]+))?/g,
    reIndex = /(\$+)(?:@(-)?(\d+)?)?/g,
    reVar = /\{([\w\-]+)\}/g,
    reHtml = /^[\s<]/,
    cache = {},
    toString = function(term) { return term.join ? term.join("") : term },
    normalizeAttrs = function(term, name, value, quotes, rawValue) {
        if (!quotes || quotes === "`") quotes = "\"";
        // always wrap attribute values with quotes if they don't exist
        // replace ` quotes with " except when it's a single quotes case
        return name + "=" + quotes + (rawValue || value || name) + quotes;
    },
    injectTerm = function(term, first) {
        return function(el) {
            var index = first ? el.indexOf(">") : el.lastIndexOf("<");
            // inject term into the html string
            return el.substr(0, index) + term + el.substr(index);
        };
    },
    makeTerm = function(tag) {
        var result = cache[tag];

        if (!result) result = cache[tag] = "<" + tag + "></" + tag + ">";

        return result;
    },
    makeIndexedTerm = function(term) {
        return function(_, i, arr) {
            return term.replace(reIndex, function(expr, fmt, sign, base) {
                var index = (sign ? arr.length - i - 1 : i) + (base ? +base : 1);
                // make zero-padding index string
                return (fmt + index).slice(-fmt.length).split("$").join("0");
            });
        };
    };

// populate empty tags
"area base br col hr img input link meta param command keygen source".split(" ").forEach(function(tag) {
    cache[tag] = "<" + tag + ">";
});

/**
 * Parse emmet-like template into a HTML string
 * @memberOf module:template
 * @param  {String}       template  emmet-like expression
 * @param  {Object|Array} [varMap]  key/value map of variables
 * @return {String} HTML string
 */
DOM.template = function(template, varMap) {
    if (typeof template !== "string") throw _.makeError("template", true);
    // handle varMap
    if (varMap) template = template.replace(reVar, function(x, name) { return varMap[name] || x });

    var stack = [],
        output = [],
        term = "",
        i, n, str, priority, skip, node;

    if (template in cache) return cache[template];

    if (!template || reHtml.exec(template)) return template;

    // parse expression into RPN

    for (i = 0, n = template.length; i < n; ++i) {
        str = template[i];
        // concat .c1.c2 into single space separated class string
        if (str === "." && stack[0] === ".") str = " ";

        priority = operators[str];

        if (priority && (!skip || skip === str)) {
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

    if (term) output.push(term);

    output = output.concat(stack);

    // transform RPN into html nodes

    stack = [];

    for (i = 0, n = output.length; i < n; ++i) {
        str = output[i];

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
                // Array.prototype.map doesn't work properly here
                node = this.map.call(Array(+term), makeIndexedTerm(toString(node)));
                break;

            default:
                term = typeof term === "string" ? makeTerm(term) : toString(term);

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

    output = toString(stack[0]);

    return varMap ? output : cache[template] = output;
};
