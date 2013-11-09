var hooks = {},
    $Element = require("./element"),
    features = require("./features"),
    docEl = document.documentElement;

if (features.DOM2_EVENTS) {
    hooks.relatedTarget = function(e) { return $Element(e.relatedTarget) };
} else {
    hooks.relatedTarget = function(e, currentTarget) {
        return $Element(e[(e.toElement === currentTarget ? "from" : "to") + "Element"]);
    };

    hooks.defaultPrevented = function(e) { return e.returnValue === false };

    hooks.which = function(e) { return e.keyCode };

    hooks.button = function(e) {
        var button = e.button;
        // click: 1 === left; 2 === middle; 3 === right
        return button & 1 ? 1 : ( button & 2 ? 3 : ( button & 4 ? 2 : 0 ) );
    };

    hooks.pageX = function(e) {
        return e.clientX + docEl.scrollLeft - docEl.clientLeft;
    };

    hooks.pageY = function(e) {
        return e.clientY + docEl.scrollTop - docEl.clientTop;
    };
}

module.exports = hooks;
