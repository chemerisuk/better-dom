define(["Element"], function($Element, _parseFragment, _legacy, _forOwn, _makeError) {
    "use strict";

    // SETTER
    // ------

    (function() {
        var hooks = {};

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
                var initialName, hook;

                if (len === 1) {
                    if (name == null) {
                        value = "";
                    } else if (nameType === "object") {
                        return _forOwn(name, function(value, name) { el.set(name, value) });
                    } else {
                        // handle numbers, booleans etc.
                        value = nameType === "function" ? name : String(name);
                    }

                    initialName = name;

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

                if (initialName) {
                    name = initialName;
                    value = undefined;
                }
            });
        };

        if (document.attachEvent) {
            // fix NoScope elements in IE < 10
            hooks.innerHTML = function(node, value) {
                node.innerHTML = "";
                node.appendChild(_parseFragment(value));
            };
        }
    })();
});
