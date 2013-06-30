define(["DOM"], function(DOM, _forEach) {
    "use strict";

    // EMMET-LIKE PARSER
    // -----------------

    (function() {
        var operators = {
            // operator type / priority object
            "(": 1,
            ")": 2,
            "^": 3,
            ">": 4,
            "+": 4,
            "*": 5,
            "}": 5,
            "{": 6,
            "]": 5,
            "[": 6,
            ".": 7,
            "#": 8,
            ":": 9
        },
        emptyElements = " area base br col hr img input link meta param command keygen source ",
        reEmpty = /<\?>|<\/\?>/g,
        reAttr = /([\w\-]+)(?:=((?:"((?:\\.|[^"])*)")|(?:'((?:\\.|[^'])*)')|([^\s\]]+)))?/g,
        reIndex = /(\$+)(?:@(-)?([0-9]+)?)?/,
        reIndexg = new RegExp(reIndex.source, "g"),
        normalizeAttrs = function(term, name, value, a, b, simple) {
            return name + "=" + (simple || !value ? "\"" + (value || "") + "\"" : value);
        },
        formatIndex = function(index) {
            return function(expr, fmt) {
                return (fmt + index).slice(-fmt.length).split("$").join("0");
            };
        };

        // helper class
        function HtmlBuilder(node, n) {
            if (n) {
                node = node.toString();

                var parsed = reIndex.exec(node) || [],
                    step = parsed[2] ? -1 : 1,
                    i = parsed[3] ? +parsed[3] : 1;

                if (step < 0) i += n - 1;

                for (; n--; i += step) {
                    this.push(node.replace(reIndexg, formatIndex(i)));
                }
            } else {
                this.push(HtmlBuilder.parse(node));
            }
        }

        HtmlBuilder.parse = function(term) {
            var result = "<" + term + ">";

            if (!~emptyElements.indexOf(" " + term + " ")) {
                result += "</" + term + ">";
            }

            return result;
        };

        HtmlBuilder.prototype = {
            push: Array.prototype.push,
            inject: function(term, first) {
                _forEach(this, function(el, i, builder) {
                    var index = first ? el.indexOf(">") : el.lastIndexOf("<");
                    // update value
                    builder[i] = el.substr(0, index) + term + el.substr(index);
                });
            },
            toString: function() {
                return Array.prototype.join.call(this, "");
            }
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
                skip;

            // parse exrpression into RPN
        
            _forEach(template, function(str) {
                // concat .c1.c2 into single space separated class string
                if (str === "." && stack[0] === ".") str = " ";

                var priority = operators[str];

                if (priority && (!skip || skip === str)) {
                    // append empty tag for text nodes or put missing '>' operator
                    if (str === "{") term ? stack.unshift(">") : term = "?";

                    if (term) {
                        output.push(term);
                        term = "";
                    }

                    if (str !== "(") {
                        while (operators[stack[0]] > priority) {
                            output.push(stack.shift());
                        }
                    }

                    if (str === ")") {
                        stack.shift(); // remove "(" symbol from stack
                    } else if (!skip) { // don't need to have "]" in stack
                        stack.unshift(str);

                        if (str === "[") skip = "]";
                        if (str === "{") skip = "}";
                    } else {
                        skip = null;
                    }
                } else {
                    term += str;
                }
            });

            if (term) stack.unshift(term);

            output.push.apply(output, stack);

            stack = [];

            if (output.length === 1) output.push(">");

            // transform RPN into html nodes

            _forEach(output, function(str) {
                var term, node;

                if (str in operators) {
                    term = stack.shift();
                    node = stack.shift() || "?";

                    if (typeof node === "string") node = new HtmlBuilder(node);

                    switch(str) {
                    case ".":
                        node.inject(" class=\"" + term + "\"", true);
                        break;

                    case "#":
                        node.inject(" id=\"" + term + "\"", true);
                        break;

                    case ":":
                        node.inject(" type=\"" + term + "\"", true);
                        break;

                    case "[":
                        node.inject(" " + term.replace(reAttr, normalizeAttrs), true);
                        break;

                    case "{":
                        node.inject(term);
                        break;

                    case "^":
                    case "+":
                    case ">":
                        term = typeof term === "string" ? HtmlBuilder.parse(term) : term.toString();

                        node[str === ">" ? "inject" : "push"](term);
                        break;

                    case "*":
                        node = new HtmlBuilder(node, parseInt(term, 10));
                        break;
                    }

                    str = node;
                }

                stack.unshift(str);
            });

            return stack[0].toString().replace(reEmpty, "");
        };
    })();
});
