import _ from "../util/index";
import { JSCRIPT_VERSION, CONTEXT_DATA } from "../const";
import { $Element, DOM } from "../types";

// Inspired by the article written by Daniel Buchner:
// http://www.backalleycoder.com/2014/04/18/element-queries-from-the-feet-up/

var SANDBOX_URL = "about:blank";
/* istanbul ignore if */
if (JSCRIPT_VERSION < 9) {
    let legacyScripts = _.filter.call(document.scripts, (script) => script.src.indexOf("better-dom-legacy.js") >= 0);
    // IE8 fails with about:blank, use better-dom-legacy.html instead
    SANDBOX_URL = legacyScripts[0].src.slice(0, -2) + "html";
}

// NOTE: Chrome/Safari have issue with focusing on the <object>:
// https://code.google.com/p/chromium/issues/detail?id=255150

_.register({
    context(name, callback) {
        var node = this[0],
            doc = node.ownerDocument,
            contexts = this._[CONTEXT_DATA];

        if (name in contexts) return contexts[name];

        var wrapper = doc.createElement("div");
        var object;
        var ready = () => {
            var doc = object.contentDocument;
            // remove default margin because it's useless
            doc.body.style.margin = 0;
            // apply user-defined styles for the context
            wrapper.className = name;

            if (typeof callback === "function") {
                callback(new $Element(doc.documentElement));
            }
        };
        /* istanbul ignore if */
        if (JSCRIPT_VERSION < 9) {
            // IE8 is buggy, use innerHTML and better-dom-legacy.html
            // use overflow and extra size to get rid of the frame
            wrapper.innerHTML = DOM.emmet("object[data=`{0}` type=`text/html` style=`left:-2px;top:-2px`]", [SANDBOX_URL]);

            object = wrapper.firstChild;
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
            object = doc.createElement("object");
            object.type = "text/html";
            object.data = SANDBOX_URL;
            object.onload = ready;

            wrapper.appendChild(object);
        }

        wrapper.style.overflow = "hidden";

        object.style.position = "absolute";
        object.width = "100%";
        object.height = "100%";

        // TODO: check if parent is not null
        node.parentNode.insertBefore(wrapper, node);

        return contexts[name] = new $Element(wrapper);
    }
});
