import _ from "./utils";
import $Node from "./node";
import $Element from "./element";

var hooks = {};

/**
 * Set property/attribute value by name
 * @param {String|Object|Array} [name]  property/attribute name
 * @param {String|Function}     value   property/attribute value or function that returns it
 * @return {$Element}
 */
$Element.prototype.set = function(name, value) {
    var nameType = typeof name;

    if (arguments.length === 1 && nameType !== "object") {
        value = name;
        name = undefined;
    }

    return this.legacy((node, el, index, ref) => {
        var hook = hooks[name],
            watchers = (el._._watchers || {})[name],
            newValue = value, oldValue;

        if (watchers) oldValue = el.get(name);

        if (name && name[0] === "_") {
            el._[name.substr(1)] = newValue;
        } else {
            if (typeof newValue === "function") newValue = value(el, index, ref);

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
            if (!_.DOM2_EVENTS || _.LEGACY_ANDROID) node.className = node.className;
        }

        if (watchers && oldValue !== newValue) {
            watchers.forEach((w) => { el.dispatch(w, newValue, oldValue, name) });
        }
    });
};

/**
 * Watch for changes of a particular property/attribute
 * @param  {String}   name     property/attribute name
 * @param  {Function} callback watch callback the accepts (newValue, oldValue, name)
 * @return {$Element}
 */
$Element.prototype.watch = function(name, callback) {
    return this.each((el) => {
        var watchers = el._._watchers;

        if (!watchers) el.set("__watchers", watchers = {});

        (watchers[name] || (watchers[name] = [])).push(callback);
    });
};

/**
 * Disable watching of a particular property/attribute
 * @param  {String}   name    property/attribute name
 * @param  {Function} callback watch callback the accepts (name, newValue, oldValue)
 * @return {$Element}
 */
$Element.prototype.unwatch = function(name, callback) {
    var eq = (w) => w !== callback;

    return this.each((el) => {
        var watchers = el._._watchers;

        if (watchers) watchers[name] = (watchers[name] || []).filter(eq);
    });
};

// $Element#set hooks

hooks.undefined = function(node, value) {
    var name;
    // handle numbers, booleans etc.
    value = value == null ? "" : String(value);

    if (node.tagName === "SELECT") {
        // selectbox has special case
        if (_.every.call(node.options, (o) => !(o.selected = o.value === value))) {
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

if (!_.DOM2_EVENTS) hooks.textContent = (node, value) => { node.innerText = value };
