var _ = require("./utils"),
    $Node = require("./node"),
    $Element = require("./element"),
    hooks = {get: {}, set: {}};

/**
 * Get property or attribute value by name
 * @memberOf module:accessors
 * @param  {String|Array} [name] property/attribute name or array of names
 * @return {Object} property/attribute value
 */
$Element.prototype.get = function(name) {
    var data = this._data,
        node = this._node,
        hook = hooks.get[name],
        key, value;

    if (!node) return;

    if (hook) return hook(node, name);

    if (typeof name === "string") {
        if (name[0] === "_") {
            key = name.substr(1);

            if (key in data) {
                value = data[key];
            } else {
                try {
                    value = node.getAttribute("data-" + key);
                    // parse object notation syntax
                    if (value[0] === "{" && value[value.length - 1] === "}") {
                        value = JSON.parse(value);
                    }
                } catch (err) { }

                if (value != null) data[key] = value;
            }

            return value;
        }

        return name in node ? node[name] : node.getAttribute(name);
    }

    return $Node.prototype.get.call(this, name);
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

        if (name && name[0] === "_") {
            el._data[name.substr(1)] = newValue;
        } else if (typeof newValue === "function") {
            newValue = value(el, index, ref);
        }

        if (hook) {
            hook(node, newValue);
        } else if (nameType !== "string") {
            return $Node.prototype.set.call(el, name);
        } else if (newValue == null) {
            node.removeAttribute(name);
        } else if (name in node) {
            node[name] = newValue;
        } else {
            node.setAttribute(name, newValue);
        }
        // trigger reflow manually in IE8
        if (!_.DOM2_EVENTS) node.className = node.className;

        if (watchers && oldValue !== newValue) {
            watchers.forEach(function(w) { el.dispatch(w, name, newValue, oldValue) });
        }
    });
};

/**
 * Watch for changes of a particular property/attribute
 * @memberOf module:accessors
 * @param  {String}   name     property/attribute name
 * @param  {Function} callback watch callback the accepts (name, newValue, oldValue)
 * @return {$Element}
 */
$Element.prototype.watch = function(name, callback) {
    return this.each(function(el) {
        (el._watchers[name] || (el._watchers[name] = [])).push(callback);
    });
};

/**
 * Disable watching of a particular property/attribute
 * @memberOf module:accessors
 * @param  {String}   name    property/attribute name
 * @param  {Function} callback watch callback the accepts (name, newValue, oldValue)
 * @return {$Element}
 */
$Element.prototype.unwatch = function(name, callback) {
    var eq = function(w) { return w === callback };

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
    hooks.set.textContent = function(node, value) { node.innerText = value };
}
