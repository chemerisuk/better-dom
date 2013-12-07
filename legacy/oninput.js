// input event implementation/fixes for IE8-9

if (document.attachEvent) {
    var capturedNode, capturedNodeValue,
        legacyEventHandler = function() {
            if (capturedNode && capturedNode.value !== capturedNodeValue) {
                capturedNodeValue = capturedNode.value;
                // trigger special event that bubbles
                DOM.create(capturedNode).fire("input");
            }
        };

    if (document.createElement("input").oninput === null) {
        // IE9 doesn't fire oninput when text is deleted, so use
        // legacy onselectionchange event to detect such cases
        // http://benalpert.com/2013/06/18/a-near-perfect-oninput-shim-for-ie-8-and-9.html
        document.attachEvent("onselectionchange", legacyEventHandler);
    }

    // input event fix via propertychange
    document.attachEvent("onfocusin", function() {
        var target = window.event.srcElement,
            type = target.type;

        if (capturedNode) {
            capturedNode.detachEvent("onpropertychange", legacyEventHandler);
            capturedNode = undefined;
        }

        if (type === "text" || type === "password" || type === "textarea") {
            (capturedNode = target).attachEvent("onpropertychange", legacyEventHandler);
        }
    });
}
