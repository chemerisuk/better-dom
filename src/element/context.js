import _ from "../util/index";
import { JSCRIPT_VERSION } from "../const";
import { $Document, DOM } from "../types";

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
            contexts = this._["<%= prop('context') %>"];

        if (name in contexts) {
            let rec = contexts[name];

            if (typeof callback === "function") {
                _.safeCall(this, callback, rec[1]);
            }

            return rec[0];
        }

        var ctx = DOM.create("div[style=overflow:hidden]", [name]);
        var wrapper = ctx[0];
        var record = [ctx];
        var object, subtree;
        var ready = () => {
            // apply user-defined styles for the context
            // need to add class in ready callback because of IE8
            ctx.addClass(name);

            record[1] = new $Document(subtree || object.contentDocument);

            if (typeof callback === "function") {
                callback.call(this, record[1]);
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
                try {
                    subtree = object.contentDocument;
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

        object.style.position = "absolute";
        object.width = "100%";
        object.height = "100%";

        this.before(ctx);

        if (ctx.css("position") === "static") {
            ctx.css("position", "relative");
        }

        return contexts[name] = record;
    }
});
