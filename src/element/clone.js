import { register } from "../util/index";
import { MethodError } from "../errors";
import { $Element, $NullElement } from "../types";

register({
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

        var node = this[0];

        return new $Element(node.cloneNode(deep));
    }
}, null, () => () => new $NullElement());
