var _ = require("utils"),
    $Element = require("element"),
    DOM = require("dom"),
    watchers = {};

/**
 * Define a DOM extension
 * @memberOf DOM
 * @param  {String}          selector extension css selector
 * @param  {Object|Function} mixins   extension mixins/constructor function
 * @see https://github.com/chemerisuk/better-dom/wiki/Living-extensions
 */
DOM.extend = function(selector, mixins) {
    if (typeof mixins === "function") mixins = {constructor: mixins};

    if (!mixins || typeof mixins !== "object") {
        throw _.makeError("extend", this);
    }

    if (selector === "*") {
        // extending element prototype
        _.extend($Element.prototype, mixins);
    } else {
        var ctr = mixins.hasOwnProperty("constructor") ? mixins.constructor : null,
            watcher = function(el) {
                _.extend(el, mixins);

                if (ctr) {
                    ctr.call(el);

                    el.constructor = $Element;
                }
            };

        (watchers[selector] = watchers[selector] || []).push(watcher);

        DOM.watch(selector, watcher, true);
    }

    return this;
};

/**
 * Synchronously return dummy {@link $Element} instance specified for optional selector
 * @memberOf DOM
 * @param  {Mixed} [content] mock element content
 * @return {$Element} mock instance
 */
DOM.mock = function(content) {
    var el = content ? DOM.create(content) : new $Element(),
        applyWatchers = function(el) {
            _.forOwn(watchers, function(watchers, selector) {
                if (el.matches(selector)) {
                    _.forEach(watchers, function(watcher) { watcher(el); });
                }
            });

            el.children().each(applyWatchers);
        };

    if (content) applyWatchers(el);

    return el;
};
