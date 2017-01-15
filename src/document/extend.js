import { register, filter, each } from "../util/index";
import { JSCRIPT_VERSION, WEBKIT_PREFIX, WINDOW, DOCUMENT, CUSTOM_EVENT_TYPE, RETURN_THIS } from "../const";
import { DocumentTypeError } from "../errors";
import ExtensionHandler from "../util/extensionhandler";

// Inspired by trick discovered by Daniel Buchner:
// https://github.com/csuwldcat/SelectorListener

var cssText;

/* istanbul ignore if */
if (JSCRIPT_VERSION < 10) {
    let legacyScripts = filter.call(DOCUMENT.scripts, (el) => el.src.indexOf("better-dom-legacy.js") >= 0);

    if (legacyScripts.length < 1) {
        throw new Error("In order to use live extensions in IE < 10 you have to include extra files. See <%= pkg.repository.url %>#notes-about-old-ies for details.");
    } else if (DOCUMENT.documentMode < 8) {
        throw new Error("The library does not support quirks mode or legacy versions of Internat Explorer. Check <%= pkg.repository.url %>#browser-support for details.");
    }

    cssText = "-ms-behavior:url(" + legacyScripts[0].src.replace(".js", ".htc") + ") !important";
} else {
    cssText = WEBKIT_PREFIX + "animation-name:<%= prop('DOM') %> !important;";
    cssText += WEBKIT_PREFIX + "animation-duration:1ms !important";
}

register({
    /**
     * Declare a live extension
     * @memberof $Document#
     * @alias $Document#extend
     * @param  {String}           selector         css selector of which elements to capture
     * @param  {Object}           definition       live extension definition
     * @see https://github.com/chemerisuk/better-dom/wiki/Live-extensions
     * @example
     * DOM.extend("selector", {
     *     constructor: function() {
     *         // initialize component
     *     },
     *     publicMethod: function() {
     *         // ...
     *     }
     * });
     */
    extend(selector, definition) {
        if (arguments.length === 1 && typeof selector === "object") {
            // handle case when $Document protytype is extended
            return register(selector);
        } else if (selector === "*") {
            // handle case when $Element protytype is extended
            return register(definition, null, () => RETURN_THIS);
        }

        if (typeof definition === "function") {
            definition = {constructor: definition};
        }

        if (!definition || typeof definition !== "object") {
            throw new DocumentTypeError("extend", arguments);
        }

        var doc = this[0],
            mappings = this._["<%= prop('mappings') %>"];

        if (!mappings) {
            this._["<%= prop('mappings') %>"] = mappings = [];

            /* istanbul ignore if */
            if (JSCRIPT_VERSION < 10) {
                doc.attachEvent("on" + CUSTOM_EVENT_TYPE, () => {
                    var e = WINDOW.event;

                    if (e.srcUrn === CUSTOM_EVENT_TYPE) {
                        mappings.forEach((ext) => { ext(e.srcElement) });
                    }
                });
            } else {
                // declare the fake animation on the first DOM.extend method call
                this.importStyles("@" + WEBKIT_PREFIX + "keyframes <%= prop('DOM') %>", "from {opacity:.99} to {opacity:1}");
                // use capturing to suppress internal animationstart events
                doc.addEventListener(WEBKIT_PREFIX ? "webkitAnimationStart" : "animationstart", (e) => {
                    if (e.animationName === "<%= prop('DOM') %>") {
                        mappings.forEach((ext) => { ext(e.target) });
                        // this is an internal event - stop it immediately
                        e.stopPropagation();
                    }
                }, true);
            }
        }

        var ext = ExtensionHandler(selector, definition, mappings.length);

        mappings.push(ext);
        // live extensions are always async - append CSS asynchronously
        WINDOW.setTimeout(() => {
            // initialize extension manually to make sure that all elements
            // have appropriate methods before they are used in other DOM.extend.
            // Also fixes legacy IEs when the HTC behavior is already attached
            each.call(doc.querySelectorAll(selector), ext);
            // MUST be after querySelectorAll because of legacy IEs quirks
            this.importStyles(selector, cssText);
        }, 0);
    }
});
