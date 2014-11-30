/**
* @preserve Form events bubbling fixes for IE8
* @copyright 2013-2014 Maksim Chemerisuk
*/
(function() { /* globals window, document, DOM */
    var JSCRIPT_VERSION = window.ScriptEngineMajorVersion;

    JSCRIPT_VERSION = JSCRIPT_VERSION && JSCRIPT_VERSION();

    if (!JSCRIPT_VERSION || JSCRIPT_VERSION > 8) return;

    document.attachEvent("onkeydown", function() {
        var e = window.event,
            target = e.srcElement,
            form = target.form;

        if (form && target.type !== "textarea" && e.keyCode === 13 && e.returnValue !== false) {
            DOM.constructor(form).fire("submit");

            return false;
        }
    });

    document.attachEvent("onclick", function() {
        var target = window.event.srcElement,
            form = target.form,
            type = target.type;

        if (form && (type === "submit" || type === "reset")) {
            // if fake event was canceled cancel this event as well
            // to prevent default native browser behavior
            return DOM.constructor(form).fire(type);
        }
    });
}());
