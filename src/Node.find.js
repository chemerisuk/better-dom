define(["Node"], function($Node, $Element, $CompositeElement, _makeError) {
    "use strict";

    // SEARCH BY QUERY
    // ---------------

    (function() {
        // big part of code inspired by Sizzle:
        // https://github.com/jquery/sizzle/blob/master/sizzle.js

        // TODO: disallow to use buggy selectors?
        var rquickExpr = document.getElementsByClassName ? /^(?:(\w+)|\.([\w\-]+))$/ : /^(?:(\w+))$/,
            rsibling = /[\x20\t\r\n\f]*[+~>]/,
            rescape = /'|\\/g,
            tmpId = "DOM" + new Date().getTime();

        /**
         * Find the first matched element by css selector
         * @param  {String} selector css selector
         * @return {$Element} the first matched element
         */
        $Node.prototype.find = function(selector, /*INTERNAL*/multiple) {
            if (typeof selector !== "string") {
                throw _makeError("find", this);
            }

            var node = this._node,
                quickMatch = rquickExpr.exec(selector),
                m, elements, old, nid, context;

            if (!node) return;

            if (quickMatch) {
                // Speed-up: "TAG"
                if (quickMatch[1]) {
                    elements = node.getElementsByTagName(selector);
                // Speed-up: ".CLASS"
                } else if (m = quickMatch[2]) {
                    elements = node.getElementsByClassName(m);
                }

                if (elements && !multiple) elements = elements[0];
            } else {
                old = true;
                nid = tmpId;
                context = node;

                if (node !== document) {
                    // qSA works strangely on Element-rooted queries
                    // We can work around this by specifying an extra ID on the root
                    // and working up from there (Thanks to Andrew Dupont for the technique)
                    if ( (old = node.getAttribute("id")) ) {
                        nid = old.replace(rescape, "\\$&");
                    } else {
                        node.setAttribute("id", nid);
                    }

                    nid = "[id='" + nid + "'] ";

                    context = rsibling.test(selector) && node.parentNode || node;
                    selector = nid + selector.split(",").join("," + nid);
                }

                try {
                    elements = context[multiple ? "querySelectorAll" : "querySelector"](selector);
                } finally {
                    if ( !old ) {
                        node.removeAttribute("id");
                    }
                }
            }

            return multiple ? new $CompositeElement(elements) : $Element(elements);
        };

        /**
         * Finds all matched elements by css selector
         * @param  {String} selector css selector
         * @return {$Element} collection of matched elements
         */
        $Node.prototype.findAll = function(selector) {
            return this.find(selector, true);
        };
    })();
});
