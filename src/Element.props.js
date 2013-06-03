define(["Node", "Element"], function(DOMNode, DOMElement, parseFragment, handleObjectParam) {
    "use strict";

    // GETTER / SETTER
    // ---------------

    (function() {
        var propHooks = {},
            throwIllegalAccess = function() { throw this.makeError("get"); };
        // protect access to some properties
        _.forEach("children childNodes elements parentNode firstElementChild lastElementChild nextElementSibling previousElementSibling".split(" "), function(key) {
            propHooks[key] = propHooks[key.replace("Element", "")] = {
                get: throwIllegalAccess,
                set: throwIllegalAccess
            };
        });

        propHooks.tagName = propHooks.nodeName = {
            get: function(el) {
                return el.nodeName.toLowerCase();
            }
        };

        /*@
        // fix NoScope elements in IE < 10
        propHooks.innerHTML = {
            set: function(el, value) {
                el.innerHTML = "";
                el.appendChild(parseFragment(value));
            }
        };
        
        // fix hidden attribute for IE < 10
        propHooks.hidden = {
            set: function(el, value) {
                if (typeof value !== "boolean") {
                    throw this.makeError("set");
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
        @*/

        /**
         * Get property or attribute by name
         * @memberOf DOMElement.prototype
         * @param  {String} [name] property/attribute name
         * @return {String} property/attribute value
         */
        DOMElement.prototype.get = function(name) {
            var el = this._node,
                hook = propHooks[name];

            if (name === undefined) {
                name = el.type && "value" in el ? "value" : "innerHTML";
            } else if (typeof name !== "string") {
                throw this.makeError("get");
            }

            if (hook) hook = hook.get;

            return hook ? hook(el) : name in el ? el[name] : el.getAttribute(name);
        };

        /**
         * Set property/attribute value
         * @memberOf DOMElement.prototype
         * @param {String} [name] property/attribute name
         * @param {String} value property/attribute value
         * @return {DOMElement} reference to this
         */
        DOMElement.prototype.set = function(name, value) {
            var el = this._node,
                nameType = typeof name,
                valueType = typeof value;

            if (nameType === "object") {
                _.forOwn(name, handleObjectParam("set"), this);
            } else {
                if (value === undefined) {
                    valueType = nameType;
                    value = name;
                    name = el.type && "value" in el ? "value" : "innerHTML";
                    nameType = "string";
                }

                if (valueType === "function") {
                    value = value.call(this, this.get(name));
                    valueType = typeof value;
                }

                if (nameType === "string") {
                    _.forEach(name.split(" "), function(name) {
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
                } else {
                    throw this.makeError("set");
                }
            }

            return this;
        };
    })();
});