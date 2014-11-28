import _ from "../util/index";
import { JSCRIPT_VERSION, DOCUMENT } from "../const";
import { $Element, DOM } from "../types";

var SANDBOX_URL = "about:blank";

if (JSCRIPT_VERSION < 9) {
    let legacyScripts = _.filter.call(DOCUMENT.scripts, (script) => script.src.indexOf("better-dom-legacy.js") >= 0);
    // IE8 fails with about:blank, use better-dom-legacy.html instead
    SANDBOX_URL = legacyScripts[0].src.slice(0, -2) + "html";
}

_.register({
    sandbox(width, height, callback) {
        // NOTE: Chrome/Safari have issue with focusing on the <object>:
        // https://code.google.com/p/chromium/issues/detail?id=255150

        var node = this[0];
        var wrapper = DOCUMENT.createElement("div");
        var object;
        var ready = function() {
            var body = object.contentDocument.body;
            // remove default margin that exists in any browser
            body.style.margin = 0;

            if (typeof callback === "function") {
                // TODO: should create $Document instance here
                callback(new $Element(object.contentDocument.documentElement));
            }
        };

        if (typeof width === "number") width += "px";
        if (typeof height === "number") height += "px";

        wrapper.style.width = width;
        wrapper.style.height = height;

        if (JSCRIPT_VERSION < 9) {
            // IE8 is buggy, use innerHTML and better-dom-legacy.html
            wrapper.innerHTML = DOM.emmet("object[data=`{0}` type=`text/html`]", [SANDBOX_URL]);

            object = wrapper.firstChild;
            // get rid of the frame border
            object.width = parseFloat(width) + 4;
            object.height = parseFloat(height) + 4;
            object.style.cssText = "position:absolute;left:-2px;top:-2px";

            wrapper.style.position = "relative";
            wrapper.style.overflow = "hidden";
            // IE8 does not support onload - use timeout instead
            DOM.nextFrame(function repeat() {
                // TODO: tbd if try/catch check is required
                try {
                    object.contentDocument.body.doScroll();
                } catch (err) {
                    return DOM.nextFrame(repeat);
                }

                ready();
            });
        } else {
            object = DOCUMENT.createElement("object");
            // TODO: width and height are optional
            object.type = "text/html";
            object.data = SANDBOX_URL;
            object.onload = ready;
            object.width = "100%";
            object.height = "100%";

            wrapper.appendChild(object);
        }
        // TODO: check if parent is not null
        node.parentNode.insertBefore(wrapper, node);

        return new $Element(wrapper);
    }
});
