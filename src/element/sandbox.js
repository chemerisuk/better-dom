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
    sandbox(callback) {
        var node = this[0];
        var obj;
        var ready = () => {
            if (typeof callback === "function") {
                // TODO: should create $Document instance here
                callback(new $Element(obj.contentDocument.documentElement));
            }
        };

        if (JSCRIPT_VERSION < 9) {
            // IE8 is buggy, use insertAdjacentHTML for it
            node.insertAdjacentHTML("beforebegin",
                DOM.emmet("object[data=`{0}` type=`text/html`]", [SANDBOX_URL])
            );

            obj = node.previousSibling;
            // IE8 does not support onload - use timeout instead
            DOM.nextFrame(function repeat() {
                // TODO: tbd if try/catch is required
                try {
                    obj.contentDocument.body.doScroll();
                } catch (err) {
                    return DOM.nextFrame(repeat);
                }

                ready();
            });
        } else {
            obj = DOCUMENT.createElement("object");
            // TODO: width and height are optional
            obj.type = "text/html";
            obj.data = SANDBOX_URL;
            obj.onload = ready;

            // TODO: check if parent is not null
            node.parentNode.insertBefore(obj, node);
        }

        return new $Element(obj);
    }
});
