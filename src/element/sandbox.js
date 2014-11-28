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
        var obj;
        var ready = function() {
            if (typeof callback === "function") {
                var api = new $Element(this.contentDocument.documentElement);
                // remove default margin that exists in any browser
                api.find("body").css("margin", 0).set("tabindex", 0);
                // TODO: should create $Document instance here
                callback(api);
            }
        };

        if (typeof width === "number") width += "px";
        if (typeof height === "number") height += "px";

        if (JSCRIPT_VERSION < 9) {
            // IE8 is buggy, use insertAdjacentHTML for it
            // also use wrapper to get rid of frame border
            node.insertAdjacentHTML("beforebegin",
                DOM.emmet("div[style=`width:{1};height:{2};position:relative;overflow:hidden`]>object[data=`{0}` type=`text/html` width={3} height={4} style=`position:absolute;left:-2px;top:-2px`]",
                    [SANDBOX_URL, width, height, parseFloat(width) + 4, parseFloat(height) + 4])
            );

            obj = node.previousSibling;

            let api = obj.firstChild;
            // IE8 does not support onload - use timeout instead
            DOM.nextFrame(function repeat() {
                // TODO: tbd if try/catch is required
                try {
                    api.contentDocument.body.doScroll();
                } catch (err) {
                    return DOM.nextFrame(repeat);
                }

                ready.call(api);
            });
        } else {
            obj = DOCUMENT.createElement("object");
            // TODO: width and height are optional
            obj.type = "text/html";
            obj.data = SANDBOX_URL;
            obj.width = width;
            obj.height = height;
            obj.style.display = "block";
            obj.onload = ready;
            obj.tabIndex = 0;

            // TODO: check if parent is not null
            node.parentNode.insertBefore(obj, node);
        }

        return new $Element(obj);
    }
});
