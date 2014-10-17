import _ from "../util/index";
import { MethodError } from "../errors";
import { JSCRIPT_VERSION } from "../const";

_.register({
    /**
     * Define a new property for the current element
     * @memberof! $Element#
     * @alias $Element#defineProperty
     * @param  {String} name      property name
     * @param  {Object} accessors getter and setter definition
     * @example
     * var foo;
     *
     * DOM.find("body").defineProperty("foo", {
     *   get: function() {
     *     return foo;
     *   },
     *   set: function(propValue) {
     *     foo = propValue;
     *   }
     * });
     */
    defineProperty: function(name, accessors) {
        var getter = accessors.get;
        var setter = accessors.set;

        if (typeof name !== "string" || typeof getter !== "function" || typeof setter !== "function") {
            throw new MethodError("defineProperty", arguments);
        }

        Object.defineProperty(this[0], name, {
            get: () => getter.call(this),
            set: (value) => { setter.call(this, value) }
        });

        return this;
    },
    /**
     * Define a new attribute for the current element
     * @memberof! $Element#
     * @alias $Element#defineAttribute
     * @param  {String} name      attribute name
     * @param  {Object} accessors getter and setter definition
     * @example
     * DOM.find("body").defineAttribute("foo", {
     *   get: function(attrValue) {
     *     // getter returns property value
     *     return String(attrValue).toLowerCase();
     *   },
     *   set: function(propValue) {
     *     if (propValue != null) {
     *       // setter returns attribute value
     *       return String(propValue).toUpperCase();
     *     }
     *   }
     * });
     */
    defineAttribute: function(name, accessors) {
        var node = this[0];
        var getter = accessors.get;
        var setter = accessors.set;

        if (typeof name !== "string" || typeof getter !== "function" || typeof setter !== "function") {
            throw new MethodError("defineAttribute", arguments);
        }

        // initial value reading must be before defineProperty
        // because IE8 will try to read wrong attribute value
        var initialValue = node.getAttribute(name);
        // trick to fix infinite recursion in IE8
        var attrName = JSCRIPT_VERSION < 9 ? name.toUpperCase() : name;
        var _setAttribute = node.setAttribute;
        var _removeAttribute = node.removeAttribute;

        Object.defineProperty(node, name, {
            get: () => {
                var attrValue = node.getAttribute(attrName, 1);

                return getter.call(this, attrValue);
            },
            set: (propValue) => {
                var attrValue = setter.call(this, propValue);

                if (attrValue == null) {
                    _removeAttribute.call(node, attrName, 1);
                } else {
                    _setAttribute.call(node, attrName, attrValue, 1);
                }
            }
        });

        // override methods to catch changes from attributes too
        node.setAttribute = (attrName, attrValue, flags) => {
            if (name === attrName) {
                node[name] = getter.call(this, attrValue);
            } else {
                _setAttribute.call(node, attrName, attrValue, flags);
            }
        };

        node.removeAttribute = (attrName, flags) => {
            if (name === attrName) {
                node[name] = getter.call(this, null);
            } else {
                _removeAttribute.call(node, attrName, flags);
            }
        };

        // apply initial attribute value
        node[name] = getter.call(this, initialValue);

        return this;
    }
});
