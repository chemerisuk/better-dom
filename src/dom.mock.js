var _ = require("./utils"),
    $Element = require("./element"),
    DOM = require("./dom"),
    extensions = require("./dom.extend");

/**
 * Return {@link $Element} initialized with all existing live extensions.
 * Also exposes private event handler functions that aren't usually presented
 * @memberOf DOM
 * @param  {Mixed} [content] HTMLString, EmmetString
 * @param  {Object} [vars]  key/value map of variables in emmet template
 * @return {$Element} mocked instance
 */
DOM.mock = function(content, vars) {
    var el = content ? DOM.create(content, vars) : new $Element(),
        applyWatchers = function(el) {
            _.forEach(extensions, function(ext) { if (ext.accept(el._node)) ext(el, true) });

            el.children().each(applyWatchers);
        };

    if (content) applyWatchers(el);

    return el;
};
