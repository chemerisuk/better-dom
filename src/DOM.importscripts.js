define(["DOM", "Element"], function(DOM, _forEach, _makeError, _slice) {
    "use strict";

    // IMPORT SCRIPTS
    // --------------

    DOM.importScripts = function() {
        var args = _slice(arguments),
            body = DOM.find("body"),
            n = args.length - 1,
            callback;

        if (n > 0 && typeof args[n] === "function") {
            callback = (function(callback) { if (!--n) callback() }(args.pop()));
        }

        _forEach(args, function(url) {
            if (typeof url !== "string") throw _makeError("importScripts", this);

            body.append(DOM.create("script", {src: url, onload: callback})).child(-1).remove();
        });

        return this;
    };
});
