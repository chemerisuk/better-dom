import { keys } from "../util/index";
import { VENDOR_PREFIXES, HTML } from "../const";

// Helper for CSS properties access

var reDash = /\-./g,
    hooks = {get: {}, set: {}, find(name, style) {
        var propName = name.replace(reDash, (str) => str[1].toUpperCase());

        if (!(propName in style)) {
            propName = VENDOR_PREFIXES
                .map((prefix) => prefix + propName[0].toUpperCase() + propName.slice(1))
                .filter((prop) => prop in style)[0];
        }

        return this.get[name] = this.set[name] = propName;
    }},
    directions = ["Top", "Right", "Bottom", "Left"],
    shortCuts = {
        font: ["fontStyle", "fontSize", "/", "lineHeight", "fontFamily"],
        padding: directions.map((dir) => "padding" + dir),
        margin: directions.map((dir) => "margin" + dir),
        "border-width": directions.map((dir) => "border" + dir + "Width"),
        "border-style": directions.map((dir) => "border" + dir + "Style")
    };

// Exclude the following css properties from adding px
"float fill-opacity font-weight line-height opacity orphans widows z-index zoom".split(" ").forEach((propName) => {
    var stylePropName = propName.replace(reDash, (str) => str[1].toUpperCase());

    if (propName === "float") {
        stylePropName = "cssFloat" in HTML.style ? "cssFloat" : "styleFloat";
        // normalize float css property
        hooks.get[propName] = hooks.set[propName] = stylePropName;
    } else {
        hooks.get[propName] = stylePropName;
        hooks.set[propName] = (value, style) => {
            style[stylePropName] = value.toString();
        };
    }
});

// normalize property shortcuts
keys(shortCuts).forEach((key) => {
    var props = shortCuts[key];

    hooks.get[key] = (style) => {
        var result = [],
            hasEmptyStyleValue = (prop, index) => {
                result.push(prop === "/" ? prop : style[prop]);

                return !result[index];
            };

        return props.some(hasEmptyStyleValue) ? "" : result.join(" ");
    };

    hooks.set[key] = (value, style) => {
        if (value && "cssText" in style) {
            // normalize setting complex property across browsers
            style.cssText += ";" + key + ":" + value;
        } else {
            props.forEach((name) => style[name] = typeof value === "number" ? value + "px" : value.toString());
        }
    };
});

export default hooks;
