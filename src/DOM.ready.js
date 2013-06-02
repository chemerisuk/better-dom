define(["DOM"], function(DOM, createElement, makeError) {
    "use strict";

    /**
     * Execute callback when DOM will be ready
     * @memberOf DOM
     * @param {Function} callback event listener
     * @function
     */
    DOM.ready = (function() {
        var readyCallbacks = [],
            scrollIntervalId,
            safeExecution = function(callback) {
                // wrap callback with setTimeout to protect from unexpected exceptions
                setTimeout(callback, 0);
            },
            pageLoaded = function() {
                if (scrollIntervalId) {
                    clearInterval(scrollIntervalId);
                }

                if (readyCallbacks) {
                    // trigger callbacks
                    _.forEach(readyCallbacks, safeExecution);
                    // cleanup
                    readyCallbacks = null;
                }
            };

        // https://raw.github.com/requirejs/domReady/latest/domReady.js
        
        if (document.addEventListener) {
            document.addEventListener("DOMContentLoaded", pageLoaded, false);
            window.addEventListener("load", pageLoaded, false);
        } else {
            window.attachEvent("onload", pageLoaded);

            (function() {
                var testDiv = createElement("div"),
                    isTop;
                
                try {
                    isTop = window.frameElement === null;
                } catch (e) {}

                //DOMContentLoaded approximation that uses a doScroll, as found by
                //Diego Perini: http://javascript.nwbox.com/IEContentLoaded/,
                //but modified by other contributors, including jdalton
                if (testDiv.doScroll && isTop && window.external) {
                    scrollIntervalId = setInterval(function () {
                        try {
                            testDiv.doScroll();
                            pageLoaded();
                        } catch (e) {}
                    }, 30);
                }
            })();
        }

        // Catch cases where ready is called after the browser event has already occurred.
        // IE10 and lower don't handle "interactive" properly... use a weak inference to detect it
        // discovered by ChrisS here: http://bugs.jquery.com/ticket/12282#comment:15
        if ( document.attachEvent ? document.readyState === "complete" : document.readyState !== "loading") {
            pageLoaded();
        }

        // return implementation
        return function(callback) {
            if (typeof callback !== "function") {
                throw makeError("ready", "DOM");
            }

            if (readyCallbacks) {
                readyCallbacks.push(callback);
            } else {
                safeExecution(callback);
            }
        };
    })();
});