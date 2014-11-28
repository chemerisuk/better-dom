import _ from "../util/index";
import { JSCRIPT_VERSION, DOCUMENT } from "../const";
import { $Element, DOM } from "../types";

var SANDBOX_URL = "about:blank";

if (JSCRIPT_VERSION < 9) {
    let legacyScripts = _.filter.call(DOCUMENT.scripts, (script) => script.src.indexOf("better-dom-legacy.js") >= 0);
    // IE8 fails with about:blank, use better-dom-legacy.html instead
    SANDBOX_URL = legacyScripts[0].src.slice(0, -2) + "html";
}

// Inspired by the article written by Daniel Buchner:
// http://www.backalleycoder.com/2014/04/18/element-queries-from-the-feet-up/

_.register({
    sandbox(width, height, callback) {
        var node = this[0];
        var wrapper = DOCUMENT.createElement("div");
        var object;
        var ready = function() {
            var body = object.contentDocument.body;
            // remove default margin that exists in any browser
            body.style.margin = 0;
            body.tabIndex = 0;

            if (typeof callback === "function") {
                // TODO: should create $Document instance here
                callback(new $Element(object.contentDocument.documentElement));
            }
        };

        if (typeof width === "number") width += "px";
        if (typeof height === "number") height += "px";

        wrapper.style.width = width;
        wrapper.style.height = height;
        wrapper.style.outline = "none";
        wrapper.tabIndex = 0;
        wrapper.onfocus = function() {
            setTimeout(() => {
                object.contentDocument.body.focus();
            }, 0);
        };

        if (JSCRIPT_VERSION < 9) {
            wrapper.style.position = "relative";
            wrapper.style.overflow = "hidden";

            width = parseFloat(width) + 4;
            height = parseFloat(height) + 4;

            // IE8 is buggy, use innerHTML for it
            // also use wrapper to get rid of frame border
            wrapper.innerHTML = DOM.emmet(
                "object[data=`{0}` type=`text/html` style=`position:absolute;left:-2px;top:-2px`]", [SANDBOX_URL]);

            object = wrapper.firstChild;
            // IE8 does not support onload - use timeout instead
            DOM.nextFrame(function repeat() {
                // TODO: tbd if try/catch is required
                try {
                    object.contentDocument.body.doScroll();
                } catch (err) {
                    return DOM.nextFrame(repeat);
                }

                ready();
            });
        } else {
            width = "100%";
            height = "100%";

            object = DOCUMENT.createElement("object");
            // TODO: width and height are optional
            object.type = "text/html";
            object.data = SANDBOX_URL;

            object.onload = ready;

            wrapper.appendChild(object);
        }

        object.tabIndex = -1;
        object.width = width;
        object.height = height;

        // TODO: check if parent is not null
        node.parentNode.insertBefore(wrapper, node);

        return new $Element(wrapper);
    }
});
