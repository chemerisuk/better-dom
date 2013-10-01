define(["Element"], function($Element, _parseFragment, _legacy, _forOwn, _makeError) {
    "use strict";

    // SETTER
    // ------

    (function() {
        var hooks = {},
            processObjectParam = function(value, name) { this.set(name, value); };

        /**
         * Set property/attribute value
         * @param {String} [name] property/attribute name
         * @param {String} value property/attribute value
         * @return {$Element}
         * @tutorial Getter and setter
         */
        $Element.prototype.set = function(name, value) {
            var len = arguments.length,
                nameType = typeof name;

            return _legacy(this, function(node, el) {
                var hook;

                if (len === 1) {
                    if (name == null) {
                        value = "";
                    } else if (nameType === "object") {
                        return _forOwn(name, processObjectParam, el);
                    } else {
                        // handle numbers, booleans etc.
                        value = nameType === "function" ? name : String(name);
                    }

                    if (node.type && "value" in node) {
                        // for IE use innerText because it doesn't trigger onpropertychange
                        name = window.addEventListener ? "value" : "innerText";
                    } else {
                        name = "innerHTML";
                    }
                } else if (len > 2 || len === 0 || nameType !== "string") {
                    throw _makeError("set", el);
                }

                if (typeof value === "function") {
                    value = value.call(el, value.length ? el.get(name) : undefined);
                }

                if (hook = hooks[name]) {
                    hook(node, value);
                } else if (value == null) {
                    node.removeAttribute(name);
                } else if (name in node) {
                    node[name] = value;
                } else {
                    node.setAttribute(name, value);
                }
            });
        };

        if (document.attachEvent) {
            // fix NoScope elements in IE < 10
            hooks.innerHTML = function(node, value) {
                node.innerHTML = "";
                node.appendChild(_parseFragment(value));
            };

            // fix hidden attribute for IE < 10
            hooks.hidden = function(node, value) {
                if (typeof value !== "boolean") {
                    throw _makeError("set", this);
                }

                node.hidden = value;

                if (value) {
                    node.setAttribute("hidden", "hidden");
                } else {
                    node.removeAttribute("hidden");
                }

                // trigger redraw in IE
                node.style.zoom = value ? "1" : "0";
            };
        }
    })();
});
