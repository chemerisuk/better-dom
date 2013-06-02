define(["DOM"], function(DOM) {
    "use strict";

    /**
     * Parse emmet-like template to HTML string
     * @memberOf DOM
     * @param  {String} template emmet-like expression
     * @return {String} HTML string
     * @function
     * @see http://docs.emmet.io/cheat-sheet/
     */
    DOM.parseTemplate = (function() {
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
        rindex = /\$/g,
        rattr = /[\w\-_]+(=[^\s'"]+|='[^']+.|="[^"]+.)?/g,
        emptyElements = " area base br col hr img input link meta param command keygen source ",
        normalizeAttrs = function(term, str) {
            var index = str.indexOf("="),
                name = ~index ? str.substr(0, index) : str,
                value = ~index ? str.substr(index + 1) : "";

            if (value[0] !== "\"" && value[0] !== "'") value = "\"" + value + "\"";

            return term + " " + name + "=" + value;
        },
        toHtmlString = function(obj) {
            return _.isArray(obj) ? obj.join("") : obj.toString();
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
            insertTerm: function(term, toend) {
                var index = toend ? this.str.lastIndexOf("<") : this.str.indexOf(">");

                this.str = this.str.substr(0, index) + term + this.str.substr(index);
            },
            addTerm: function(term) {
                this.str += term;
            },
            toString: function() {
                return this.str;
            }
        };

        return function(template) {
            var stack = [],
                output = [],
                term = "";

            // parse exrpression into RPN
        
            _.forEach(template, function(str) {
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

            if (output.length) {
                output.push.apply(output, stack);

                stack = [];
            } else {
                stack.unshift(new HtmlBuilder(stack.shift()));
            }

            // transform RPN into html nodes

            _.forEach(output, function(str) {
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
                        node.insertTerm(_.reduce(term.match(rattr), normalizeAttrs, ""));
                        break;
                        
                    case "+":
                        term = toHtmlString(typeof term === "string" ? new HtmlBuilder(term) : term);

                        _.isArray(node) ? node.push(term) : node.addTerm(term);
                        break;

                    case ">":
                        term = toHtmlString(typeof term === "string" ? new HtmlBuilder(term) : term);

                        _.isArray(node) ? _.forEach(node, appendToAll, term) : node.insertTerm(term, true);
                        break;

                    case "*":
                        str = toHtmlString(node);
                        node = [];

                        _.times(parseInt(term, 10), function(i) {
                            node.push(new HtmlBuilder(str.replace(rindex, i + 1), true));
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