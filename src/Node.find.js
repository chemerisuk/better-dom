define(["Node"], function(DOMNode, DOMElement, DOMElementCollection, makeError) {
    "use strict";

    (function() {
        // big part of code inspired by Sizzle:
        // https://github.com/jquery/sizzle/blob/master/sizzle.js

        // TODO: disallow to use buggy selectors?
        var rquickExpr = /^(?:#([\w\-]+)|(\w+)|\.([\w\-]+))$/,
            rsibling = /[\x20\t\r\n\f]*[+~>]/,
            rescape = /'|\\/g,
            tmpId = _.uniqueId("DOM");

        if (!document.getElementsByClassName) {
            // exclude getElementsByClassName from pattern
            rquickExpr = /^(?:#([\w\-]+)|(\w+))$/;
        }
        
        /**
         * Finds element by selector
         * @memberOf DOMNode.prototype
         * @param  {String} selector css selector
         * @return {DOMElement} element or null if nothing was found
         * @example
         * var domBody = DOM.find("body");
         *
         * domBody.find("#element");
         * // returns DOMElement with id="element"
         * domBody.find(".link");
         * // returns first element with class="link"
         */
        DOMNode.prototype.find = function(selector, /*INTERNAL*/multiple) {
            if (typeof selector !== "string") {
                throw makeError("find");
            }

            var node = this._node,
                quickMatch, m, elem, elements;

            if (quickMatch = rquickExpr.exec(selector)) {
                // Speed-up: "#ID"
                if (m = quickMatch[1]) {
                    elem = document.getElementById(m);
                    // Handle the case where IE, Opera, and Webkit return items
                    // by name instead of ID
                    if ( elem && elem.parentNode && elem.id === m && (node === document || this.contains(elem)) ) {
                        elements = [elem];
                    }
                // Speed-up: "TAG"
                } else if (quickMatch[2]) {
                    elements = node.getElementsByTagName(selector);
                // Speed-up: ".CLASS"
                } else if (m = quickMatch[3]) {
                    elements = node.getElementsByClassName(m);
                }

                if (elements && !multiple) {
                    elements = elements[0];
                }
            } else {
                var old = true,
                    nid = tmpId,
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

            return multiple ? new DOMElementCollection(elements) : DOMElement(elements);
        };

        /**
         * Finds all elements by selector
         * @memberOf DOMNode.prototype
         * @param  {String} selector css selector
         * @return {DOMElementCollection} elements collection
         */
        DOMNode.prototype.findAll = function(selector) {
            return this.find(selector, true);
        };
    })();
});