import _ from "../util/index";
import { MethodError } from "../errors";
import { JSCRIPT_VERSION, DOM } from "../const";
import { $Element, $NullElement } from "../types";

_.register({
    /**
     * Clone element
     * @memberof! $Element#
     * @alias $Element#clone
     * @param {Boolean} deep <code>true</code> if all children should also be cloned, or <code>false</code> otherwise
     * @return {$Element} a clone of current element
     * @example
     * ul.clone();      // => clone of <ul> with all it's children
     * ul.clone(false); // => clone of <ul> element ONLY
     */
    clone(deep) {
        if (typeof deep !== "boolean") throw new MethodError("clone", arguments);

        var node = this[0], result;
        /* istanbul ignore if */
        if (JSCRIPT_VERSION < 9) {
            result = DOM.create(node.outerHTML);

            if (!deep) result.set("");
        } else {
            result = new $Element(node.cloneNode(deep));
        }

        return result;
    }
}, () => {
    return () => new $NullElement();
});
