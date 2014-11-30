import _ from "../util/index";
import { JSCRIPT_VERSION, CONTEXT_DATA } from "../const";
import { $Element, $Document, DOM } from "../types";

// Inspired by the article written by Daniel Buchner:
// http://www.backalleycoder.com/2014/04/18/element-queries-from-the-feet-up/

// IE8 fails with about:blank, use better-dom-legacy.html instead
var SANDBOX_URL = JSCRIPT_VERSION < 9 ? _.getLegacyFile("html") : "about:blank";

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
                callback(new $Document(doc));
            }
        };
        /* istanbul ignore if */
        if (JSCRIPT_VERSION < 9) {
            // IE8 is buggy, use innerHTML and better-dom-legacy.html
            // use overflow and extra size to get rid of the frame
            wrapper.innerHTML = DOM.emmet("object[data=`{0}` type=`text/html` style=`left:-2px;top:-2px`]", [SANDBOX_URL]);

            object = wrapper.firstChild;
            // IE8 does not support onload - use timeout instead
            DOM.requestFrame(function repeat() {
                var htmlEl;
                // TODO: tbd if try/catch check is required
                try {
                    htmlEl = object.contentDocument.documentElement;
                } catch (err) {
                    return DOM.requestFrame(repeat);
                }
                // use the trick below to hide frame border in IE8
                wrapper.onresize = function resizing() {
                    wrapper.onresize = null;

                    object.width = wrapper.offsetWidth + 4;
                    object.height = wrapper.offsetHeight + 4;

                    DOM.requestFrame(() => {
                        wrapper.onresize = resizing;
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
