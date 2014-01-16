var _ = require("./utils"),
    $Element = require("./element"),
    hooks = {get: {}, set: {}},
    reDash = /\-./g,
    reCamel = /[A-Z]/g,
    directions = ["Top", "Right", "Bottom", "Left"],
    computed = window.getComputedStyle(document.documentElement),
    // In Opera CSSStyleDeclaration objects returned by _getComputedStyle have length 0
    props = computed.length ? _.slice(computed) : _.map(Object.keys(computed), function(key) {
        return key.replace(reCamel, function(str) { return "-" + str.toLowerCase() });
    });

/**
 * CSS getter/setter for an element
 * @param  {String|Object}   name    style property name or key/value object
 * @param  {String|Function} [value] style property value or function that returns it
 * @return {String|$Element} property value or reference to this
 */
$Element.prototype.style = function(name, value) {
    var len = arguments.length,
        node = this._node,
        nameType = typeof name,
        style, hook, computed;

    if (len === 1 && (nameType === "string" || Array.isArray(name))) {
        if (node) {
            style = node.style;

            value = _.foldl(nameType === "string" ? [name] : name, function(memo, name) {
                hook = hooks.get[name];
                value = hook ? hook(style) : style[name];

                if (!computed && !value) {
                    style = window.getComputedStyle(node);
                    value = hook ? hook(style) : style[name];

                    computed = true;
                }

                memo[name] = value;

                return memo;
            }, {});
        }

        return node && nameType === "string" ? value[name] : value;
    }

    return this.legacy(function(node, el, index, ref) {
        var style = node.style,
            appendCssText = function(value, key) {
                var hook = hooks.set[key];

                if (typeof value === "function") value = value(el, index, ref);

                if (value == null) value = "";

                if (hook) {
                    hook(style, value);
                } else {
                    style[key] = typeof value === "number" ? value + "px" : value.toString();
                }
            };

        if (len === 1 && name && nameType === "object") {
            _.forOwn(name, appendCssText);
        } else if (len === 2 && nameType === "string") {
            appendCssText(value, name);
        } else {
            throw _.makeError("style");
        }
    });
};

// $Element.style hooks

_.forEach(props, function(propName) {
    var prefix = propName[0] === "-" ? propName.substr(1, propName.indexOf("-", 1) - 1) : null,
        unprefixedName = prefix ? propName.substr(prefix.length + 2) : propName,
        stylePropName = propName.replace(reDash, function(str) { return str[1].toUpperCase() });

    // most of browsers starts vendor specific props in lowercase
    if (!(stylePropName in computed)) {
        stylePropName = stylePropName[0].toLowerCase() + stylePropName.substr(1);
    }

    if (stylePropName !== propName) {
        hooks.get[unprefixedName] = function(style) {
            return style[stylePropName];
        };
        hooks.set[unprefixedName] = function(style, value) {
            value = typeof value === "number" ? value + "px" : value.toString();
            // use cssText property to determine DOM.importStyles call
            style["cssText" in style ? stylePropName : propName] = value;
        };
    }

    // Exclude the following css properties from adding px
    if (~" fill-opacity font-weight line-height opacity orphans widows z-index zoom ".indexOf(" " + propName + " ")) {
        hooks.set[propName] = function(style, value) {
            style["cssText" in style ? stylePropName : propName] = value.toString();
        };
    }
});

// normalize float css property
if ("cssFloat" in computed) {
    hooks.get.float = function(style) {
        return style.cssFloat;
    };
    hooks.set.float = function(style, value) {
        style.cssFloat = value;
    };
} else {
    hooks.get.float = function(style) {
        return style.styleFloat;
    };
    hooks.set.float = function(style, value) {
        style.styleFloat = value;
    };
}

// normalize property shortcuts
_.forOwn({
    font: ["fontStyle", "fontSize", "/", "lineHeight", "fontFamily"],
    padding: _.map(directions, function(dir) { return "padding" + dir }),
    margin: _.map(directions, function(dir) { return "margin" + dir }),
    "border-width": _.map(directions, function(dir) { return "border" + dir + "Width" }),
    "border-style": _.map(directions, function(dir) { return "border" + dir + "Style" })
}, function(props, key) {
    hooks.get[key] = function(style) {
        var result = [],
            hasEmptyStyleValue = function(prop, index) {
                result.push(prop === "/" ? prop : style[prop]);

                return !result[index];
            };

        return _.some(props, hasEmptyStyleValue) ? "" : result.join(" ");
    };
    hooks.set[key] = function(style, value) {
        if (value && "cssText" in style) {
            // normalize setting complex property across browsers
            style.cssText += ";" + key + ":" + value;
        } else {
            _.forEach(props, function(name) {
                style[name] = typeof value === "number" ? value + "px" : value.toString();
            });
        }
    };
});

module.exports = hooks;
