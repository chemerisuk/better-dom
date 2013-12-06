var _ = require("./utils"),
    DOM = require("./dom"),
    features = require("./features"),
    readyCallbacks = [],
    readyState = document.readyState;

function pageLoaded() {
    // safely trigger callbacks
    _.forEach(readyCallbacks, setTimeout);
    // cleanup
    readyCallbacks = null;
}

if (features.DOM2_EVENTS) {
    document.addEventListener("DOMContentLoaded", pageLoaded, false);
    window.addEventListener("load", pageLoaded, false);
} else {
    window.attachEvent("onload", pageLoaded);
    document.attachEvent("ondataavailable", function() {
        if (window.event.srcUrn === "DOMContentLoaded") {
            pageLoaded();
        }
    });
}

// Catch cases where ready is called after the browser event has already occurred.
// IE10 and lower don't handle "interactive" properly... use a weak inference to detect it
// discovered by ChrisS here: http://bugs.jquery.com/ticket/12282#comment:15
if (document.attachEvent ? readyState === "complete" : readyState !== "loading") {
    pageLoaded();
}

/**
 * Execute callback when DOM is ready
 * @memberOf DOM
 * @param {Function} callback event listener
 */
DOM.ready = function(callback) {
    if (typeof callback !== "function") throw _.makeError("ready", this);

    if (readyCallbacks) {
        readyCallbacks.push(callback);
    } else {
        setTimeout(callback, 0);
    }
};
