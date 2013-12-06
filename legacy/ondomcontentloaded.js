// DOMContentLoaded implementation

if (!document.addEventListener) {
    var testDiv = document.createElement("div"),
        isTop, scrollIntervalId, e;

    try {
        isTop = window.frameElement === null;
    } catch (ex) {}

    // DOMContentLoaded approximation that uses a doScroll, as found by
    // Diego Perini: http://javascript.nwbox.com/IEContentLoaded/,
    // but modified by other contributors, including jdalton
    if (testDiv.doScroll && isTop && window.external) {
        scrollIntervalId = setInterval(function() {
            var done = true;

            try {
                testDiv.doScroll();
            } catch (ex) {
                done = false;
            }

            if (done) {
                clearInterval(scrollIntervalId);

                e = document.createEventObject();
                e.srcUrn = "DOMContentLoaded";

                // use ondataavailable to notify about the event
                document.fireEvent("ondataavailable", e);
            }
        }, 30);
    }
}
