// form element event fixes for IE8-9

if (document.attachEvent) {
    var capturedNode, capturedNodeValue,
        inputEventHandler = function() {
            if (capturedNode && capturedNode.value !== capturedNodeValue) {
                capturedNodeValue = capturedNode.value;
                // trigger special event that bubbles
                DOM.create(capturedNode).fire("input");
            }
        },
        clickEventHandler = function() {
            if (capturedNode && capturedNode.checked !== capturedNodeValue) {
                capturedNodeValue = capturedNode.checked;
                // trigger special event that bubbles
                DOM.create(capturedNode).fire("change");
            }
        },
        changeEventHandler = function() {
            DOM.create(capturedNode).fire("change");
        };

    if (document.createElement("input").oninput === null) {
        // IE9 doesn't fire oninput when text is deleted, so use
        // legacy onselectionchange event to detect such cases
        // http://benalpert.com/2013/06/18/a-near-perfect-oninput-shim-for-ie-8-and-9.html
        document.attachEvent("onselectionchange", inputEventHandler);
    }

    // input event fix via propertychange
    document.attachEvent("onfocusin", function() {
        var target = window.event.srcElement,
            type = target.type;

        if (capturedNode) {
            capturedNode.detachEvent("onclick", clickEventHandler);
            capturedNode.detachEvent("onchange", changeEventHandler);
            capturedNode.detachEvent("onpropertychange", inputEventHandler);
            capturedNode = null;
        }

        if (type === "checkbox" || type === "radio") {
            (capturedNode = target).attachEvent("onclick", clickEventHandler);
            capturedNodeValue = capturedNode.checked;
        } else if (target.nodeType === 1) {
            (capturedNode = target).attachEvent("onchange", changeEventHandler);

            if (type === "text" || type === "password" || type === "textarea") {
                capturedNode.attachEvent("onpropertychange", inputEventHandler);
                capturedNodeValue = capturedNode.value;
            }
        }
    });
}
