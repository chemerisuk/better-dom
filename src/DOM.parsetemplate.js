define(["DOM"], function(DOM, _map) {
    "use strict";

    // EMMET EXPRESSIONS PARSER
    // ------------------------

    (function() {
        // operator type / priority object
        var operators = {"(": 1,")": 2,"^": 3,">": 4,"+": 4,"*": 5,"}": 5,"{": 6,"]": 5,"[": 6,".": 7,"#": 8,":": 9},
            emptyElements = " area base br col hr img input link meta param command keygen source ",
            reEmpty = /<\?>|<\/\?>/g,
            reAttr = /([\w\-]+)(?:=((?:"((?:\\.|[^"])*)")|(?:'((?:\\.|[^'])*)')|([^\s\]]+)))?/g,
            reIndex = /(\$+)(?:@(-)?([0-9]+)?)?/,
            reIndexg = new RegExp(reIndex.source, "g"),
            normalizeAttrs = function(term, name, value, a, b, simple) {
                // always wrap attribute values with quotes if they don't exist
                return name + "=" + (simple || !value ? "\"" + (value || "") + "\"" : value);
            },
            formatIndex = function(index) {
                return function(expr, fmt) {
                    return (fmt + index).slice(-fmt.length).split("$").join("0");
                };
            },
            injectTerm = function(term, first) {
                return function(el) {
                    var index = first ? el.indexOf(">") : el.lastIndexOf("<");
                    // inject term into the html string
                    return el.substr(0, index) + term + el.substr(index);
                };
            },
            makeTerm = function(term) {
                var result = "<" + term + ">";

                if (emptyElements.indexOf(" " + term + " ") < 0) {
                    result += "</" + term + ">";
                }

                return [result];
            },
            makeTerms = function(term, n) {
                var parsed = reIndex.exec(term) || [],
                    step = parsed[2] ? -1 : 1,
                    index = parsed[3] ? +parsed[3] : 1,
                    result = new Array(n),
                    i = 0;

                if (step < 0) index += n - 1;

                for (; i < n; ++i, index += step) {
                    result[i] = term.replace(reIndexg, formatIndex(index));
                }

                return result;
            },
            toString = function(term) {
                return typeof term === "string" ? term : term.join("");
            };

        /**
         * Parse emmet-like template to HTML string
         * @memberOf DOM
         * @param  {String} template emmet-like expression
         * @return {String} HTML string
         * @see http://docs.emmet.io/cheat-sheet/
         */
        DOM.parseTemplate = function(template) {
            var stack = [],
                output = [],
                term = "",
                i, n, str, priority, skip, node;

            // parse exrpression into RPN
            
            for (i = 0, n = template.length; i < n; ++i) {
                str = template[i];
                // concat .c1.c2 into single space separated class string
                if (str === "." && stack[0] === ".") str = " ";

                priority = operators[str];

                if (priority && (!skip || skip === str)) {
                    // append empty tag for text nodes or put missing '>' operator into the stack
                    if (str === "{") {
                        if (term) {
                            stack.unshift(">");
                        } else {
                            term = "?";
                        }
                    }
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
                        if (str === "{") skip = "}";
                    } else {
                        skip = false;
                    }
                } else {
                    term += str;
                }
            }

            if (term) stack.unshift(term);

            output.push.apply(output, stack);

            // transform RPN into html nodes

            stack = [];

            if (output.length === 1) output.push(">");

            for (i = 0, n = output.length; i < n; ++i) {
                str = output[i];

                if (str in operators) {
                    term = stack.shift();
                    node = stack.shift() || "?";

                    if (typeof node === "string") node = makeTerm(node);

                    switch(str) {
                    case ".":
                        term = injectTerm(" class=\"" + term + "\"", true);
                        break;

                    case "#":
                        term = injectTerm(" id=\"" + term + "\"", true);
                        break;

                    case ":":
                        term = injectTerm(" type=\"" + term + "\"", true);
                        break;

                    case "[":
                        term = injectTerm(" " + term.replace(reAttr, normalizeAttrs), true);
                        break;

                    case "{":
                        term = injectTerm(term);
                        break;

                    case "*":
                        node = makeTerms(toString(node), parseInt(term, 10));
                        break;

                    default:
                        if (typeof term === "string") term = makeTerm(term)[0];

                        term = toString(term);

                        if (str === ">") {
                            term = injectTerm(term);
                        } else {
                            node.push(term);
                        }
                    }

                    str = typeof term === "function" ? _map(node, term) : node;
                }

                stack.unshift(str);
            }

            return toString(stack[0]).replace(reEmpty, "");
        };
    })();
});
