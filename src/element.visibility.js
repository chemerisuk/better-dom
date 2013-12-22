var _ = require("./utils"),
    $Element = require("./element"),
    DOM = require("./dom"),
    features = require("./features"),
    makeVisibilityMethod = function(name, fn) {
        var createCallback = function(el) {
                return function() { el.set("aria-hidden", fn) };
            };

        return function(delay) {
            if (delay && (typeof delay !== "number" || delay < 0)) {
                throw _.makeError(name, this);
            }

            if (delay) {
                setTimeout(createCallback(this), delay);

                return this;
            }

            return this.set("aria-hidden", fn);
        };
    };

/**
 * Show element with optional delay
 * @param {Number} [delay=0] time in miliseconds to wait
 * @return {$Element}
 * @function
 */
$Element.prototype.show = makeVisibilityMethod("show", function() {
    return false;
});

/**
 * Hide element with optional delay
 * @param {Number} [delay=0] time in miliseconds to wait
 * @return {$Element}
 * @function
 */
$Element.prototype.hide = makeVisibilityMethod("hide", function() {
    return true;
});

/**
 * Toggle element visibility
 * @param {Number} [delay=0] time in miliseconds to wait
 * @return {$Element}
 */
$Element.prototype.toggle = makeVisibilityMethod("toggle", function(el) {
    return el.get("aria-hidden") !== "true";
});

// [aria-hidden=true] could be overriden only if browser supports animations
// pointer-events:none helps to solve accidental clicks on a hidden element
DOM.importStyles("[aria-hidden=true]", "pointer-events:none; display:none" + (features.CSS3_ANIMATIONS ? "" : " !important"));
