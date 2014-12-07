import _ from "../util/index";
import { MethodError } from "../errors";
import { JSCRIPT_VERSION } from "../const";

const ATTR_CASE = JSCRIPT_VERSION < 9 ? "toUpperCase" : "toLowerCase";

_.register({
    /**
     * Define a new attribute for the current element
     * @memberof! $Element#
     * @alias $Element#define
     * @param  {String} name      attribute name
     * @param  {Function} getter  attribute to property convertor
     * @param  {Function} setter  property to attribute convertor
     * @example
     * DOM.find("body").define("foo", function(attrValue) {
     *   // getter returns property value
     *   return String(attrValue).toLowerCase();
     * }, function(propValue) {
     *   if (propValue != null) {
     *     // setter returns attribute value
     *     return String(propValue).toUpperCase();
     *   }
     * });
     */
    define(name, getter, setter) {
        var node = this[0];

        if (typeof name !== "string" || typeof getter !== "function" || typeof setter !== "function") {
            throw new MethodError("define", arguments);
        }

        // initial value reading must be before defineProperty
        // because IE8 will try to read wrong attribute value
        var initialValue = node.getAttribute(name);
        // trick to fix infinite recursion in IE8
        var attrName = name[ATTR_CASE]();
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
            if (name === attrName[ATTR_CASE]()) {
                node[name] = getter.call(this, attrValue);
            } else {
                _setAttribute.call(node, attrName, attrValue, flags);
            }
        };

        node.removeAttribute = (attrName, flags) => {
            if (name === attrName[ATTR_CASE]()) {
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
