var _ = require("./utils"),
    $Element = require("./element"),
    hooks = {};

// firefox doesn't support focusin/focusout events
if ("onfocusin" in document.createElement("a")) {
    _.forOwn({focus: "focusin", blur: "focusout"}, function(value, prop) {
        hooks[prop] = function(handler) { handler._type = value };
    });
} else {
    hooks.focus = hooks.blur = function(handler) {
        handler.capturing = true;
    };
}

if (document.createElement("input").validity) {
    hooks.invalid = function(handler) {
        handler.capturing = true;
    };
}

if (document.attachEvent && !window.CSSKeyframesRule) {
    // input event fix via propertychange
    document.attachEvent("onfocusin", (function() {
        var legacyEventHandler = function() {
                if (capturedNode && capturedNode.value !== capturedNodeValue) {
                    capturedNodeValue = capturedNode.value;
                    // trigger special event that bubbles
                    $Element(capturedNode).fire("input");
                }
            },
            capturedNode, capturedNodeValue;

        if (window.addEventListener) {
            // IE9 doesn't fire oninput when text is deleted, so use
            // legacy onselectionchange event to detect such cases
            // http://benalpert.com/2013/06/18/a-near-perfect-oninput-shim-for-ie-8-and-9.html
            document.attachEvent("onselectionchange", legacyEventHandler);
        }

        return function() {
            var target = window.event.srcElement,
                type = target.type;

            if (capturedNode) {
                capturedNode.detachEvent("onpropertychange", legacyEventHandler);
                capturedNode = undefined;
            }

            if (type === "text" || type === "password" || type === "textarea") {
                (capturedNode = target).attachEvent("onpropertychange", legacyEventHandler);
            }
        };
    })());

    if (!window.addEventListener) {
        // submit event bubbling fix
        document.attachEvent("onkeydown", function() {
            var e = window.event,
                target = e.srcElement,
                form = target.form;

            if (form && target.type !== "textarea" && e.keyCode === 13 && e.returnValue !== false) {
                $Element(form).fire("submit");

                return false;
            }
        });

        document.attachEvent("onclick", (function() {
            var handleSubmit = function() {
                    var form = window.event.srcElement;

                    form.detachEvent("onsubmit", handleSubmit);

                    $Element(form).fire("submit");

                    return false;
                };

            return function() {
                var target = window.event.srcElement,
                    form = target.form;

                if (form && target.type === "submit") {
                    form.attachEvent("onsubmit", handleSubmit);
                }
            };
        })());

        hooks.submit = function(handler) {
            handler.custom = true;
        };
    }
}

module.exports = hooks;
