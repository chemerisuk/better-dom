var _ = require("./utils"),
    DOM = require("./dom"),
    readyCallbacks = [],
    readyState = document.readyState;

function pageLoaded() {
    // safely trigger callbacks
    if (readyCallbacks) {
        readyCallbacks.forEach(DOM.dispatch, DOM);
        // cleanup
        readyCallbacks = null;
    }
}

// Catch cases where ready is called after the browser event has already occurred.
// IE10 and lower don't handle "interactive" properly... use a weak inference to detect it
// discovered by ChrisS here: http://bugs.jquery.com/ticket/12282#comment:15
if (document.attachEvent ? readyState === "complete" : readyState !== "loading") {
    pageLoaded();
} else {
    if (_.DOM2_EVENTS) {
        window.addEventListener("load", pageLoaded, false);
        document.addEventListener("DOMContentLoaded", pageLoaded, false);
    } else {
        window.attachEvent("onload", pageLoaded);
        document.attachEvent("ondataavailable", function() {
            if (window.event.srcUrn === "DOMContentLoaded") pageLoaded();
        });
    }
}

/**
 * Execute callback when DOM is ready
 * @memberOf DOM
 * @param {Function} callback event listener
 */
DOM.ready = function(callback) {
    if (typeof callback !== "function") throw _.makeError("ready", true);

    if (readyCallbacks) {
        readyCallbacks.push(callback);
    } else {
        DOM.dispatch(callback);
    }
};
