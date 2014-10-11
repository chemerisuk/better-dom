import _ from "../util/index";
import { HTML } from "../const";

/*
 * Helper for accessing css properties
 */
var hooks = {get: {}, set: {}},
    reDash = /\-./g,
    reCamel = /[A-Z]/g,
    directions = ["Top", "Right", "Bottom", "Left"],
    computed = _.computeStyle(HTML),
    // In Opera CSSStyleDeclaration objects returned by _.computeStyle have length 0
    props = computed.length ? _.slice.call(computed, 0) : _.keys(computed).map((key) => {
        /* istanbul ignore next */
        return key.replace(reCamel, (str) => "-" + str.toLowerCase());
    }),
    shortCuts = {
        font: ["fontStyle", "fontSize", "/", "lineHeight", "fontFamily"],
        padding: directions.map((dir) => "padding" + dir),
        margin: directions.map((dir) => "margin" + dir),
        "border-width": directions.map((dir) => "border" + dir + "Width"),
        "border-style": directions.map((dir) => "border" + dir + "Style")
    };

props.forEach((propName) => {
    var prefix = propName[0] === "-" ? propName.substr(1, propName.indexOf("-", 1) - 1) : null,
        unprefixedName = prefix ? propName.substr(prefix.length + 2) : propName,
        stylePropName = propName.replace(reDash, (str) => str[1].toUpperCase());
    /* istanbul ignore if */
    if (!(stylePropName in computed)) {
        // most of browsers starts vendor specific props in lowercase
        stylePropName = stylePropName[0].toLowerCase() + stylePropName.substr(1);
    }

    hooks.get[unprefixedName] = (style) => style[stylePropName];
    hooks.set[unprefixedName] = (style, value) => {
        value = typeof value === "number" ? value + "px" : value.toString();
        // use cssText property to determine DOM.importStyles call
        style["cssText" in style ? stylePropName : propName] = value;
    };
});

// Exclude the following css properties from adding px
" float fill-opacity font-weight line-height opacity orphans widows z-index zoom ".split(" ").forEach((propName) => {
    var stylePropName = propName.replace(reDash, (str) => str[1].toUpperCase());

    if (propName === "float") {
        stylePropName = "cssFloat" in computed ? "cssFloat" : "styleFloat";
        // normalize float css property
        hooks.get[propName] = (style) => style[stylePropName];
    }

    hooks.set[propName] = (style, value) => {
        style["cssText" in style ? stylePropName : propName] = value.toString();
    };
});

// normalize property shortcuts
_.keys(shortCuts).forEach((key) => {
    var props = shortCuts[key];

    hooks.get[key] = (style) => {
        var result = [],
            hasEmptyStyleValue = (prop, index) => {
                result.push(prop === "/" ? prop : style[prop]);

                return !result[index];
            };

        return props.some(hasEmptyStyleValue) ? "" : result.join(" ");
    };

    hooks.set[key] = (style, value) => {
        if (value && "cssText" in style) {
            // normalize setting complex property across browsers
            style.cssText += ";" + key + ":" + value;
        } else {
            props.forEach((name) => style[name] = typeof value === "number" ? value + "px" : value.toString());
        }
    };
});

export default hooks;
