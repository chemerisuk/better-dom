define(["Node"], function($Node, _createElement) {
    "use strict";

    /**
     * Check element capability
     * @param {String} prop property to check
     * @param {String} [tag] name of element to test
     * @return {Boolean} true, if feature is supported
     * @example
     * input.supports("placeholder");
     * // => true if an input supports placeholders
     * DOM.supports("addEventListener");
     * // => true if browser supports document.addEventListener
     * DOM.supports("oninvalid", "input");
     * // => true if browser supports `invalid` event
     */
    $Node.prototype.supports = function(prop, tagName) {
        tagName = tagName || this && this._node.nodeName.toLowerCase();

        var el = tagName ? _createElement(tagName) : document,
            isSupported = prop in el;

        if (!isSupported && !prop.indexOf("on")) {
            // http://perfectionkills.com/detecting-event-support-without-browser-sniffing/
            el.setAttribute(prop, "return;");

            isSupported = typeof el[prop] === "function";
        }
            
        return isSupported;
    };
});