var _ = require("utils"),
    DOM = require("dom");

/**
 * Import external scripts on the page and call optional callback when it will be done
 * @memberOf DOM
 * @param {...String} urls       script file urls
 * @param {Function}  [callback] callback that is triggered when all scripts are loaded
 */
DOM.importScripts = function() {
    var args = _.slice(arguments),
        context = document.scripts[0],
        callback = function() {
            var arg = args.shift(),
                argType = typeof arg,
                script;

            if (argType === "string") {
                script = document.createElement("script");
                script.src = arg;
                script.onload = callback;
                script.async = true;
                context.parentNode.insertBefore(script, context);
            } else if (!arg.length && argType === "function") {
                arg();
            } else {
                throw _.makeError("importScripts", DOM);
            }
        };

    callback();

    return this;
};
