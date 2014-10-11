(function() {
    var DOM2_EVENTS = !!document.addEventListener;
    var inputEventHandler = function() {
            if (capturedNode && capturedNode.value !== capturedNodeValue) {
                capturedNodeValue = capturedNode.value;
                // trigger custom event that bubbles
                DOM.constructor(capturedNode).fire("input");
            }
        },
        clickEventHandler = function() {
            if (capturedNode && capturedNode.checked !== capturedNodeValue) {
                capturedNodeValue = capturedNode.checked;
                // trigger custom event that bubbles
                DOM.constructor(capturedNode).fire("change");
            }
        },
        changeEventHandler = function() {
            DOM.constructor(capturedNode).fire("change");
        },
        capturedNode, capturedNodeValue;

    if (DOM2_EVENTS) {
        // IE9 doesn't fire oninput when text is deleted, so use
        // legacy onselectionchange event to detect such cases
        // http://benalpert.com/2013/06/18/a-near-perfect-oninput-shim-for-ie-8-and-9.html
        document.attachEvent("onselectionchange", inputEventHandler);
    }

    // input event fix via propertychange
    document.attachEvent("onfocusin", function() {
        if (capturedNode && !DOM2_EVENTS) {
            capturedNode.detachEvent("onclick", clickEventHandler);
            capturedNode.detachEvent("onchange", changeEventHandler);
            capturedNode.detachEvent("onpropertychange", inputEventHandler);
        }

        capturedNode = window.event.srcElement;
        capturedNodeValue = capturedNode.value;

        if (DOM2_EVENTS) return;

        var type = capturedNode.type;

        if (type === "checkbox" || type === "radio") {
            capturedNode.attachEvent("onclick", clickEventHandler);
            capturedNodeValue = capturedNode.checked;
        } else if (capturedNode.nodeType === 1) {
            capturedNode.attachEvent("onchange", changeEventHandler);

            if (type === "text" || type === "password" || type === "textarea") {
                capturedNode.attachEvent("onpropertychange", inputEventHandler);
            }
        }
    });
}());
