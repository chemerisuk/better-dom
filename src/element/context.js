import _ from "../util/index";
import { JSCRIPT_VERSION, WINDOW } from "../const";
import { $Document, DOM } from "../types";

// Inspired by the article written by Daniel Buchner:
// http://www.backalleycoder.com/2014/04/18/element-queries-from-the-feet-up/

var CONTEXT_TEMPLATE = "div[style=overflow:hidden]>object[data=`about:blank` type=text/html style=`position:absolute` width=100% height=100%]";
/* istanbul ignore if */
if (JSCRIPT_VERSION) {
    // use calc to cut ugly frame border in IE>8
    CONTEXT_TEMPLATE = CONTEXT_TEMPLATE.replace("position:absolute", "width:calc(100% + 4px);height:calc(100% + 4px);left:-2px;top:-2px;position:absolute");

    if (JSCRIPT_VERSION > 8) {
        // for IE>8 have to set the data attribute AFTER adding element to the DOM
        CONTEXT_TEMPLATE = CONTEXT_TEMPLATE.replace("data=`about:blank` ", "");
    } else {
        // IE8 fails with about:blank, use better-dom-legacy.html instead
        CONTEXT_TEMPLATE = CONTEXT_TEMPLATE.replace("about:blank", _.getLegacyFile("html"));
    }
}

// Chrome/Safari/Opera have serious bug with tabbing to the <object> tree:
// https://code.google.com/p/chromium/issues/detail?id=255150

_.register({
    context(name, callback = () => {}) {
        var contexts = this._["<%= prop('context') %>"],
            data = contexts[name] || [];

        if (data[0]) {
            // callback is always async
            WINDOW.setTimeout(() => { callback(data[1]) }, 1);

            return data[0];
        }
        // use innerHTML instead of creating element manually because of IE8
        var ctx = DOM.create(CONTEXT_TEMPLATE);
        var object = ctx.get("firstChild");
        // set onload handler before adding element to the DOM
        object.onload = () => {
            // apply user-defined styles for the context
            // need to add class in ready callback because of IE8
            if (ctx.addClass(name).css("position") === "static") {
                ctx.css("position", "relative");
            }
            // store new context root internally and invoke callback
            callback(data[1] = new $Document(object.contentDocument));
        };

        this.before(ctx);
        /* istanbul ignore if */
        if (JSCRIPT_VERSION) {
            // IE doesn't work if to set the data attribute before adding
            // the <object> element to the DOM. IE8 will ignore this change
            // and won't start builing a new document for about:blank
            object.data = "about:blank";

            if (JSCRIPT_VERSION < 9) {
                // IE8 does not support onload - use timeout instead
                DOM.requestFrame(function repeat() {
                    if (!object.contentDocument) {
                        return DOM.requestFrame(repeat);
                    }

                    var frameId;
                    // add extra sizes and cut the frame border
                    ctx[0].attachEvent("onresize", () => {
                        frameId = frameId || DOM.requestFrame(() => {
                            object.width = ctx[0].offsetWidth + 4;
                            object.height = ctx[0].offsetHeight + 4;

                            frameId = null;
                        });
                    });

                    object.onload();
                });
            }
        }
        // store context data internally
        contexts[name] = data;

        return data[0] = ctx;
    }
});
