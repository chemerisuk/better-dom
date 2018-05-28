import { $Document } from "../document/index";
import { $Element } from "../element/index";
import { keys, each } from "../util/index";
import { WEBKIT_PREFIX, WINDOW, FAKE_ANIMATION_NAME } from "../const";
import { DocumentTypeError } from "../errors";
import SelectorMatcher from "../util/selectormatcher";

// Inspired by trick discovered by Daniel Buchner:
// https://github.com/csuwldcat/SelectorListener

const extensions = [];
const EVENT_TYPE = WEBKIT_PREFIX ? "webkitAnimationStart" : "animationstart";
const CSS_IMPORT_TEXT = [
    WEBKIT_PREFIX + "animation-name:" + FAKE_ANIMATION_NAME + " !important",
    WEBKIT_PREFIX + "animation-duration:1ms !important"
].join(";");

function applyLiveExtension(definition, node) {
    const el = $Element(node);
    const ctr = definition.constructor;
    // apply all element mixins
    Object.keys(definition).forEach((mixinName) => {
        const mixinProperty = definition[mixinName];
        if (mixinProperty !== ctr) {
            el[mixinName] = mixinProperty;
        }
    });

    if (ctr) ctr.call(el);
}

/**
 * Declare a live extension
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
$Document.prototype.extend = function(selector, definition) {
    const node = this[0];

    if (!node) return this;

    if (arguments.length === 1 && typeof selector === "object") {
        // handle case when $Document protytype is extended
        keys(selector).forEach((key) => {
            $Document.prototype[key] = selector[key];
        });

        return this;
    } else if (selector === "*") {
        // handle case when $Element protytype is extended
        keys(definition).forEach((key) => {
            $Element.prototype[key] = definition[key];
        });

        return this;
    }

    if (typeof definition === "function") {
        definition = {constructor: definition};
    }

    if (!definition || typeof definition !== "object") {
        throw new DocumentTypeError("extend", arguments);
    }

    const matcher = SelectorMatcher(selector);

    extensions.push([matcher, definition]);
    // use capturing to suppress internal animationstart events
    node.addEventListener(EVENT_TYPE, (e) => {
        const node = e.target;

        if (e.animationName === FAKE_ANIMATION_NAME && matcher(node)) {
            e.stopPropagation(); // this is an internal event
            // prevent any future events
            node.style.setProperty(WEBKIT_PREFIX + "animation-name", "none", "important");

            applyLiveExtension(definition, node);
        }
    }, true);

    // initialize extension manually to make sure that all elements
    // have appropriate methods before they are used in other DOM.extend
    // also fix cases when a matched element already has another LE
    each.call(node.querySelectorAll(selector), (node) => {
        // prevent any future events
        node.style.setProperty(WEBKIT_PREFIX + "animation-name", "none", "important");
        // use timeout to invoke constructor safe and async
        WINDOW.setTimeout(() => {
            applyLiveExtension(definition, node);
        }, 0);
    });

    // subscribe selector to a fake animation
    this.importStyles(selector, CSS_IMPORT_TEXT);
};

/**
 * Return {@link $Element} initialized with all existing live extensions.
 * Also exposes private functions that do not usually exist. Accepts the
 * same arguments as {@link DOM.create}
 * @param  {String}       content   HTMLString
 * @param  {Object|Array} [varMap]  key/value map of variables
 * @return {$Element} a mocked instance
 * @see $Document#create
 */
$Document.prototype.mock = function(content) {
    if (!content) return new $Element();

    var result = this.create(content),
        applyExtensions = (node) => {
            extensions.forEach((args) => {
                const matcher = args[0];
                const definition = args[1];

                if (matcher(node)) {
                    applyLiveExtension(definition, node);
                }
            });

            each.call(node.children, applyExtensions);
        };

    if (extensions.length) {
        applyExtensions(result[0]);
    }

    return result;
};
