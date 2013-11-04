// STYLES MANIPULATION
// -------------------

var _ = require("./utils"),
    $Element = require("./element"),
    getStyleHooks = {},
    setStyleHooks = {},
    reDash = /\-./g,
    reCamel = /[A-Z]/g,
    directions = ["Top", "Right", "Bottom", "Left"],
    computed = _.getComputedStyle(document.documentElement),
    // In Opera CSSStyleDeclaration objects returned by _getComputedStyle have length 0
    props = computed.length ? _.slice(computed) : _.map(_.keys(computed), function(key) {
        return key.replace(reCamel, function(str) { return "-" + str.toLowerCase() });
    });

/**
 * CSS getter/setter for an element
 * @param  {String} name    style property name
 * @param  {String} [value] style property value
 * @return {String|Object} property value or reference to this
 */
$Element.prototype.style = function(name, value) {
    var len = arguments.length,
        node = this._node,
        nameType = typeof name,
        style, hook;

    if (len === 1 && nameType === "string") {
        if (!node) return;

        style = node.style;
        hook = getStyleHooks[name];

        value = hook ? hook(style) : style[name];

        if (!value) {
            style = _.getComputedStyle(node);
            value = hook ? hook(style) : style[name];
        }

        return value;
    }

    return _.legacy(this, function(node, el) {
        var appendCssText = function(value, key) {
            var hook = setStyleHooks[key];

            if (typeof value === "function") {
                value = value.call(el, value.length ? el.style(key) : undefined);
            }

            if (value == null) value = "";

            if (hook) {
                hook(node.style, value);
            } else {
                node.style[key] = typeof value === "number" ? value + "px" : value.toString();
            }
        };

        if (len === 1 && name && nameType === "object") {
            _.forOwn(name, appendCssText);
        } else if (len === 2 && nameType === "string") {
            appendCssText(value, name);
        } else {
            throw _.makeError("style", el);
        }
    });
};

_.forEach(props, function(propName) {
    var prefix = propName[0] === "-" ? propName.substr(1, propName.indexOf("-", 1) - 1) : null,
        unprefixedName = prefix ? propName.substr(prefix.length + 2) : propName,
        stylePropName = propName.replace(reDash, function(str) { return str[1].toUpperCase() });

    // most of browsers starts vendor specific props in lowercase
    if (!(stylePropName in computed)) {
        stylePropName = stylePropName[0].toLowerCase() + stylePropName.substr(1);
    }

    if (stylePropName !== propName) {
        getStyleHooks[unprefixedName] = function(style) {
            return style[stylePropName];
        };
        setStyleHooks[unprefixedName] = function(style, value) {
            value = typeof value === "number" ? value + "px" : value.toString();
            // use __dom__ property to determine DOM.importStyles call
            style[style.__dom__ ? propName : stylePropName] = value;
        };
    }

    // Exclude the following css properties from adding px
    if (~" fill-opacity font-weight line-height opacity orphans widows z-index zoom ".indexOf(" " + propName + " ")) {
        setStyleHooks[propName] = function(style, value) {
            style[style.__dom__ ? propName : stylePropName] = value.toString();
        };
    }
});

// normalize float css property
if ("cssFloat" in computed) {
    getStyleHooks.float = function(style) {
        return style.cssFloat;
    };
    setStyleHooks.float = function(style, value) {
        style.cssFloat = value;
    };
} else {
    getStyleHooks.float = function(style) {
        return style.styleFloat;
    };
    setStyleHooks.float = function(style, value) {
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
    getStyleHooks[key] = function(style) {
        var result = [],
            hasEmptyStyleValue = function(prop, index) {
                result.push(prop === "/" ? prop : style[prop]);

                return !result[index];
            };

        return _.some(props, hasEmptyStyleValue) ? "" : result.join(" ");
    };
    setStyleHooks[key] = function(style, value) {
        _.forEach(props, function(name) {
            style[name] = typeof value === "number" ? value + "px" : value.toString();
        });
    };
});
