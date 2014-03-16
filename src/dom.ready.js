var _ = require("./utils"),
    DOM = require("./dom"),
    callbacks = [],
    readyState = document.readyState;

function pageLoaded() {
    // safely trigger stored callbacks
    if (callbacks) callbacks = callbacks.forEach(DOM.dispatch, DOM);
}

// Catch cases where ready is called after the browser event has already occurred.
// IE10 and lower don't handle "interactive" properly... use a weak inference to detect it
// discovered by ChrisS here: http://bugs.jquery.com/ticket/12282#comment:15
if (document.attachEvent ? readyState === "complete" : readyState !== "loading") {
    // use setTimeout to make sure that the dispatch method exists
    setTimeout(pageLoaded, 0);
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

    if (callbacks) {
        callbacks.push(callback);
    } else {
        DOM.dispatch(callback);
    }
};
