import _ from "./util";
import DOM from "./index";

/*es6-transpiler has-iterators:false, has-generators: false*/

/**
 * Emmet abbreviation syntax support
 * @module template
 * @see https://github.com/chemerisuk/better-dom/wiki/Microtemplating
 * @see http://docs.emmet.io/cheat-sheet/
 */

var // operator type / priority object
    operators = {"(": 1,")": 2,"^": 3,">": 4,"+": 4,"*": 5,"`": 6,"]": 5,"[": 6,".": 7,"#": 8},
    reAttr = /([\w\-]+)(?:=((?:(`|')((?:\\?.)*)?\3)|[^\s]+))?/g,
    reIndex = /(\$+)(?:@(-)?(\d+)?)?/g,
    toString = (term) => term.join ? term.join("") : term,
    normalizeAttrs = (term, name, value, quotes, rawValue) => {
        if (!quotes || quotes === "`") quotes = "\"";
        // always wrap attribute values with quotes if they don't exist
        // replace ` quotes with " except when it's a single quotes case
        return name + "=" + quotes + (rawValue || value || name) + quotes;
    },
    injectTerm = (term, first) => (el) => {
        var index = first ? el.indexOf(">") : el.lastIndexOf("<");
        // inject term into the html string
        return el.substr(0, index) + term + el.substr(index);
    },
    makeTerm = (tag) => {
        var result = tagCache[tag];

        if (!result) result = tagCache[tag] = `<${tag}></${tag}>`;

        return result;
    },
    makeIndexedTerm = (term) => (_, i, arr) => {
        return term.replace(reIndex, (expr, fmt, sign, base) => {
            var index = (sign ? arr.length - i - 1 : i) + (base ? +base : 1);
            // make zero-padding index string
            return (fmt + index).slice(-fmt.length).split("$").join("0");
        });
    },
    // populate empty tags
    tagCache = "area base br col hr img input link meta param command keygen source".split(" ").reduce((tagCache, tag) => {
        tagCache[tag] = `<${tag}>`;

        return tagCache;
    }, {});

/**
 * Parse emmet-like template into a HTML string
 * @memberOf DOM
 * @param  {String}       template  input EmmetString
 * @param  {Object|Array} [varMap]  key/value map of variables
 * @return {String} HTML string
 */
DOM.emmet = function(template, varMap) {
    if (typeof template !== "string") throw _.makeError("emmet", true);
    // handle varMap
    if (varMap) template = DOM.format(template, varMap);

    var stack = [],
        output = [],
        term = "",
        priority, skip, node;

    if (template in tagCache) return tagCache[template];

    // if (!template || reHtml.exec(template)) return template;

    // parse expression into RPN

    for (let str of template) {
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
        // quickly handle single tag case
        if (!output.length && !stack.length) return makeTerm(term);

        output.push(term);
    }

    output = output.concat(stack);

    // transform RPN into html nodes

    stack = [];

    for (let str of output) {
        if (str in operators) {
            term = stack.shift();
            node = stack.shift() || [""];

            if (typeof node === "string") node = [ makeTerm(node) ];

            switch(str) {
            case ".":
                term = injectTerm(` class="${term}"`, true);
                break;

            case "#":
                term = injectTerm(` id="${term}"`, true);
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

    return varMap ? output : tagCache[template] = output;
};
