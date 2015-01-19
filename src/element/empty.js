import { DOM } from "../const";

DOM.register({
    /**
     * Remove child nodes of current element from the DOM
     * @memberof! $Element#
     * @alias $Element#empty
     * @return {$Element}
     * @function
     * @example
     * var div = DOM.create("div>a+b"); // <div><a></a><b></b></div>
     * div.empty();                     // <div></div>
     */
    empty() {
        return this.set("");
    }
}, (methodName, strategy) => strategy, () => function() { return this });
