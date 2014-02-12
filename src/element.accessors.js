/**
 * Smart getter and setter support
 * @module accessors
 * @see https://github.com/chemerisuk/better-dom/wiki/Getter-and-setter
 */
var _ = require("./utils"),
    $Element = require("./element"),
    hooks = {get: {}, set: {}};

/**
 * Get property or attribute value by name
 * @memberOf module:accessors
 * @param  {String|Array} [name] property/attribute name or array of names
 * @return {Object} property/attribute value
 */
$Element.prototype.get = function(name) {
    var el = this,
        node = this._node,
        hook = hooks.get[name];

    if (!node) return;

    if (hook || typeof name === "string") {
        return hook ? hook(node, name) : (name in node ? node[name] : node.getAttribute(name));
    }

    if (Array.isArray(name)) return name.reduce(function(r, name) { return r[name] = el.get(name), r }, {});

    throw _.makeError("get");
};

/**
 * Set property/attribute value by name
 * @memberOf module:accessors
 * @param {String}           [name]  property/attribute name
 * @param {String|Function}  value   property/attribute value or function that returns it
 * @return {$Element}
 */
$Element.prototype.set = function(name, value) {
    var nameType = typeof name;

    if (arguments.length === 1 && nameType !== "object") {
        value = name;
        name = undefined;
    }

    return this.legacy(function(node, el, index, ref) {
        var hook = hooks.set[name],
            watchers = el._watchers[name],
            newValue = value, oldValue;

        if (watchers) oldValue = el.get(name);

        if (typeof newValue === "function") newValue = value(el, index, ref);

        if (hook || nameType === "string") {
            if (hook) {
                hook(node, newValue);
            } else if (newValue == null) {
                node.removeAttribute(name);
            } else if (name in node) {
                node[name] = newValue;
            } else {
                node.setAttribute(name, newValue);
            }
        } else if (nameType === "object") {
            return _.forOwn(name, function(value, name) { el.set(name, value) });
        } else {
            throw _.makeError("set");
        }

        if (watchers) watchers.forEach(function(watcher) {
                el.invoke(watcher, name, newValue, oldValue);
            });
        // trigger reflow manually in IE8
        if (!_.DOM2_EVENTS) node.className = node.className;
    });
};

$Element.prototype.watch = function(name, watcher) {
    return this.each(function(el) {
        (el._watchers[name] || (el._watchers[name] = [])).push(watcher);
    });
};

$Element.prototype.unwatch = function(name, watcher) {
    var eq = function(w) { return w === watcher };

    return this.each(function(el) {
        var watchers = el._watchers[name];

        if (watchers) el._watchers[name] = watchers.filter(eq);
    });
};

// $Element.get/$Element.set hooks

hooks.get.undefined = function(node) {
    var name;

    if (node.tagName === "OPTION") {
        name = node.hasAttribute("value") ? "value" : "text";
    } else if (node.tagName === "SELECT") {
        return ~node.selectedIndex ? node.options[node.selectedIndex].value : "";
    } else {
        name = node.type && "value" in node ? "value" : "innerHTML";
    }

    return node[name];
};

hooks.set.undefined = function(node, value) {
    var name;
    // handle numbers, booleans etc.
    value = value == null ? "" : String(value);

    if (node.tagName === "SELECT") {
        // selectbox has special case
        if (_.every.call(node.options, function(o) { return !(o.selected = o.value === value) })) {
            node.selectedIndex = -1;
        }
    } else if (node.type && "value" in node) {
        // for IE use innerText because it doesn't trigger onpropertychange
        name = _.DOM2_EVENTS ? "value" : "innerText";
    } else {
        name = "innerHTML";
    }

    if (name) node[name] = value;
};

hooks.get.type = function(node) {
    // some browsers don't recognize input[type=email] etc.
    return node.getAttribute("type") || node.type;
};

if (!_.DOM2_EVENTS) {
    hooks.get.textContent = function(node) { return node.innerText };
    hooks.set.textContent = function(node, value) {
        node.innerText = value;
    };
}
