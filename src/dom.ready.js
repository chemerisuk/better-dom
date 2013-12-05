var _ = require("./utils"),
    DOM = require("./dom"),
    features = require("./features"),
    readyCallbacks = [],
    readyState = document.readyState,
    isTop, testDiv, scrollIntervalId;

function pageLoaded() {
    // safely trigger callbacks
    _.forEach(readyCallbacks, setTimeout);
    // cleanup
    readyCallbacks = null;

    if (scrollIntervalId) clearInterval(scrollIntervalId);
}

if (features.DOM2_EVENTS) {
    document.addEventListener("DOMContentLoaded", pageLoaded, false);
    window.addEventListener("load", pageLoaded, false);
} else {
    window.attachEvent("onload", pageLoaded);

    testDiv = document.createElement("div");
    try {
        isTop = window.frameElement === null;
    } catch (e) {}

    // DOMContentLoaded approximation that uses a doScroll, as found by
    // Diego Perini: http://javascript.nwbox.com/IEContentLoaded/,
    // but modified by other contributors, including jdalton
    if (testDiv.doScroll && isTop && window.external) {
        scrollIntervalId = setInterval(function () {
            try {
                testDiv.doScroll();
                pageLoaded();
            } catch (e) {}
        }, 30);
    }
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
