define(["Node", "Element"], function(DOMNode, DOMElement, _parseFragment, _forEach, _forOwn, _makeError) {
    "use strict";

    // GETTER / SETTER
    // ---------------

    (function() {
        var propHooks = {},
            processObjectParam = function(value, name) { this.set(name, value); };

        /**
         * Get property or attribute by name
         * @param  {String} [name] property/attribute name
         * @return {String} property/attribute value
         */
        DOMElement.prototype.get = function(name) {
            var el = this._node,
                hook = propHooks[name];

            if (name === undefined) {
                name = el.type && "value" in el ? "value" : "innerHTML";
            } else if (typeof name !== "string") {
                throw _makeError("get", this);
            }

            if (hook) hook = hook.get;

            return hook ? hook(el) : name in el ? el[name] : el.getAttribute(name);
        };

        /**
         * Set property/attribute value
         * @param {String} [name] property/attribute name
         * @param {String} value property/attribute value
         * @return {DOMElement}
         */
        DOMElement.prototype.set = function(name, value) {
            var el = this._node,
                nameType = typeof name;

            if (nameType === "string") {
                if (value === undefined) {
                    value = name;
                    name = el.type && "value" in el ? "value" : "innerHTML";
                }

                if (typeof value === "function") {
                    value = value.call(this, this.get(name));
                }

                _forEach(name.split(" "), function(name) {
                    var hook = propHooks[name];

                    if (hook) {
                        hook.set(el, value);
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

        propHooks.tagName = propHooks.nodeName = {
            get: function(el) {
                return el.nodeName.toLowerCase();
            }
        };

        if (document.attachEvent) {
            // fix NoScope elements in IE < 10
            propHooks.innerHTML = {
                set: function(el, value) {
                    el.innerHTML = "";
                    el.appendChild(_parseFragment(value));
                }
            };
            
            // fix hidden attribute for IE < 10
            propHooks.hidden = {
                set: function(el, value) {
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
                }
            };
        }
    })();
});