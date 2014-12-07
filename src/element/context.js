import _ from "../util/index";
import { JSCRIPT_VERSION } from "../const";
import { $Document, DOM } from "../types";

// Inspired by the article written by Daniel Buchner:
// http://www.backalleycoder.com/2014/04/18/element-queries-from-the-feet-up/

// IE8 fails with about:blank, use better-dom-legacy.html instead
var SANDBOX_URL = JSCRIPT_VERSION < 9 ? _.getLegacyFile("html") : "about:blank";

// Chrome/Safari serious bug with focusing on the <object>:
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
            wrapper.innerHTML = DOM.emmet("object[data=`{0}` type=`text/html`]", [SANDBOX_URL]);

            object = wrapper.firstChild;
            // IE8 does not support onload - use timeout instead
            DOM.requestFrame(function repeat() {
                try {
                    subtree = object.contentDocument;
                } catch (err) {
                    return DOM.requestFrame(repeat);
                }
                var frameId;
                // add extra sizes and cut the frame border
                wrapper.attachEvent("onresize", () => {
                    frameId = frameId || DOM.requestFrame(() => {
                        object.width = wrapper.offsetWidth + 4;
                        object.height = wrapper.offsetHeight + 4;

                        frameId = null;
                    });
                });

                ready();
            });
        } else {
            object = doc.createElement("object");
            object.type = "text/html";
            object.onload = ready;

            if (!JSCRIPT_VERSION) {
                object.data = SANDBOX_URL;
            }

            wrapper.appendChild(object);
        }

        object.style.position = "absolute";
        object.width = "100%";
        object.height = "100%";

        this.before(ctx);

        if (JSCRIPT_VERSION) {
            // IE doesn't work if to set the data attribute before
            // appending element to the DOM
            object.data = SANDBOX_URL;
            // use calc to add extra sizes and cut the frame border
            object.style.cssText = "width:calc(100% + 4px);height:calc(100% + 4px);left:-2px;top:-2px;position:absolute";
        }

        if (ctx.css("position") === "static") {
            ctx.css("position", "relative");
        }

        return contexts[name] = record;
    }
});
