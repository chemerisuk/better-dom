var hooks = {},
    $Element = require("./element"),
    documentElement = document.documentElement;

if (document.addEventListener) {
    hooks.relatedTarget = function(event) {
        return $Element(event.relatedTarget);
    };
} else {
    hooks.relatedTarget = function(event, currentTarget) {
        var propName = ( event.toElement === currentTarget ? "from" : "to" ) + "Element";

        return $Element(event[propName]);
    };

    hooks.defaultPrevented = function(event) {
        return event.returnValue === false;
    };

    hooks.which = function(event) {
        var button = event.button;
        // click: 1 === left; 2 === middle; 3 === right
        return event.keyCode || ( button & 1 ? 1 : ( button & 2 ? 3 : ( button & 4 ? 2 : 0 ) ) );
    };

    hooks.pageX = function(event) {
        return event.clientX + documentElement.scrollLeft - documentElement.clientLeft;
    };

    hooks.pageY = function(event) {
        return event.clientY + documentElement.scrollTop - documentElement.clientTop;
    };
}

module.exports = hooks;
