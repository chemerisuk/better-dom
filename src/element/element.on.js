import _ from "../helpers";
import { MethodError } from "../errors";
import { DOM2_EVENTS } from "../constants";
import { $Element } from "../types";
import EventHandler from "../util/eventhandler";

/**
 * Bind a DOM event
 * @memberof! $Element#
 * @alias $Element#on
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

        if (!_.isArray(props)) {
            once = props;
            props = undefined;
        }
    } else if (eventType === "object") {
        if (_.isArray(type)) {
            args = _.slice.call(arguments, 1);

            type.forEach((name) => { this.on.apply(this, [name].concat(args)) });
        } else {
            _.keys(type).forEach((name) => { this.on(name, type[name]) });
        }

        return this;
    } else {
        throw new MethodError("on");
    }

    return this.legacy((node, el) => {
        var handler = EventHandler(type, selector, callback, props, el, node, once);

        if (DOM2_EVENTS) {
            node.addEventListener(handler._type || type, handler, !!handler.capturing);
        } else {
            node.attachEvent("on" + (handler._type || type), handler);
        }
        // store event entry
        el._._handlers.push(handler);
    });
};

/**
 * Bind a DOM event but fire once before being removed
 * @memberof! $Element#
 * @alias $Element#once
 * @param  {String|Array}    type event type(s) with optional selector
 * @param  {Function|String} callback event callback or property name (for late binding)
 * @param  {Array}           [props] array of event properties to pass into the callback
 * @return {$Element}
 */
$Element.prototype.once = function(...args) {
    return this.on.apply(this, args.concat(true));
};
