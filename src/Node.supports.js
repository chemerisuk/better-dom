define(["Node"], function($Node) {
    "use strict";

    /**
     * Check element capability
     * @param {String} prop property to check
     * @param {String} [tag] name of element to test
     * @return {Boolean} true, if feature is supported
     * @tutorial Feature detection
     */
    $Node.prototype.supports = function(prop, tagName) {
        // http://perfectionkills.com/detecting-event-support-without-browser-sniffing/
        var node = document.createElement(tagName || this._node.tagName || "div"),
            isSupported = prop in node;

        if (!isSupported && !prop.indexOf("on")) {
            node.setAttribute(prop, "return;");

            isSupported = typeof node[prop] === "function";
        }

        return isSupported;
    };
});
