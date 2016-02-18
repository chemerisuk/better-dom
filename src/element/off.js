import { register } from "../util/index";
import { MethodError } from "../errors";
import { JSCRIPT_VERSION, RETURN_THIS } from "../const";

register({
    /**
     * Unbind an event from the element
     * @memberof! $Element#
     * @alias $Element#off
     * @param  {String}          type        type of event
     * @param  {String}          [selector]  event selector
     * @param  {Function|String} [callback]  event handler
     * @return {$Element}
     * @example
     * link.off("focus", focusHandler);
     * // removes click for a particular selector
     * link.off("focus", "i", focusHandler);
     * // removes ALL click handlers
     * link.off("click");
     */
    off(type, selector, callback) {
        if (typeof type !== "string") throw new MethodError("off", arguments);

        if (callback === void 0) {
            callback = selector;
            selector = void 0;
        }

        var node = this[0],
            propName = "<%= prop('handler') %>";

        if (this._[propName]) {
            this._[propName] = this._[propName].filter((handler) => {
                var skip = type !== handler.type;

                skip = skip || selector && selector !== handler.selector;
                skip = skip || callback && callback !== handler.callback;

                if (skip) return true;

                type = handler._type || handler.type;
                /* istanbul ignore if */
                if (JSCRIPT_VERSION < 9) {
                    node.detachEvent("on" + type, handler);
                } else {
                    node.removeEventListener(type, handler, !!handler.capturing);
                }
            });
        }

        return this;
    }
}, null, () => RETURN_THIS);
