import _ from "../util/index";
import { MethodError } from "../errors";
import { JSCRIPT_VERSION } from "../const";

_.register({
    /**
     * Unbind an event from the element
     * @memberof! $Element#
     * @alias $Element#off
     * @param  {String}          type type of event
     * @param  {Function|String} [callback] event handler
     * @return {$Element}
     * @example
     * link.off("focus", focusHandler);
     * // removes ALL click handlers
     * link.off("click");
     */
    off(type, callback) {
        if (typeof type !== "string") throw new MethodError("off", arguments);

        var node = this[0];

        this._._handlers = this._._handlers.filter((handler) => {
            if (type !== handler.type || callback && callback !== handler.callback) return true;

            type = handler._type || handler.type;
            /* istanbul ignore if */
            if (JSCRIPT_VERSION < 9) {
                node.detachEvent("on" + type, handler);
            } else {
                node.removeEventListener(type, handler, !!handler.capturing);
            }
        });

        return this;
    }
});
