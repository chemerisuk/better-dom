define(["DOM"], function(DOM, _isArray, _times, _foldl, _forEach) {
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
            "]": 3,
            "[": 4,
            ".": 5,
            "#": 6,
            ":": 7
        },
        emptyElements = " area base br col hr img input link meta param command keygen source ",
        rattr = /([A-Za-z0-9_\-]+)(?:\s*=\s*(?:(?:"((?:\\.|[^"])*)")|(?:'((?:\\.|[^'])*)')|([^>\s]+)))?/g,
        normalizeAttrs = function(term, str) {
            var index = str.indexOf("="),
                name = ~index ? str.substr(0, index) : str,
                value = ~index ? str.substr(index + 1) : "";

            if (value[0] !== "\"" && value[0] !== "'") value = "\"" + value + "\"";

            return term + " " + name + "=" + value;
        },
        toHtmlString = function(obj) {
            return _isArray(obj) ? obj.join("") : obj.toString();
        },
        appendToAll = function(node) {
            node.insertTerm(this, true);
        };

        // helper class
        function HtmlBuilder(term, noparse) {
            if (noparse) this.str = term;
            else {
                this.str = "<" + term + ">";

                if (!~emptyElements.indexOf(" " + term + " ")) {
                    this.str += "</" + term + ">";
                }
            }
        }

        HtmlBuilder.prototype = {
            insertTerm: function(term, last) {
                var index = last ? this.str.lastIndexOf("<") : this.str.indexOf(">");

                this.str = this.str.substr(0, index) + term + this.str.substr(index);
            },
            toString: function() {
                return this.str;
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

                if (str in operators && (top !== "[" || str === "]")) {
                    if (str === ":") term = "input";

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
                    } else if (str !== "]") { // don't need to have "]" in stack
                        stack.unshift(str);
                    }
                } else {
                    term += str;
                }
            });

            if (term) stack.unshift(term);

            output.push.apply(output, stack);

            stack = [];

            if (output.length === 1) output.push(new HtmlBuilder(output[0]));

            // transform RPN into html nodes

            _forEach(output, function(str) {
                var term, node;

                if (str in operators) {
                    term = stack.shift();
                    node = stack.shift() || "div";

                    if (typeof node === "string") node = new HtmlBuilder(node);

                    switch(str) {
                    case ".":
                        node.insertTerm(" class=\"" + term + "\"");
                        break;

                    case "#":
                        node.insertTerm(" id=\"" + term + "\"");
                        break;

                    case ":":
                        node.insertTerm(" type=\"" + term + "\"");
                        break;

                    case "[":
                        node.insertTerm(_foldl(term.match(rattr), normalizeAttrs, ""));
                        break;
                        
                    case "+":
                        term = toHtmlString(typeof term === "string" ? new HtmlBuilder(term) : term);

                        _isArray(node) ? node.push(term) : node.str += term;
                        break;

                    case ">":
                        term = toHtmlString(typeof term === "string" ? new HtmlBuilder(term) : term);

                        _isArray(node) ? _forEach(node, appendToAll, term) : node.insertTerm(term, true);
                        break;

                    case "*":
                        str = toHtmlString(node);
                        node = [];

                        _times(parseInt(term, 10), function(i) {
                            node.push(new HtmlBuilder(str.split("$").join(i + 1), true));
                        });
                        break;
                    }

                    str = node;
                }

                stack.unshift(str);
            });

            return toHtmlString(stack[0]);
        };
    })();
});