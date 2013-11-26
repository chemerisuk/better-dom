var _ = require("./utils"),
    $Element = require("./element"),
    DOM = require("./dom"),
    features = require("./features"),
    toggleFn = function(el) { return el.get("aria-hidden") !== "true" },
    makeVisibilityMethod = function(name) {
        var createCallback = function(el) {
                return function() { el.set("aria-hidden", name === "hide") };
            };

        return function(delay) {
            if (delay && (typeof delay !== "number" || delay < 0)) {
                throw _.makeError(name, this);
            }

            if (delay) {
                setTimeout(createCallback(this), delay);

                return this;
            }

            return this.set("aria-hidden", name === "hide");
        };

    };

/**
 * Show element
 * @param {Number} [delay=0] time in miliseconds to wait
 * @return {$Element}
 * @function
 */
$Element.prototype.show = makeVisibilityMethod("show");

/**
 * Hide element
 * @param {Number} [delay=0] time in miliseconds to wait
 * @return {$Element}
 * @function
 */
$Element.prototype.hide = makeVisibilityMethod("hide");

/**
 * Toggle element visibility
 * @param {Boolean|Function} [visible] true if the element should be visible and false otherwise
 * @return {$Element}
 */
$Element.prototype.toggle = function(visible) {
    var visibleType = typeof visible,
        value = toggleFn;

    if (visibleType === "boolean") {
        value = !visible;
    } else if (visibleType === "function") {
        value = function(el, index) { return !visible(el, index) };
    } else if (visible) {
        throw _.makeError("toggle", this);
    }

    return this.set("aria-hidden", value);
};

// [aria-hidden=true] could be overriden only if browser supports animations
// pointer-events:none helps to solve accidental clicks on a hidden element
DOM.importStyles("[aria-hidden=true]", "pointer-events:none; display:none" + (features.CSS3_ANIMATIONS ? "" : " !important"));
