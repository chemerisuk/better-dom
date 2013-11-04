var _ = require("./utils"),
    DOM = require("./dom"),
    readyCallbacks = [],
    readyState = document.readyState,
    pageLoaded = function() {
        if (readyCallbacks) {
            // safely trigger callbacks
            _.forEach(readyCallbacks, _.defer);
            // cleanup
            readyCallbacks = null;
        }
    };

if (document.addEventListener) {
    document.addEventListener("DOMContentLoaded", pageLoaded, false);
    window.addEventListener("load", pageLoaded, false);
} else {
    DOM.watch("body", pageLoaded, true);
}

// Catch cases where ready is called after the browser event has already occurred.
// IE10 and lower don't handle "interactive" properly... use a weak inference to detect it
// discovered by ChrisS here: http://bugs.jquery.com/ticket/12282#comment:15
if (document.attachEvent ? readyState === "complete" : readyState !== "loading") {
    pageLoaded();
}

/**
 * Execute callback when DOM will be ready
 * @memberOf DOM
 * @param {Function} callback event listener
 */
DOM.ready = function(callback) {
    if (typeof callback !== "function") {
        throw _.makeError("ready", this);
    }

    if (readyCallbacks) {
        readyCallbacks.push(callback);
    } else {
        _.defer(callback);
    }
};
