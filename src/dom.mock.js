var _ = require("./utils"),
    $Element = require("./element"),
    DOM = require("./dom"),
    extensions = require("./dom.extend");

/**
 * Synchronously return dummy {@link $Element} instance specified for optional selector
 * @memberOf DOM
 * @param  {Mixed} [content] mock element content
 * @return {$Element} mock instance
 */
DOM.mock = function(content) {
    var el = content ? DOM.create(content) : new $Element(),
        applyWatchers = function(el) {
            _.forEach(extensions, function(ext) { if (ext.accept(el._node)) ext(el, true) });

            el.children().each(applyWatchers);
        };

    if (content) applyWatchers(el);

    return el;
};
