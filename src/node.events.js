import _ from "./util";
import { $Element } from "./index";
import EventHandler from "./util/eventhandler";

/**
 * Event handling support
 * @module events
 * @see https://github.com/chemerisuk/better-dom/wiki/Event-handling
 */

/**
 * Bind a DOM event
 * @memberOf module:events
 * @param  {String|Array}    type event type(s) with optional selector
 * @param  {Function|String} callback event callback or property name (for late binding)
 * @param  {Array}           [props] array of event properties to pass into the callback
 * @return {$Element}
 */
$Element.prototype.on = function(type, callback, props, /*INTERNAL*/once) {
    var eventType = typeof type,
        selector, index, args;

    if (eventType === "string") {
        index = type.indexOf(" ");

        if (~index) {
            selector = type.substr(index + 1);
            type = type.substr(0, index);
        }

        if (!Array.isArray(props)) {
            once = props;
            props = undefined;
        }
    } else if (eventType === "object") {
        if (Array.isArray(type)) {
            args = _.slice.call(arguments, 1);

            type.forEach((name) => { this.on.apply(this, [name].concat(args)) });
        } else {
            _.forOwn(type, (value, name) => { this.on(name, value) });
        }

        return this;
    } else {
        throw _.makeError("on");
    }

    return this.legacy((node, el) => {
        var handler = EventHandler(type, selector, callback, props, el, node, once);

        if (_.DOM2_EVENTS) {
            node.addEventListener(handler._type || type, handler, !!handler.capturing);
        } else {
            // IE8 doesn't support onscroll on document level
            if (el === DOM && type === "scroll") node = window;

            node.attachEvent("on" + (handler._type || type), handler);
        }
        // store event entry
        el._._handlers.push(handler);
    });
};

/**
 * Bind a DOM event but fire once before being removed
 * @memberOf module:events
 * @param  {String|Array}    type event type(s) with optional selector
 * @param  {Function|String} callback event callback or property name (for late binding)
 * @param  {Array}           [props] array of event properties to pass into the callback
 * @return {$Element}
 */
$Element.prototype.once = function(...args) {
    return this.on.apply(this, args.concat(true));
};

/**
 * Unbind an event from the element
 * @memberOf module:events
 * @param  {String}          type type of event
 * @param  {Function|String} [callback] event handler
 * @return {$Element}
 */
$Element.prototype.off = function(type, callback) {
    if (typeof type !== "string") throw _.makeError("off");

    return this.legacy((node, el) => {
        el._._handlers = el._._handlers.filter((handler) => {
            if (type !== handler.type || callback && callback !== handler.callback) return true;

            type = handler._type || handler.type;

            if (_.DOM2_EVENTS) {
                node.removeEventListener(type, handler, !!handler.capturing);
            } else {
                // IE8 doesn't support onscroll on document level
                if (el === DOM && type === "scroll") node = window;

                node.detachEvent("on" + type, handler);
            }
        });
    });
};

/**
 * Triggers an event of specific type with optional extra arguments
 * @memberOf module:events
 * @param  {String}  type  type of event
 * @param  {...Object}     [args]  extra arguments to pass into each event handler
 * @return {Boolean} true if default action wasn't prevented
 */
$Element.prototype.fire = function(type, ...args) {
    var eventType = typeof type,
        handler = {}, hook;

    if (eventType === "string") {
        if (hook = EventHandler.hooks[type]) handler = hook(handler) || handler;

        eventType = handler._type || type;
    } else {
        throw _.makeError("fire");
    }

    return this.every((el) => {
        var node = el._._node,
            e, canContinue;

        if (_.DOM2_EVENTS) {
            e = document.createEvent("HTMLEvents");
            e.initEvent(eventType, true, true);
            e._args = args;

            canContinue = node.dispatchEvent(e);
        } else {
            e = document.createEventObject();
            e._args = args;
            // handle custom events for legacy IE
            if (!("on" + eventType in node)) eventType = "dataavailable";
            // store original event type
            if (eventType === "dataavailable") e.srcUrn = type;

            node.fireEvent("on" + eventType, e);

            canContinue = e.returnValue !== false;
        }

        // Call native method. IE<9 dies on focus/blur to hidden element
        if (canContinue && node[type] && (type !== "focus" && type !== "blur" || node.offsetWidth)) {
            // Prevent re-triggering of the same event
            EventHandler.skip = type;

            node[type]();

            EventHandler.skip = null;
        }

        return canContinue;
    });
};
