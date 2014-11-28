import _ from "../util/index";
import { JSCRIPT_VERSION, DOCUMENT } from "../const";
import { $Element } from "../types";

var sandboxUrl = "about:blank";

if (JSCRIPT_VERSION < 9) {
    let legacyScripts = _.filter.call(DOCUMENT.scripts, (script) => script.src.indexOf("better-dom-legacy.js") >= 0);
    // IE8 fails with about:blank
    sandboxUrl = legacyScripts[0].src.slice(0, -2) + "html";
}

// Inspired by the article written by Daniel Buchner:
// http://www.backalleycoder.com/2014/04/18/element-queries-from-the-feet-up/

_.register({
    shadow(width, height, callback) {
        var node = this[0];
        var sandbox;

        if (JSCRIPT_VERSION < 9) {
            // IE8 is buggy, use insertAdjacentHTML for it
            node.insertAdjacentHTML("beforebegin", DOM.emmet(
                "object[data=`{0}` width=`{1}` height=`{2}` type=`text/html`]",
                [sandboxUrl, width, height])
            );

            sandbox = node.previousSibling;
        } else {
            DOCUMENT.createElement("object");

            // TODO: width and height are optional
            sandbox.type = "text/html";
            sandbox.width = width;
            sandbox.height = height;
            sandbox.data = "about:blank";
            sandbox.onload = () => {
                if (typeof callback === "function") {
                    var api = new $Element(sandbox.contentDocument.documentElement);

                    callback(api);
                }
            };

            // TODO: check if parent is not null
            node.parentNode.insertBefore(sandbox, node);
        }

        return new $Element(sandbox);
    }
});
