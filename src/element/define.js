import { register } from "../util/index";
import { MethodError } from "../errors";
import { JSCRIPT_VERSION, RETURN_THIS } from "../const";

const ATTR_CASE = JSCRIPT_VERSION < 9 ? "toUpperCase" : "toLowerCase";

register({
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

        // Use trick to fix infinite recursion in IE8:
        // http://www.smashingmagazine.com/2014/11/28/complete-polyfill-html5-details-element/

        var attrName = name[ATTR_CASE]();
        var _setAttribute = node.setAttribute;
        var _removeAttribute = node.removeAttribute;
        /* istanbul ignore if */
        if (JSCRIPT_VERSION < 9) {
            // read attribute before the defineProperty call
            // to set the correct initial state for IE8
            let initialValue = node.getAttribute(name);

            if (initialValue !== null) {
                node[attrName] = initialValue;
            }
        }

        Object.defineProperty(node, name, {
            get: () => {
                var attrValue = node.getAttribute(attrName, 1);
                // attr value -> prop value
                return getter.call(this, attrValue);
            },
            set: (propValue) => {
                // prop value -> attr value
                var attrValue = setter.call(this, propValue);

                if (attrValue == null) {
                    _removeAttribute.call(node, attrName, 1);
                } else {
                    _setAttribute.call(node, attrName, attrValue, 1);
                }
            }
        });

        // override methods to catch changes from attributes too
        node.setAttribute = (name, value, flags) => {
            if (attrName === name[ATTR_CASE]()) {
                node[name] = getter.call(this, value);
            } else {
                _setAttribute.call(node, name, value, flags);
            }
        };

        node.removeAttribute = (name, flags) => {
            if (attrName === name[ATTR_CASE]()) {
                node[name] = getter.call(this, null);
            } else {
                _removeAttribute.call(node, name, flags);
            }
        };

        return this;
    }
}, null, () => RETURN_THIS);
