/**
* @preserve Form elements fixes for IE8-9
* @copyright 2013-2014 Maksim Chemerisuk
*/
(function() { /* globals window, document, DOM */
    var JSCRIPT_VERSION = window.ScriptEngineMajorVersion;

    JSCRIPT_VERSION = JSCRIPT_VERSION && JSCRIPT_VERSION();

    if (!JSCRIPT_VERSION || JSCRIPT_VERSION > 9) return;

    var capturedNode, capturedNodeValue,
        inputEventHandler = function() {
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
        };

    if (JSCRIPT_VERSION === 9) {
        // IE9 doesn't fire oninput when text is deleted, so use
        // legacy onselectionchange event to detect such cases
        // http://benalpert.com/2013/06/18/a-near-perfect-oninput-shim-for-ie-8-and-9.html
        document.attachEvent("onselectionchange", inputEventHandler);
    }

    // input event fix via propertychange
    document.attachEvent("onfocusin", function() {
        if (capturedNode && JSCRIPT_VERSION < 9) {
            capturedNode.detachEvent("onclick", clickEventHandler);
            capturedNode.detachEvent("onchange", changeEventHandler);
            capturedNode.detachEvent("onpropertychange", inputEventHandler);
        }

        capturedNode = window.event.srcElement;
        capturedNodeValue = capturedNode.value;

        if (JSCRIPT_VERSION < 9) {
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
        }
    });
}());
