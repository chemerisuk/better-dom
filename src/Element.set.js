define(["Element"], function($Element, _parseFragment, _forEach, _forOwn, _makeError) {
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
         * @example
         * // sets property href (and that action updates attribute value too)
         * link.set("href", "/some/path");
         * // sets attribute "data-attr" to "123"
         * link.set("data-attr", "123");
         * // sets innerHTML to "some text"
         * link.set("some text");
         */
        $Element.prototype.set = function(name, value) {
            var el = this._node,
                nameType = typeof name;

            if (nameType === "string") {
                if (value === undefined) {
                    value = name;
                    name = el.type && "value" in el ? "value" : "innerHTML";
                    // for IE use innerText because it doesn't trigger onpropertychange
                    if (!window.addEventListener && name === "value") name = "innerText";
                }

                if (typeof value === "function") {
                    value = value.call(this, value.length ? this.get(name) : undefined);
                }

                _forEach(name.split(" "), function(name) {
                    var hook = hooks[name];

                    if (hook) {
                        hook(el, value);
                    } else if (value === null) {
                        el.removeAttribute(name);
                    } else if (name in el) {
                        el[name] = value;
                    } else {
                        el.setAttribute(name, value);
                    }
                });
            } else if (nameType === "object") {
                _forOwn(name, processObjectParam, this);
            } else {
                throw _makeError("set", this);
            }

            return this;
        };

        if (document.attachEvent) {
            // fix NoScope elements in IE < 10
            hooks.innerHTML = function(el, value) {
                el.innerHTML = "";
                el.appendChild(_parseFragment(value));
            };
            
            // fix hidden attribute for IE < 10
            hooks.hidden = function(el, value) {
                if (typeof value !== "boolean") {
                    throw _makeError("set", this);
                }

                el.hidden = value;

                if (value) {
                    el.setAttribute("hidden", "hidden");
                } else {
                    el.removeAttribute("hidden");
                }

                // trigger redraw in IE
                el.style.zoom = value ? "1" : "0";
            };
        }
    })();
});
