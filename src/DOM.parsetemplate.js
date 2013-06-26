define(["DOM"], function(DOM, _foldl, _forEach) {
    "use strict";

    // EMMET-LIKE PARSER
    // -----------------

    (function() {
        var operators = { // name / priority object
            "(": 0,
            ")": 1,
            ">": 2,
            "+": 2,
            "*": 3,
            "}": 3,
            "{": 4,
            "]": 3,
            "[": 4,
            ".": 5,
            "#": 6,
            ":": 7
        },
        emptyElements = " area base br col hr img input link meta param command keygen source ",
        rempty = /<\?>|<\/\?>/g,
        rattr = /([A-Za-z0-9_\-]+)(?:\s*=\s*(?:(?:"((?:\\.|[^"])*)")|(?:'((?:\\.|[^'])*)')|([^>\s]+)))?/g,
        normalizeAttrs = function(term, str) {
            var index = str.indexOf("="),
                name = ~index ? str.substr(0, index) : str,
                value = ~index ? str.substr(index + 1) : "";

            if (value[0] !== "\"" && value[0] !== "'") value = "\"" + value + "\"";

            return term + " " + name + "=" + value;
        };

        // helper class
        function HtmlBuilder(node, n) {
            this.length = 0;

            if (n) {
                node = node.toString();

                for (var i = 1; i <= n; ++i) {
                    this.push(node.split("$").join(i));
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
            push: function(term) {
                Array.prototype.push.call(this, term);
            },
            insert: function(term, last) {
                _forEach(this, function(el, i) {
                    var index = last ? el.lastIndexOf("<") : el.indexOf(">");
                    // update value
                    this[i] = el.substr(0, index) + term + el.substr(index);
                }, this);
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
                term = "";

            // parse exrpression into RPN
        
            _forEach(template, function(str) {
                var top = stack[0], priority;

                // concat .c1.c2 into single space separated class string
                if (top === "." && str === ".") str = " ";

                if (str in operators && (top !== "[" || str === "]") && (top !== "{" || str === "}")) {
                    // append empty tag for text nodes or put missing '>' operator
                    if (str === "{") term ? stack.unshift(">") : term = "?";

                    if (term) {
                        output.push(term);
                        term = "";
                    }

                    if (str !== "(") {
                        priority = operators[str];

                        while (operators[stack[0]] > priority) {
                            output.push(stack.shift());
                        }
                    }

                    if (str === ")") {
                        stack.shift(); // remove "(" symbol from stack
                    } else if (str !== "]" && str !== "}") { // don't need to have "]" in stack
                        stack.unshift(str);
                    }
                } else {
                    term += str;
                }
            });

            if (term) stack.unshift(term);

            output.push.apply(output, stack);

            stack = [];

            if (output.length === 1) output.push(HtmlBuilder.parse(output[0]));

            // transform RPN into html nodes

            _forEach(output, function(str) {
                var term, node;

                if (str in operators) {
                    term = stack.shift();
                    node = stack.shift() || "?";

                    if (typeof node === "string") node = new HtmlBuilder(node);

                    switch(str) {
                    case ".":
                        node.insert(" class=\"" + term + "\"");
                        break;

                    case "#":
                        node.insert(" id=\"" + term + "\"");
                        break;

                    case ":":
                        node.insert(" type=\"" + term + "\"");
                        break;

                    case "[":
                        node.insert(_foldl(term.match(rattr), normalizeAttrs, ""));
                        break;

                    case "{":
                        node.insert(term, true);
                        break;

                    case "+":
                    case ">":
                        term = typeof term === "string" ? HtmlBuilder.parse(term) : term.toString();

                        node[str === "+" ? "push" : "insert"](term, true);
                        break;

                    case "*":
                        node = new HtmlBuilder(node, parseInt(term, 10));
                        break;
                    }

                    str = node;
                }

                stack.unshift(str);
            });

            return stack[0].toString().replace(rempty, "");
        };
    })();
});