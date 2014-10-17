import _ from "../util/index";
import { MethodError } from "../errors";
import { JSCRIPT_VERSION } from "../const";

_.register({
    defineProperty: function(name, accessors) {
        var node = this[0];
        var getter = accessors.get;
        var setter = accessors.set;

        if (typeof name !== "string" || typeof getter !== "function" || typeof setter !== "function") {
            throw new MethodError("defineAttribute", arguments);
        }

        Object.defineProperty(node, name, {
            get: () => getter.call(this),
            set: (value) => { setter.call(this, value) }
        });

        return this;
    },
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
                /* istanbul ignore next */
                if (JSCRIPT_VERSION < 9) {
                    // fix refresh issue in IE8
                    node.className = node.className;
                }
            }
        });

        // override methods to catch changes from them too
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
