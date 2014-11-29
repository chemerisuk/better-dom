import _ from "../util/index";
import { JSCRIPT_VERSION, DOCUMENT } from "../const";
import { $Element, DOM } from "../types";

var SANDBOX_URL = "about:blank";

if (JSCRIPT_VERSION < 9) {
    let legacyScripts = _.filter.call(DOCUMENT.scripts, (script) => script.src.indexOf("better-dom-legacy.js") >= 0);
    // IE8 fails with about:blank, use better-dom-legacy.html instead
    SANDBOX_URL = legacyScripts[0].src.slice(0, -2) + "html";
}

// NOTE: Chrome/Safari have issue with focusing on the <object>:
// https://code.google.com/p/chromium/issues/detail?id=255150

_.register({
    context(name, callback) {
        var node = this[0];
        var wrapper = DOCUMENT.createElement("div");
        var object;
        var ready = () => {
            wrapper.className = name;

            if (typeof callback === "function") {
                callback(new $Element(object.contentDocument.documentElement));
            }
        };

        if (JSCRIPT_VERSION < 9) {
            // IE8 is buggy, use innerHTML and better-dom-legacy.html
            wrapper.innerHTML = DOM.emmet("object[data=`{0}` type=`text/html`]", [SANDBOX_URL]);

            object = wrapper.firstChild;
            // get rid of the frame border
            object.style.cssText = "left:-2px;top:-2px";
            // IE8 does not support onload - use timeout instead
            DOM.nextFrame(function repeat() {
                var htmlEl;
                // TODO: tbd if try/catch check is required
                try {
                    htmlEl = object.contentDocument.documentElement;
                } catch (err) {
                    return DOM.nextFrame(repeat);
                }
                // use the trick below to hide frame border in IE8
                htmlEl.onresize = function resizing() {
                    htmlEl.onresize = null; // block recursive updates

                    object.width = htmlEl.offsetWidth + 4;
                    object.height = htmlEl.offsetHeight + 4;

                    DOM.nextFrame(() => {
                        htmlEl.onresize = resizing;
                    });
                };

                ready();
            });
        } else {
            object = DOCUMENT.createElement("object");
            object.type = "text/html";
            object.data = SANDBOX_URL;
            object.onload = ready;

            wrapper.appendChild(object);
        }

        wrapper.style.position = "relative";
        wrapper.style.overflow = "hidden";

        object.style.position = "absolute";
        object.width = "100%";
        object.height = "100%";

        // TODO: check if parent is not null
        node.parentNode.insertBefore(wrapper, node);

        return new $Element(wrapper);
    }
});
